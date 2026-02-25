

"use client";

import { Character, LivePreviewSettings, ExportRecord, Project, Notification } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Camera, Play, Pause, Download, Loader2, Lock, Share2, Clipboard, ArrowUpRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { Slider } from "../ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { IllustratedModel } from "./illustrated-model";
import { newLogoDataUri } from "@/lib/logo";

type LivePreviewProps = {
  project: Project | undefined;
  character: Character;
  settings: LivePreviewSettings;
  updateSettings: (updates: Partial<LivePreviewSettings>) => void;
  onExport: (newExport: Omit<ExportRecord, 'id' | 'version' | 'timestamp'>) => void;
  userTier: 'free' | 'pro' | 'premium';
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
};

const TIER_LIMITS = {
  free: { exports: 3 },
  pro: { exports: Infinity },
  premium: { exports: Infinity },
};

export function LivePreview({ project, character, settings, updateSettings, onExport, userTier, addNotification }: LivePreviewProps) {
  const { toast } = useToast();
  const {
    animationState,
    expressionState,
    pose,
    cameraView,
    background,
    isCaptureMode,
    script,
    subtitleStyle,
    brandOverlay,
    aspectRatio,
    videoDuration,
    watermark,
    showWatermarkOnPreview,
  } = settings;

  const [isTalking, setIsTalking] = useState(false);
  const [tempExpression, setTempExpression] = useState(expressionState);
  const talkingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [subtitle, setSubtitle] = useState('');
  const subtitleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportConfirmation, setExportConfirmation] = useState<'image' | 'video' | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [exportsRemaining, setExportsRemaining] = useState(TIER_LIMITS.free.exports);
  const [isCopying, setIsCopying] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  useEffect(() => {
    if (userTier === 'free') {
      const today = new Date().toDateString();
      const exportDataJSON = localStorage.getItem('virtubrand_daily_exports');
      if (exportDataJSON) {
        const exportData = JSON.parse(exportDataJSON);
        if (exportData.date === today) {
          setExportsRemaining(Math.max(0, TIER_LIMITS.free.exports - exportData.count));
        } else {
          // Reset for a new day
          localStorage.removeItem('virtubrand_daily_exports');
          setExportsRemaining(TIER_LIMITS.free.exports);
        }
      } else {
        setExportsRemaining(TIER_LIMITS.free.exports);
      }
    } else {
      setExportsRemaining(Infinity);
    }
  }, [userTier]);

  const handleSuccessfulExport = () => {
    if (userTier === 'free') {
      const today = new Date().toDateString();
      const exportDataJSON = localStorage.getItem('virtubrand_daily_exports');
      let count = 1;
      if (exportDataJSON) {
        const exportData = JSON.parse(exportDataJSON);
        if (exportData.date === today) {
          count = exportData.count + 1;
        }
      }
      localStorage.setItem('virtubrand_daily_exports', JSON.stringify({ date: today, count }));
      setExportsRemaining(prev => prev - 1);
    }
  };

  useEffect(() => {
    // Cleanup timeouts on component unmount
    return () => {
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
      }
      if (subtitleIntervalRef.current) {
        clearInterval(subtitleIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (expressionState !== 'talking') {
      setTempExpression(expressionState);
    }
  }, [expressionState]);

  useEffect(() => {
    // If capture mode is enabled, stop any ongoing talking preview.
    if (isCaptureMode && isTalking) {
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
        talkingTimeoutRef.current = null;
      }
      setIsTalking(false);
      updateSettings({ expressionState: tempExpression });
    }
  }, [isCaptureMode, isTalking, updateSettings, tempExpression]);

  const handleExpressionChange = (
    newExpression: "neutral" | "smile" | "serious" | "talking"
  ) => {
    if (isTalking && newExpression !== "talking") {
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
        talkingTimeoutRef.current = null;
      }
      if (subtitleIntervalRef.current) {
        clearInterval(subtitleIntervalRef.current);
        subtitleIntervalRef.current = null;
      }
      setIsTalking(false);
      setSubtitle('');
    }
    updateSettings({ expressionState: newExpression });
  };

  const handleToggleTalking = (overrideDuration?: number) => {
    if (isTalking) {
      // Stop talking
      if (talkingTimeoutRef.current) {
        clearTimeout(talkingTimeoutRef.current);
        talkingTimeoutRef.current = null;
      }
      if (subtitleIntervalRef.current) {
        clearInterval(subtitleIntervalRef.current);
        subtitleIntervalRef.current = null;
      }
      setIsTalking(false);
      updateSettings({ expressionState: tempExpression });
      setSubtitle('');
    } else if (script.trim()) {
      // Start talking
      setIsTalking(true);
      updateSettings({ expressionState: "talking" });

      const words = script.trim().split(/\s+/);
      const wordCount = words.length;
      const talkDuration = overrideDuration || Math.max(1000, wordCount * 400); // ~0.4s per word
      const wordsPerSubtitle = 5; // Show 5 words at a time
      const subtitleChunks: string[] = [];
      for (let i = 0; i < words.length; i += wordsPerSubtitle) {
          subtitleChunks.push(words.slice(i, i + wordsPerSubtitle).join(' '));
      }

      let currentChunkIndex = 0;
      const subtitleDuration = talkDuration / subtitleChunks.length;
      
      setSubtitle(subtitleChunks[0]);
      if (subtitleChunks.length > 1) {
        subtitleIntervalRef.current = setInterval(() => {
            currentChunkIndex++;
            if (currentChunkIndex < subtitleChunks.length) {
                setSubtitle(subtitleChunks[currentChunkIndex]);
            }
        }, subtitleDuration);
      }

      talkingTimeoutRef.current = setTimeout(() => {
        setIsTalking(false);
        updateSettings({ expressionState: tempExpression });
        if (subtitleIntervalRef.current) {
          clearInterval(subtitleIntervalRef.current);
          subtitleIntervalRef.current = null;
        }
        setSubtitle('');
        talkingTimeoutRef.current = null;
      }, talkDuration);
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            updateSettings({ brandOverlay: {...brandOverlay, logo: event.target?.result as string} });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleExportImage = async () => {
    if (userTier === 'free' && exportsRemaining <= 0) {
      toast({
        variant: 'destructive',
        title: 'Export Limit Reached',
        description: 'Upgrade to a Pro plan for unlimited exports.',
      });
      return;
    }
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null, // Keep background from DOM
      });

      // Log to history before download
      const thumbnail = canvas.toDataURL("image/png", 0.5);
      onExport({
        name: project?.name || 'Untitled Image',
        source: 'Manual Builder',
        thumbnail,
        type: 'Image',
        aspectRatio,
        character,
        settings,
      });
      
      const year = new Date().getFullYear();
      const projectName = project?.name.replace(/[\s/\\?%*:|"<>]/g, '_') || 'Project';
      const fileName = `IAS_${projectName}_${year}.png`;

      addNotification({
        title: 'Image Exported',
        description: `"${fileName}" has been saved to your project history.`,
        type: 'export',
        projectId: project?.id,
      });

      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'Image Exported', description: 'Your image has started downloading.' });
      handleSuccessfulExport();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to export image.' });
    } finally {
      setIsExporting(false);
      setExportConfirmation(null);
    }
  };

  const handleExportVideo = async () => {
    if (userTier === 'free' && exportsRemaining <= 0) {
      toast({
        variant: 'destructive',
        title: 'Export Limit Reached',
        description: 'Upgrade to a Pro plan for unlimited exports.',
      });
      return;
    }
    if (!previewRef.current || !isCaptureMode) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please enter capture mode to export.' });
        return;
    }
    if (!script.trim()) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please provide a script to generate a video.' });
        return;
    }
    if (typeof (previewRef.current as any).captureStream !== 'function') {
        toast({ variant: 'destructive', title: 'Unsupported Browser', description: 'Video export is not supported in your browser.' });
        return;
    }

    setIsExporting(true);

    try {
        // Capture thumbnail before starting recording
        const canvas = await html2canvas(previewRef.current, { allowTaint: true, useCORS: true, backgroundColor: null });
        const thumbnail = canvas.toDataURL("image/png", 0.5);
        onExport({
            name: project?.name || 'Untitled Video',
            source: 'Manual Builder',
            thumbnail,
            type: 'Video',
            aspectRatio,
            character,
            settings,
        });

        const year = new Date().getFullYear();
        const projectName = project?.name.replace(/[\s/\\?%*:|"<>]/g, '_') || 'Project';
        const fileName = `IAS_${projectName}_${videoDuration}s_${year}.mp4`;

        addNotification({
            title: 'Video Exported',
            description: `"${fileName}" has been saved to your project history.`,
            type: 'export',
            projectId: project?.id,
        });

        const stream = (previewRef.current as any).captureStream(25); // 25 fps
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            setIsExporting(false);
            setExportConfirmation(null);
            toast({ title: 'Video Exported', description: 'Your video has started downloading.' });
            handleSuccessfulExport();

            if (talkingTimeoutRef.current) clearTimeout(talkingTimeoutRef.current);
            if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
            setIsTalking(false);
            updateSettings({ expressionState: tempExpression });
            setSubtitle('');
        };
        
        recorder.onerror = (e) => {
            console.error('MediaRecorder error:', e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to record video.' });
            setIsExporting(false);
            setExportConfirmation(null);
        }

        handleToggleTalking(videoDuration * 1000);
        recorder.start();
        
        setTimeout(() => {
            if (recorder.state === 'recording') {
                recorder.stop();
            }
        }, videoDuration * 1000);

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start video export.' });
        setIsExporting(false);
        setExportConfirmation(null);
    }
  };

  const handleConfirmExport = () => {
    if (exportConfirmation === 'image') {
        handleExportImage();
    } else if (exportConfirmation === 'video') {
        handleExportVideo();
    }
  };

  const applyPreset = (preset: 'reel' | 'promo' | 'talking') => {
    let description = '';
    const newSettings: Partial<LivePreviewSettings> = { background: 'studio' };

    switch (preset) {
      case 'reel':
        newSettings.aspectRatio = '9:16';
        newSettings.cameraView = 'full';
        description = 'Instagram Reel preset applied (9:16, full body).';
        break;
      case 'promo':
        newSettings.aspectRatio = '1:1';
        newSettings.cameraView = 'full';
        description = 'Product Promo preset applied (1:1, full body).';
        break;
      case 'talking':
        newSettings.aspectRatio = '9:16';
        newSettings.cameraView = 'upper';
        description = 'Talking Head preset applied (9:16, upper body).';
        break;
    }
    updateSettings(newSettings);

    toast({
      title: 'Preset Applied',
      description,
    });
  };

  const handleGeneratePreviewLink = async () => {
    if (!project) {
        toast({ variant: 'destructive', title: 'Error', description: 'No active project selected.' });
        return;
    }
    setIsCopying(true);
    try {
        const data = { 
            character, 
            settings: userTier === 'free' ? {...settings, showWatermarkOnPreview: true} : settings,
            status: project.status,
            feedbackNotes: project.feedbackNotes,
            statusTimestamp: project.statusTimestamp,
            userTier,
        };

        if (data.settings.watermark === 'IAS') {
            data.settings.watermark = newLogoDataUri;
        }
        
        const jsonString = JSON.stringify(data);
        const base64String = btoa(unescape(encodeURIComponent(jsonString)));
        const url = `${window.location.origin}/preview?data=${base64String}`;
        
        setGeneratedLink(url);
    } catch (error) {
        console.error("Failed to generate preview link:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not generate the preview link. Please try again.' });
    } finally {
        setIsCopying(false);
    }
  };

  const isReelPresetActive = aspectRatio === '9:16' && cameraView === 'full' && background === 'studio';
  const isPromoPresetActive = aspectRatio === '1:1' && cameraView === 'full' && background === 'studio';
  const isTalkingHeadPresetActive = aspectRatio === '9:16' && cameraView === 'upper' && background === 'studio';


  return (
    <Card className="sticky top-20" id="live-preview-card">
      <CardHeader>
        <CardTitle>Live Character Preview</CardTitle>
        <CardDescription>
          A real-time preview of your character. Every change is reflected instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          ref={previewRef}
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-lg mb-4 bg-card",
            isCaptureMode && aspectRatio === '9:16' && 'aspect-[9/16]',
            isCaptureMode && aspectRatio === '1:1' && 'aspect-square',
            isCaptureMode && aspectRatio === '16:9' && 'aspect-[16/9]',
            !isCaptureMode && 'aspect-square'
          )}
        >
          {isCaptureMode && (
            <Badge variant="default" className="absolute top-2 right-2 z-10 bg-green-500 text-white">
              Ready for Export
            </Badge>
          )}
          <IllustratedModel
            {...character}
            animationState={animationState}
            expressionState={expressionState}
            pose={pose}
            cameraView={cameraView}
            background={background}
            isCaptureMode={isCaptureMode}
          />
           {(brandOverlay.name || brandOverlay.logo || brandOverlay.cta) && (
            <div className="absolute top-4 left-4 z-10 text-white p-2 rounded-md bg-black/30 text-left space-y-1">
              <div className="flex items-center gap-2">
                {brandOverlay.logo && <img src={brandOverlay.logo} alt="Brand Logo" className="h-8 w-8 object-contain rounded" />}
                {brandOverlay.name && <p className="font-bold text-lg">{brandOverlay.name}</p>}
              </div>
              {brandOverlay.cta && <p className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded text-center">{brandOverlay.cta}</p>}
            </div>
          )}

          {isTalking && subtitle && (
            <div className={cn(
              "absolute left-4 right-4 z-10 text-center",
              subtitleStyle.position === 'top' ? 'top-4' : 'bottom-4'
            )}>
                <p className={cn(
                    "inline-block font-semibold",
                    subtitleStyle.size === 'small' && 'text-sm',
                    subtitleStyle.size === 'medium' && 'text-lg',
                    subtitleStyle.size === 'large' && 'text-xl',
                    subtitleStyle.background && 'bg-black/50 px-3 py-1 rounded-md'
                )}
                style={{ color: subtitleStyle.color }}
                >
                    {subtitle}
                </p>
            </div>
          )}
           {userTier === 'free' && isCaptureMode && watermark && (
            <div className="absolute bottom-2 right-2 z-20 opacity-70">
                {watermark === 'IAS'
                    ? <img src={newLogoDataUri} alt="watermark" className="h-8 w-8 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    : <p className="text-xs text-white bg-black/50 px-2 py-1 rounded font-headline">{watermark}</p>
                }
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Camera &amp; Pose</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Button size="sm" variant={pose === 'left' ? 'default' : 'secondary'} onClick={() => updateSettings({pose: 'left'})} disabled={isCaptureMode || isExporting}>Left</Button>
              <Button size="sm" variant={pose === 'front' ? 'default' : 'secondary'} onClick={() => updateSettings({pose: 'front'})} disabled={isCaptureMode || isExporting}>Front</Button>
              <Button size="sm" variant={pose === 'right' ? 'default' : 'secondary'} onClick={() => updateSettings({pose: 'right'})} disabled={isCaptureMode || isExporting}>Right</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button size="sm" variant={cameraView === 'full' ? 'default' : 'secondary'} onClick={() => updateSettings({cameraView: 'full'})} disabled={isCaptureMode || isExporting}>Full Body</Button>
              <Button size="sm" variant={cameraView === 'upper' ? 'default' : 'secondary'} onClick={() => updateSettings({cameraView: 'upper'})} disabled={isCaptureMode || isExporting}>Upper Body</Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Animation</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Button
                size="sm"
                variant={animationState === "idle" ? "default" : "secondary"}
                onClick={() => updateSettings({animationState: "idle"})}
                disabled={isCaptureMode || isExporting}
              >
                Idle
              </Button>
              <Button
                size="sm"
                variant={animationState === "walk" ? "default" : "secondary"}
                onClick={() => updateSettings({animationState: "walk"})}
                disabled={isCaptureMode || isExporting}
              >
                <Play className="mr-2 h-4 w-4" /> Walk
              </Button>
              <Button
                size="sm"
                variant={animationState === "pointing" ? "default" : "secondary"}
                onClick={() => updateSettings({animationState: "pointing"})}
                disabled={isCaptureMode || isExporting}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" /> Point
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Expression</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button
                size="sm"
                variant={expressionState === "neutral" ? "default" : "secondary"}
                onClick={() => handleExpressionChange("neutral")}
                disabled={isCaptureMode || isExporting}
              >
                Neutral
              </Button>
              <Button
                size="sm"
                variant={expressionState === "smile" ? "default" : "secondary"}
                onClick={() => handleExpressionChange("smile")}
                disabled={isCaptureMode || isExporting}
              >
                Smile
              </Button>
              <Button
                size="sm"
                variant={expressionState === "serious" ? "default" : "secondary"}
                onClick={() => handleExpressionChange("serious")}
                disabled={isCaptureMode || isExporting}
              >
                Serious
              </Button>
              <Button
                size="sm"
                variant={expressionState === "talking" && !isTalking ? "default" : "secondary"}
                onClick={() => handleExpressionChange("talking")}
                disabled={isCaptureMode || isExporting}
              >
                Talking
              </Button>
            </div>
          </div>
           <div>
            <Label className="text-xs text-muted-foreground">Script &amp; Talking Preview</Label>
            <Textarea
              className="mt-1"
              rows={3}
              placeholder="Enter a short script for the talking animation..."
              value={script}
              onChange={(e) => updateSettings({script: e.target.value})}
              disabled={isCaptureMode || isExporting}
            />
            <Button
              className="mt-2 w-full"
              size="sm"
              variant={isTalking ? 'destructive' : 'secondary'}
              onClick={() => handleToggleTalking()}
              disabled={isCaptureMode || !script || isExporting}
            >
              {isTalking ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isTalking ? 'Stop Preview' : 'Play Talking Preview'}
            </Button>
          </div>
           <div>
            <Label className="text-xs text-muted-foreground">Subtitles</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
                <Select
                    value={subtitleStyle.size}
                    onValueChange={(value: 'small' | 'medium' | 'large') => updateSettings({subtitleStyle: {...subtitleStyle, size: value}})}
                    disabled={isCaptureMode || isExporting}
                >
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                    <Switch 
                        id="subtitle-bg" 
                        checked={subtitleStyle.background} 
                        onCheckedChange={(checked) => updateSettings({subtitleStyle: {...subtitleStyle, background: checked}})}
                        disabled={isCaptureMode || isExporting}
                    />
                    <Label htmlFor="subtitle-bg">Background</Label>
                </div>
            </div>
          </div>
           <div>
              <Label className="text-xs text-muted-foreground">Brand Overlay</Label>
              <div className="space-y-2 mt-1">
                  <Input 
                      placeholder="Brand Name"
                      value={brandOverlay.name}
                      onChange={(e) => updateSettings({brandOverlay: {...brandOverlay, name: e.target.value}})}
                      disabled={isCaptureMode || isExporting}
                  />
                  <Input 
                      placeholder="CTA Text (e.g., Buy Now)"
                      value={brandOverlay.cta}
                      onChange={(e) => updateSettings({brandOverlay: {...brandOverlay, cta: e.target.value}})}
                      disabled={isCaptureMode || isExporting}
                  />
                  <Input 
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleLogoUpload}
                      disabled={isCaptureMode || isExporting}
                      className="text-xs"
                  />
              </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Background</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Button size="sm" variant={background === 'plain-light' ? 'default' : 'secondary'} onClick={() => updateSettings({background: 'plain-light'})} disabled={isCaptureMode || isExporting}>Light</Button>
              <Button size="sm" variant={background === 'plain-dark' ? 'default' : 'secondary'} onClick={() => updateSettings({background: 'plain-dark'})} disabled={isCaptureMode || isExporting}>Dark</Button>
              <Button size="sm" variant={background === 'studio' ? 'default' : 'secondary'} onClick={() => updateSettings({background: 'studio'})} disabled={isCaptureMode || isExporting}>Studio</Button>
              <Button size="sm" variant={background === 'indoor' ? 'default' : 'secondary'} onClick={() => updateSettings({background: 'indoor'})} disabled={isCaptureMode || isExporting}>Indoor</Button>
              <Button size="sm" variant={background === 'outdoor' ? 'default' : 'secondary'} onClick={() => updateSettings({background: 'outdoor'})} disabled={isCaptureMode || isExporting}>Outdoor</Button>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Client Preview & Share</Label>
            <div className="space-y-2 mt-1">
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <Label>Show watermark on preview</Label>
                        <p className="text-xs text-muted-foreground">Disabled for Pro and Premium plans.</p>
                    </div>
                    <Switch
                        checked={showWatermarkOnPreview}
                        onCheckedChange={(checked) => updateSettings({ showWatermarkOnPreview: checked })}
                        disabled={isCaptureMode || isExporting || userTier !== 'free'}
                    />
                </div>
                <Button onClick={handleGeneratePreviewLink} className="w-full" variant="outline" disabled={isCaptureMode || isExporting || isCopying}>
                    {isCopying ? <Loader2 className="mr-2 animate-spin" /> : <Share2 className="mr-2" />}
                    {isCopying ? 'Generating...' : 'Share Preview'}
                </Button>
            </div>
        </div>
          
          {isCaptureMode && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-semibold text-foreground">Image &amp; Video Export</h3>
              <div className="space-y-2">
                <Label>Ad Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant={isReelPresetActive ? 'default' : 'secondary'} onClick={() => applyPreset('reel')} disabled={isExporting}>Instagram Reel</Button>
                  <Button size="sm" variant={isPromoPresetActive ? 'default' : 'secondary'} onClick={() => applyPreset('promo')} disabled={isExporting}>Product Promo</Button>
                  <Button size="sm" variant={isTalkingHeadPresetActive ? 'default' : 'secondary'} onClick={() => applyPreset('talking')} disabled={isExporting}>Talking Head</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant={aspectRatio === '9:16' ? 'default' : 'secondary'} onClick={() => updateSettings({aspectRatio: '9:16'})} disabled={isExporting}>9:16</Button>
                  <Button size="sm" variant={aspectRatio === '1:1' ? 'default' : 'secondary'} onClick={() => updateSettings({aspectRatio: '1:1'})} disabled={isExporting}>1:1</Button>
                  <Button size="sm" variant={aspectRatio === '16:9' ? 'default' : 'secondary'} onClick={() => updateSettings({aspectRatio: '16:9'})} disabled={isExporting}>16:9</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Video Duration (seconds): {videoDuration}</Label>
                <Slider id="duration" value={[videoDuration]} onValueChange={([val]) => updateSettings({videoDuration: val})} min={5} max={15} step={1} disabled={isExporting}/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setExportConfirmation('image')} disabled={isExporting}>
                      <Download />
                      Export Image (PNG)
                  </Button>
                  <Button onClick={() => setExportConfirmation('video')} disabled={isExporting || !script.trim()}>
                       <Download />
                      Export Video (MP4)
                  </Button>
              </div>
              {isExporting && <p className="text-sm text-muted-foreground text-center">Exporting, please wait...</p>}
            </div>
          )}
        </div>
      </CardContent>
      <Dialog open={!!exportConfirmation} onOpenChange={(isOpen) => !isOpen && !isExporting && setExportConfirmation(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Your Export</DialogTitle>
                <DialogDescription>
                    Please review the settings below before finalizing your export.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium">{project?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Export Type:</span>
                    <span className="font-medium capitalize">{exportConfirmation}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Aspect Ratio:</span>
                    <Badge variant="secondary">{aspectRatio}</Badge>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Watermark:</span>
                    <Badge variant={userTier === 'free' && watermark ? 'default' : 'secondary'}>
                        {userTier === 'free' && watermark ? 'On' : 'Off'}
                    </Badge>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setExportConfirmation(null)} disabled={isExporting}>
                    Back to Edit
                </Button>
                <Button onClick={handleConfirmExport} disabled={isExporting}>
                    {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
                    Confirm Export
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!generatedLink} onOpenChange={(isOpen) => !isOpen && setGeneratedLink(null)}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Share Preview Link</DialogTitle>
                  <DialogDescription>
                      Copy this link and share it with your clients for feedback. The link contains all current character and setting data.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                  <Input value={generatedLink || ''} readOnly />
                  <Button onClick={() => {
                      if (generatedLink) {
                          navigator.clipboard.writeText(generatedLink);
                          toast({ title: 'Copied!', description: 'Link copied to clipboard.' });
                      }
                  }}>
                      <Clipboard className="h-4 w-4" />
                  </Button>
              </div>
              <DialogFooter>
                  <Button variant="secondary" onClick={() => setGeneratedLink(null)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      <CardFooter id="export-controls-card" className="flex-col items-stretch gap-4">
          <Card className="bg-secondary/50 border-primary/20">
              <CardHeader className="p-4">
                  <CardTitle className="text-base">
                      You're on the <span className="capitalize">{userTier}</span> Plan
                  </CardTitle>
                  {userTier === 'free' && (
                    <CardDescription className="text-xs">
                        You have {exportsRemaining} exports remaining today. Upgrade for unlimited, watermark-free exports.
                    </CardDescription>
                  )}
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                  <Button className="w-full" disabled>
                    <Lock className="mr-2 h-4 w-4" />
                    {userTier === 'free' ? 'Upgrade to Pro (Coming Soon)' : 'Manage Plan (Coming Soon)'}
                  </Button>
              </CardFooter>
          </Card>
        <Button
          size="lg"
          variant={isCaptureMode ? "destructive" : "default"}
          className="w-full"
          onClick={() => updateSettings({isCaptureMode: !isCaptureMode})}
          disabled={isExporting}
        >
          <Camera className="mr-2" />
          {isCaptureMode ? "Back to Editor" : "Prepare for Export"}
        </Button>
      </CardFooter>
    </Card>
  );
}
