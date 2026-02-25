
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const scriptedAdSchema = z.object({
  script: z.string().min(20, "Script must be at least 20 characters."),
});

type ScriptedAdFormValues = z.infer<typeof scriptedAdSchema>;

type AdSection = {
  title: string;
  duration: number;
  points: string[];
};

type AdStructure = {
  sections: AdSection[];
  totalDuration: number;
};

const parseScript = (script: string): AdStructure | null => {
  const lines = script.split('\n').filter(line => line.trim() !== '');
  const sections: AdSection[] = [];
  let currentSection: AdSection | null = null;
  let totalDuration = 0;

  const sectionRegex = /^(.*?)\s*\((\d+)\s*s(?:ec)?\)/i;

  for (const line of lines) {
    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      const duration = parseInt(sectionMatch[2], 10);
      currentSection = {
        title: sectionMatch[1].trim(),
        duration,
        points: [],
      };
      totalDuration += duration;
    } else if (currentSection && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
      currentSection.points.push(line.trim().substring(1).trim());
    } else if (currentSection) {
        // if a line doesn't start with - or *, and we are in a section, just add it as a point.
        currentSection.points.push(line.trim());
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    return null;
  }

  return { sections, totalDuration };
};

const defaultScript = `Intro (10s)
- AI influencer welcomes viewers

Section 1 (40s)
- Shop overview

Section 2 (40s)
- Product categories

Section 3 (30s)
- Offers / USP

Outro (10s)
- CTA + location`;

export function ScriptedAdForm() {
  const [generatedStructure, setGeneratedStructure] = useState<AdStructure | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const form = useForm<ScriptedAdFormValues>({
    resolver: zodResolver(scriptedAdSchema),
    defaultValues: {
      script: defaultScript,
    },
  });

  const onSubmit = async (values: ScriptedAdFormValues) => {
    setIsPending(true);
    setGeneratedStructure(null);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const structure = parseScript(values.script);
      if (structure) {
        setGeneratedStructure(structure);
        toast({ title: "Success!", description: "Your ad structure has been parsed." });
      } else {
        toast({ variant: "destructive", title: "Parsing Error", description: "Could not parse the script. Please check the format." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Uh oh!", description: (error as Error).message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Your Script</CardTitle>
              <CardDescription>
                Paste your script below. Use the format: Section Title (XXs or XXsec).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="script"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Script</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Paste your script here..." rows={15} {...field} />
                    </FormControl>
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
            <CardTitle>Generated Structure</CardTitle>
            <CardDescription>This is the parsed structure from your script.</CardDescription>
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
                    <div className="flex justify-between font-medium">
                        <span>Total Duration:</span>
                        <span>{generatedStructure.totalDuration} seconds</span>
                    </div>
                    <div className="space-y-3">
                        {generatedStructure.sections.map((section, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-muted/50">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold">{section.title}</p>
                                    <Badge variant="secondary">{section.duration}s</Badge>
                                </div>
                                {section.points.length > 0 && (
                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                        {section.points.map((point, pIndex) => (
                                            <li key={pIndex}>{point}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                     <Button className="w-full mt-4" onClick={() => toast({title: "Coming Soon!", description: "Proceeding to the full video editor is not yet implemented."})}>
                        Proceed to Editor <ArrowRight className="ml-2" />
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
