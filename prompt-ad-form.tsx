"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, ArrowRight, ArrowUp, ArrowDown, Trash2, PlusCircle, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { languages, voiceStyles } from "@/lib/data";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAppData } from "@/app/(main)/_context/app-context";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";

const durations = ["15", "30", "60", "90", "180"];

const promptAdSchema = z.object({
  prompt: z.string().min(20, "Prompt must be at least 20 characters."),
  duration: z.enum(["15", "30", "60", "90", "180"]),
});

type PromptAdFormValues = z.infer<typeof promptAdSchema>;

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
  subtitleLanguage: string;
  showSubtitles: boolean;
};

// This is mock logic to generate a structure.
const generateStructureFromPrompt = (prompt: string, duration: number): AdStructure => {
  const lowerCasePrompt = prompt.toLowerCase();
  let template = "General Showcase";
  let cta = "Learn More";
  let influencerStyle = "Female (Confident)";

  if (lowerCasePrompt.includes("sale") || lowerCasePrompt.includes("discount") || lowerCasePrompt.includes("offer")) {
    template = "Sales Promo";
    cta = "Shop Now!";
    influencerStyle = "Male (Energetic)";
  } else if (lowerCasePrompt.includes("new") || lowerCasePrompt.includes("introducing") || lowerCasePrompt.includes("launch")) {
    template = "Product Launch";
    cta = "Get Early Access";
  } else if (lowerCasePrompt.includes("story") || lowerCasePrompt.includes("journey")) {
    template = "Brand Story";
    cta = "Discover Our Story";
    influencerStyle = "Female (Soft)";
  }

  const sections: AdSection[] = [];
  const sentences = prompt.match(/[^.!?]+[.!?]*/g) || [prompt];
  const numSections = Math.min(Math.max(sentences.length, 1), 5); // 1 to 5 sections
  const baseSectionDuration = Math.floor(duration / numSections);
  let remainingDuration = duration;

  for (let i = 0; i < numSections; i++) {
    const isLast = i === numSections - 1;
    const currentDuration = isLast ? remainingDuration : baseSectionDuration;
    
    let position: AdSection['position'] = 'bottom-right';
    if (i === 0) {
      position = 'full';
    } else if (isLast && (cta.toLowerCase().includes('shop') || cta.toLowerCase().includes('buy'))) {
      position = 'full';
    } else if (lowerCasePrompt.includes('explainer') && !isLast) {
      position = 'bottom-left';
    }

    sections.push({
      id: `section-${Date.now()}-${i}`,
      title: `Section ${i + 1}`,
      duration: currentDuration,
      description: sentences[i]?.trim() || 'Auto-generated content description.',
      position,
    });
    remainingDuration -= currentDuration;
  }
  
  if (sections.length > 0) {
    sections[0].title = 'Intro';
    if (sections.length > 1) {
      sections[sections.length - 1].title = 'Outro / CTA';
    }
  }

  return {
    template,
    cta,
    influencerStyle,
    sections,
    totalDuration: duration,
    subtitleLanguage: 'English',
    showSubtitles: duration > 30 || lowerCasePrompt.includes("explainer"),
  };
};

const tierMap = { free: 0, pro: 1, premium: 2 };

