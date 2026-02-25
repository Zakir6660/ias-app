
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Lock } from "lucide-react";
import { languages, tones } from "@/lib/data";
import { useAppData } from "@/app/(main)/_context/app-context";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const quickAdSchema = z.object({
  productMedia: z.any()
    .refine((file) => !!file, "Product image is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
  productName: z.string().min(3, "Product name must be at least 3 characters.").max(50),
  productDescription: z.string().min(10, "Description must be at least 10 characters.").max(200),
  price: z.string().optional(),
  duration: z.enum(['15', '30']),
  tone: z.enum(["Friendly", "Sales", "Professional"]),
  subtitleLanguage: z.string().min(1, "Please select a language."),
});

type QuickAdFormValues = z.infer<typeof quickAdSchema>;

type AdPreview = {
    productImage: string;
    productName: string;
    productDescription: string;
    price?: string;
    cta: string;
}

const tierMap = { free: 0, pro: 1, premium: 2 };

export function QuickAdForm() {
  const [preview, setPreview] = useState<AdPreview | null>(null);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();
  const { userTier } = useAppData();
  const userTierIndex = tierMap[userTier];

  const form = useForm<QuickAdFormValues>({
    resolver: zodResolver(quickAdSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      price: "",
      duration: "15",
      tone: "Friendly",
      subtitleLanguage: "English",
    },
  });

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (values: QuickAdFormValues) => {
    setIsPending(true);
    setPreview(null);
    try {
      const productImage = await fileToDataUri(values.productMedia);
      const cta = values.tone === 'Sales' ? 'Shop Now' : 'Learn More';
      
      setPreview({
          productImage,
          productName: values.productName,
          productDescription: values.productDescription,
          price: values.price,
          cta,
      });

      toast({ title: "Ad Preview Generated!", description: "Your product ad layout is ready below." });
    } catch (error) {
      toast({ variant: "destructive", title: "Uh oh!", description: "Could not generate preview. Please try again." });
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
              <CardTitle>Ad Creation Settings</CardTitle>
              <CardDescription>
                Provide your product details to generate the ad preview.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="productMedia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Image</FormLabel>
                    <FormControl>
                      <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0])} />
                    </FormControl>
                    <FormDescription>Upload a photo of your product (max 5MB).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Supersonic Widget" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your product's key feature or benefit." rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price / Offer (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $19.99 or 50% Off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>
                          {tones.map((tone) => (
                            <SelectItem key={tone} value={tone}>
                              {tone}
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
                  name="subtitleLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
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
                            )
                          })}
                        </SelectContent>
                      </Select>
                       <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button size="lg" type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Generate Ad Preview
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      <Card>
          <CardHeader>
            <CardTitle>Output Preview</CardTitle>
            <CardDescription>This is a simplified layout of your ad.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center p-4 relative overflow-hidden">
                {preview ? (
                    <>
                        <Image src={preview.productImage} fill objectFit="cover" alt={preview.productName} className="opacity-40" />
                        <div className="z-10 text-center bg-black/60 p-6 rounded-lg text-white max-w-sm w-full">
                            <h3 className="text-2xl font-bold font-headline">{preview.productName}</h3>
                            {preview.price && <p className="text-xl text-primary font-semibold my-2">{preview.price}</p>}
                            <p className="text-sm mt-2">{preview.productDescription}</p>
                            <Button className="mt-4">{preview.cta}</Button>
                        </div>
                         <div className="absolute bottom-2 left-2 z-20 text-xs bg-black/50 px-2 py-1 rounded">
                            AI Presenter Overlay
                        </div>
                    </>
                ) : (
                    <p className="text-muted-foreground text-center">Your generated ad preview will appear here.</p>
                )}
            </div>
             <CardDescription className="mt-4 text-center">Note: This is a static layout preview. Video generation and export are subject to your plan.</CardDescription>
          </CardContent>
        </Card>
    </div>
  );
}
