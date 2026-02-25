"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { handleGenerateVoiceOver } from "@/app/actions";
import {
  Form,
  FormControl,
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
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Volume2, Lock } from "lucide-react";
import { languages, voiceStyles, tones } from "@/lib/data";
import { useAppData } from "@/app/(main)/_context/app-context";

const voiceOverSchema = z.object({
  text: z.string().min(10, "Please enter at least 10 characters.").max(500),
  voice: z.string(),
  language: z.enum(["English", "Hindi", "Spanish", "Portuguese", "French", "Arabic"]),
  speed: z.number().min(0.5).max(2),
  pitch: z.number().min(-5).max(5),
  tone: z.enum(["Friendly", "Professional", "Sales"]),
});

type VoiceOverFormValues = z.infer<typeof voiceOverSchema>;

const tierMap = { free: 0, pro: 1, premium: 2 };

export function VoiceOverForm() {
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const { userTier } = useAppData();
  const userTierIndex = tierMap[userTier];

  const form = useForm<VoiceOverFormValues>({
    resolver: zodResolver(voiceOverSchema),
    defaultValues: {
      text: "",
      voice: "Female (Soft)",
      language: "English",
      speed: 1,
      pitch: 0,
      tone: "Friendly",
    },
  });

  const onSubmit = async (values: VoiceOverFormValues) => {
    setIsPending(true);
    setAudioData(null);
    const result = await handleGenerateVoiceOver(values);
    setIsPending(false);

    if (result.success && result.data?.media) {
      setAudioData(result.data.media);
      toast({
        title: "Success!",
        description: "Your AI voice over is ready.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh!",
        description: result.error || "There was a problem generating your voice over.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Voice Over Settings</CardTitle>
              <CardDescription>
                Craft the perfect voice for your content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text to Convert</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the script for the voice over..."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="voice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Style</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {voiceStyles.map((style) => (
                            <SelectItem key={style.id} value={style.name}>
                              {style.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((language) => {
                            const languageTierIndex = tierMap[language.tier];
                            const isLocked = languageTierIndex > userTierIndex;
                            return (
                              <SelectItem key={language.name} value={language.name} disabled={isLocked}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{language.name}</span>
                                  {isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {tones.map((tone) => (
                            <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                  control={form.control}
                  name="speed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speed: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                            min={0.5} max={2} step={0.1}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pitch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pitch: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                            min={-5} max={5} step={0.5}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
               </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Volume2 className="mr-2 h-4 w-4" />
                )}
                Generate Voice Over
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center p-4">
                {audioData ? (
                    <audio controls src={audioData} className="w-full" />
                ) : (
                    <p className="text-muted-foreground text-center">Your generated voice over will appear here.</p>
                )}
            </div>
            <CardDescription className="mt-4 text-center">Note: More languages and voice styles are coming soon.</CardDescription>
          </CardContent>
        </Card>
    </div>
  );
}
