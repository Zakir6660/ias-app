
"use client";

import { useState, useEffect, useRef } from 'react';
import { useAppData } from '../_context/app-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { IllustratedModel } from '@/components/character-builder/illustrated-model';
import { Loader2, Video, Sparkles, Lock, Star } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

// --- Types (mirrored from prompt-ad-form for consistency) ---
type AdSection = {
  id: string;
  title: string;
  duration: number;
  description: string;
  position: 'full' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'hidden';
};
type AdStructure = {
  template: string;
  cta: string;
  influencerStyle: string;
  sections: AdSection[];
  totalDuration: number;
  subtitleLanguage: any;
  showSubtitles: boolean;
};


export function HybridAdForm({ userTier }: { userTier: 'free' | 'pro' | 'premium' }) {
  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId,
    isLoading: isAppLoading,
  } = useAppData();
  const activeProject = projects.find(p => p.id === activeProjectId);
  const character = activeProject?.character;
  const { toast } = useToast();
  
  // --- State ---
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [storyboard, setStoryboard] = useState<AdStructure | null>(null);
  
  const [currentSection, setCurrentSection] = useState<AdSection | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const [influencerPosition, setInfluencerPosition] = useState('bottom-right');
  const [influencerSize, setInfluencerSize] = useState(30);
  const [isInfluencerVisible, setIsInfluencerVisible] = useState(true);
  const [enableTalking, setEnableTalking] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const subtitleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  
  // --- Effects ---

  // Load storyboard from localStorage on mount
  useEffect(() => {
    try {
      const setupJSON = localStorage.getItem('virtubrand_hybrid_ad_setup');
      if (setupJSON && projects.length > 0) {
        const setupData = JSON.parse(setupJSON);
        const { storyboard: loadedStoryboard, projectId } = setupData;
        const project = projects.find(p => p.id === projectId);
        
        if (project && loadedStoryboard) {
          setActiveProjectId(projectId);
          setStoryboard(loadedStoryboard);
          toast({ title: 'Storyboard Loaded', description: 'Your ad structure has been applied.' });
        }
      }
    } catch (error) {
      console.error('Failed to load storyboard data', error);
      toast({ variant: 'destructive', title: 'Could not load storyboard' });
    } finally {
      // Clear the item so it doesn't load again on refresh
      localStorage.removeItem('virtubrand_hybrid_ad_setup');
    }
  }, [projects, setActiveProjectId, toast]);

  // Determine current section based on video time
  useEffect(() => {
    if (!storyboard || !videoRef.current) return;

    let cumulativeTime = 0;
    const activeSection = storyboard.sections.find(section => {
        cumulativeTime += section.duration;
        return currentTime < cumulativeTime;
    });

    if (activeSection && activeSection.id !== currentSection?.id) {
        setCurrentSection(activeSection);
        setIsInfluencerVisible(activeSection.position !== 'hidden');
        
        if (activeSection.position === 'full') {
            setInfluencerPosition('intro'); // 'intro' is our full-screen style
            setInfluencerSize(60);
        } else if (activeSection.position !== 'hidden') {
            setInfluencerPosition(activeSection.position);
            setInfluencerSize(30);
        }

    } else if (!activeSection && currentSection) {
      setCurrentSection(null);
      setIsInfluencerVisible(false);
    }
  }, [currentTime, storyboard, currentSection]);

  // Handle subtitles and talking animation for the current section
  useEffect(() => {
    if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
    subtitleIntervalRef.current = null;
    
    if (currentSection && isInfluencerVisible && enableTalking && currentSection.description.trim()) {
        setIsTalking(true);

        const words = currentSection.description.trim().split(/\s+/);
        const wordsPerSubtitle = 5;
        const subtitleChunks: string[] = [];
        for (let i = 0; i < words.length; i += wordsPerSubtitle) {
            subtitleChunks.push(words.slice(i, i + wordsPerSubtitle).join(' '));
        }

        if (subtitleChunks.length === 0) {
            setIsTalking(false);
            setCurrentSubtitle('');
            return;
        }

        let currentChunkIndex = 0;
        const subtitleDuration = Math.max(200, (currentSection.duration * 1000) / subtitleChunks.length);
        
        setCurrentSubtitle(subtitleChunks[0]);

        if (subtitleChunks.length > 1) {
            subtitleIntervalRef.current = setInterval(() => {
                currentChunkIndex++;
                if (currentChunkIndex < subtitleChunks.length) {
                    setCurrentSubtitle(subtitleChunks[currentChunkIndex]);
                } else {
                    if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
                }
            }, subtitleDuration);
        }
    } else {
        setIsTalking(false);
        setCurrentSubtitle('');
    }

    return () => {
        if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
    };
  }, [currentSection, isInfluencerVisible, enableTalking]);


  // --- Handlers & Helpers ---
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      setVideoSrc(URL.createObjectURL(file));
      setCurrentTime(0);
      if (videoRef.current) videoRef.current.currentTime = 0;
    } else {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid video file.'})
    }
  };

  const getPositionClasses = () => {
    switch(influencerPosition) {
        case 'top-left': return 'top-4 left-4';
        case 'top-right': return 'top-4 right-4';
        case 'bottom-left': return 'bottom-4 left-4';
        case 'bottom-right': return 'bottom-4 right-4';
        default: return 'bottom-4 right-4'; // Default case
    }
  };

  if (isAppLoading) return <Loader2 className="animate-spin" />;

  // --- Render ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>AI Presenter Settings</CardTitle>
            <CardDescription>Upload your video and configure your AI influencer overlay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Background Video</Label>
              {userTier === 'premium' ? (
                <>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    Upload your real-world footage to serve as the background.
                  </p>
                </>
              ) : (
                <Card className="border-primary/20 bg-muted/50 border-dashed">
                  <CardContent className="pt-6 text-center space-y-2">
                    <p className="font-semibold text-primary">
                      Use Your Own Video Footage
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Premium to upload your own videos and create
                      Hybrid Ads with your AI Presenter.
                    </p>
                    <Link href="/pricing">
                      <Button variant="secondary" className="mt-2">
                        <Star className="mr-2" />
                        Upgrade to Premium
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="space-y-2">
                <Label>Select AI Influencer</Label>
                <p className="text-sm text-muted-foreground !mt-0">Choose a character you've already created.</p>
                {projects.length > 0 ? (
                    <Select value={activeProjectId || ''} onValueChange={setActiveProjectId}>
                        <SelectTrigger className="mt-2"><SelectValue placeholder="Select a project..." /></SelectTrigger>
                        <SelectContent>
                            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : (
                     <Alert className="mt-2">
                        <AlertTitle>No Influencers Found</AlertTitle>
                        <AlertDescription>
                            You need to create a character first. Go to the <Link href="/character-builder" className="font-bold underline text-primary">Character Builder</Link> to get started.
                        </AlertDescription>
                    </Alert>
                )}
                 {character && (
                    <div className="mt-4 flex items-center gap-4 rounded-lg border p-3 bg-muted">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-background shadow-inner border">
                            <IllustratedModel 
                                {...character} animationState="idle" expressionState={'neutral'}
                                pose="front" cameraView="upper" background="transparent" isCaptureMode={true}
                            />
                        </div>
                        <div>
                          <p className="font-semibold">{activeProject?.name}</p>
                          <Badge variant="secondary">Selected Influencer</Badge>
                        </div>
                    </div>
                )}
            </div>

            {storyboard ? (
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <Switch id="talking-anim" checked={enableTalking} onCheckedChange={setEnableTalking} />
                        <Label htmlFor="talking-anim">Enable Presenter Talking</Label>
                    </div>
                    <p className="text-sm text-muted-foreground pl-8">Toggles the talking animation based on the storyboard script.</p>
                </div>
            ) : (
                 <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertTitle>No Storyboard Found</AlertTitle>
                    <AlertDescription>
                        To enable scene-based editing, start from the <Link href="/prompt-ad" className="font-bold underline text-primary">Prompt Ad Builder</Link> first.
                    </AlertDescription>
                </Alert>
            )}
           
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <Button size="lg" disabled={userTier !== 'premium' || !videoSrc}>
                <Sparkles className="mr-2"/> Generate Hybrid Ad
            </Button>
            {userTier === 'premium' && (
                <p className="text-xs text-muted-foreground">Note: This is a UI demonstration. Full video composition is not implemented.</p>
            )}
          </CardFooter>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Live Preview</CardTitle></CardHeader>
        <CardContent>
            <div className={cn("bg-muted rounded-lg flex items-center justify-center relative overflow-hidden aspect-[9/16]")}>
                {videoSrc ? (
                    <video 
                        ref={videoRef} src={videoSrc} controls muted className="w-full h-full object-cover" 
                        onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime)}
                        onPlay={() => videoRef.current?.paused && videoRef.current.play()}
                        onSeeked={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
                    />
                ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <Video className="mx-auto h-12 w-12" />
                        <p className="mt-2 font-semibold">Upload Your Footage</p>
                        <p className="text-xs">
                            {userTier !== 'premium' 
                                ? 'Upgrade to Premium to use your own videos.' 
                                : 'Your video will appear here for preview.'
                            }
                        </p>
                    </div>
                )}

                {/* --- Standard Overlay --- */}
                {character && videoSrc && isInfluencerVisible && influencerPosition !== 'intro' && (
                    <div className={`absolute ${getPositionClasses()} transition-all duration-500 ease-in-out`}
                        style={{ width: `${influencerSize}%`, height: 'auto', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{aspectRatio: '1/1'}}>
                            <IllustratedModel {...character} animationState="idle" expressionState={isTalking ? 'talking' : 'neutral'}
                                pose="front" cameraView="upper" background="transparent" isCaptureMode={false}/>
                        </div>
                    </div>
                )}

                 {/* --- Full-screen "Intro" style Overlay --- */}
                 {character && videoSrc && isInfluencerVisible && influencerPosition === 'intro' && (
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300`} style={{ backgroundColor: `rgba(0, 0, 0, 0.2)` }}>
                         <div style={{width: `${influencerSize}%`}}>
                            <IllustratedModel {...character} animationState="idle" expressionState={isTalking ? 'talking' : 'neutral'}
                                pose="front" cameraView="upper" background="transparent" isCaptureMode={false}/>
                        </div>
                    </div>
                 )}

                 {/* --- Text Overlays --- */}
                 {storyboard?.cta && (
                    <div className="absolute top-4 right-4 z-20"><Badge>{storyboard.cta}</Badge></div>
                 )}
                 {currentSubtitle && storyboard?.showSubtitles && (
                    <div className="absolute bottom-12 left-4 right-4 z-20 text-center">
                        <p className="inline-block font-semibold bg-black/50 px-3 py-1 rounded-md text-white">
                            {currentSubtitle}
                        </p>
                    </div>
                 )}
            </div>
            {storyboard?.totalDuration && (
                <Alert className="mt-4">
                    <AlertTitle>Storyboard Active: {currentSection?.title || 'Video Ended'}</AlertTitle>
                    <AlertDescription>Duration locked to {storyboard.totalDuration}s. To change, start a new storyboard.</AlertDescription>
                </Alert>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