export function PromptAdForm() {
  const [generatedStructure, setGeneratedStructure] = useState<AdStructure | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const { activeProject, userTier } = useAppData();
  const router = useRouter();
  const userTierIndex = tierMap[userTier];

  const form = useForm<PromptAdFormValues>({
    resolver: zodResolver(promptAdSchema),
    defaultValues: {
      prompt: "",
      duration: "30",
    },
  });

  const onSubmit = async (values: PromptAdFormValues) => {
    setIsPending(true);
    setGeneratedStructure(null);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const structure = generateStructureFromPrompt(values.prompt, parseInt(values.duration, 10));
      setGeneratedStructure(structure);
      toast({ title: "Success!", description: "Your editable ad structure has been generated." });
    } catch (error) {
      toast({ variant: "destructive", title: "Uh oh!", description: (error as Error).message });
    } finally {
      setIsPending(false);
    }
  };

  const handleProceedToHybrid = () => {
    if (generatedStructure && activeProject) {
        const setupData = {
            storyboard: generatedStructure,
            projectId: activeProject.id,
        };
        localStorage.setItem('virtubrand_hybrid_ad_setup', JSON.stringify(setupData));
        router.push('/hybrid-ad');
    } else {
        toast({
            variant: "destructive",
            title: "Cannot Proceed",
            description: "Please generate a structure and ensure a project is active.",
        });
    }
  };

  const updateStructure = (updates: Partial<AdStructure>) => {
    setGeneratedStructure(prev => prev ? { ...prev, ...updates } : null);
  };

  const updateSection = (sectionId: string, updates: Partial<AdSection>) => {
    setGeneratedStructure(prev => {
      if (!prev) return null;
      const newSections = prev.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s);
      const newTotalDuration = newSections.reduce((sum, s) => sum + (s.duration || 0), 0);
      return { ...prev, sections: newSections, totalDuration: newTotalDuration };
    });
  };
  
  const addSection = (index: number) => {
    setGeneratedStructure(prev => {
      if (!prev) return null;
      const newSection: AdSection = { id: `section-${Date.now()}`, title: 'New Section', duration: 10, description: '', position: 'bottom-right' };
      const newSections = [...prev.sections];
      newSections.splice(index + 1, 0, newSection);
      const newTotalDuration = newSections.reduce((sum, s) => sum + s.duration, 0);
      return { ...prev, sections: newSections, totalDuration: newTotalDuration };
    });
  };

  const deleteSection = (sectionId: string) => {
    setGeneratedStructure(prev => {
      if (!prev || prev.sections.length <= 1) {
        toast({ variant: 'destructive', title: 'Action not allowed', description: 'You must have at least one section.' });
        return prev;
      }
      const newSections = prev.sections.filter(s => s.id !== sectionId);
      const newTotalDuration = newSections.reduce((sum, s) => sum + s.duration, 0);
      return { ...prev, sections: newSections, totalDuration: newTotalDuration };
    });
  };

  const reorderSection = (index: number, direction: 'up' | 'down') => {
    setGeneratedStructure(prev => {
      if (!prev) return null;
      const newSections = [...prev.sections];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newSections.length) return prev;
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      return { ...prev, sections: newSections };
    });
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <Card className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Prompt & Duration</CardTitle>
              <CardDescription>
                Describe your ad and choose its length.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Prompt</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., A fast-paced ad for a new energy drink, showing someone hiking and then feeling refreshed." rows={5} {...field} />
                    </FormControl>
                    <FormDescription>Be as descriptive as you like.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Video Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {durations.map((d) => (
                          <SelectItem key={d} value={d}>
                            {parseInt(d, 10) >= 60 ? `${parseInt(d, 10)/60} minute(s)` : `${d} seconds`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button size="lg" type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Ad Structure
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card>
          <CardHeader>
            <CardTitle>Editable Ad Structure</CardTitle>
            <CardDescription>Review and customize the generated structure.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <p>Generating...</p>
                </div>
            )}
            {!isPending && generatedStructure ? (
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center bg-muted p-2 rounded-md">
                        <span className="text-muted-foreground">Total Duration:</span>
                        <span className="font-bold text-base">{generatedStructure.totalDuration}s</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Template</Label>
                      <Input value={generatedStructure.template} onChange={e => updateStructure({ template: e.target.value })} />
                    </div>
                     <div className="space-y-2">
                      <Label>CTA Text</Label>
                      <Input value={generatedStructure.cta} onChange={e => updateStructure({ cta: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Influencer Style</Label>
                       <Select value={generatedStructure.influencerStyle} onValueChange={(value) => updateStructure({ influencerStyle: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {voiceStyles.map(style => <SelectItem key={style.id} value={style.name}>{style.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                      <Label>Subtitle Language</Label>
                       <Select value={generatedStructure.subtitleLanguage} onValueChange={(value: string) => updateStructure({ subtitleLanguage: value })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {languages.map(lang => {
                              const languageTierIndex = tierMap[lang.tier];
                              const isLocked = languageTierIndex > userTierIndex;
                              return (
                                <SelectItem key={lang.name} value={lang.name} disabled={isLocked}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{lang.name}</span>
                                    {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="show-subtitles" checked={generatedStructure.showSubtitles} onCheckedChange={(checked) => updateStructure({showSubtitles: checked})} />
                        <Label htmlFor="show-subtitles">Show Subtitles</Label>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <Label className="font-semibold">Sections</Label>
                    <div className="space-y-3">
                      {generatedStructure.sections.map((section, index) => (
                          <div key={section.id} className="p-3 border rounded-lg bg-secondary/30 space-y-2">
                              <div className="flex items-center gap-2">
                                  <div className="flex flex-col">
                                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => reorderSection(index, 'up')} disabled={index === 0}>
                                        <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => reorderSection(index, 'down')} disabled={index === generatedStructure.sections.length - 1}>
                                        <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <Input value={section.title} onChange={(e) => updateSection(section.id, { title: e.target.value })} className="font-semibold h-8" />
                                  <div className="flex items-center gap-1">
                                    <Input type="number" value={section.duration} onChange={(e) => updateSection(section.id, { duration: parseInt(e.target.value, 10) || 0 })} className="w-16 h-8" />
                                    <span className="text-muted-foreground">s</span>
                                  </div>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteSection(section.id)}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                              <Textarea value={section.description} onChange={(e) => updateSection(section.id, { description: e.target.value })} rows={2} placeholder="Section description..." />
                              <div className="flex items-center gap-2 pt-2">
                                  <Label className="text-xs">Presenter:</Label>
                                  <Select value={section.position} onValueChange={(value: AdSection['position']) => updateSection(section.id, { position: value })}>
                                      <SelectTrigger className="h-7 text-xs flex-1"><SelectValue/></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="full">Full Screen</SelectItem>
                                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                          <SelectItem value="top-right">Top Right</SelectItem>
                                          <SelectItem value="top-left">Top Left</SelectItem>
                                          <SelectItem value="hidden">Hidden</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                              <Button variant="outline" size="sm" className="h-7 w-full mt-2" onClick={() => addSection(index)}><PlusCircle className="mr-2"/>Add Section Below</Button>
                          </div>
                      ))}
                    </div>
                     <Button className="w-full mt-4" onClick={handleProceedToHybrid}>
                        Proceed to Hybrid Ad Editor <ArrowRight className="ml-2" />
                     </Button>
                </div>
            ) : (
                 !isPending && (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center p-4">
                        <p className="text-muted-foreground text-center">Your generated ad structure will appear here.</p>
                    </div>
                 )
            )}
          </CardContent>
        </Card>
    </div>
  );
}
