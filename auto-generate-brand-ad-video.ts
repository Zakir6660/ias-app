'use server';
/**
 * @fileOverview A flow for auto-generating 15-second brand ad videos featuring an AI influencer presenting a product with an AI-generated voice reading the ad script.
 *
 * - autoGenerateBrandAdVideo - A function that handles the ad generation process.
 * - AutoGenerateBrandAdVideoInput - The input type for the autoGenerateBrandAdVideo function.
 * - AutoGenerateBrandAdVideoOutput - The return type for the autoGenerateBrandAdVideo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AutoGenerateBrandAdVideoInputSchema = z.object({
  productMediaDataUri: z
    .string()
    .describe(
      "A photo or video of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."  ),
  adScript: z.string().describe('The ad script for the AI voice to read.'),
  aiVoice: z.string().describe('The voice style to use.'),
  aiVoiceTone: z.enum(['Friendly', 'Professional', 'Sales']).describe('The tone of the AI voice.'),
});
export type AutoGenerateBrandAdVideoInput = z.infer<typeof AutoGenerateBrandAdVideoInputSchema>;

const AutoGenerateBrandAdVideoOutputSchema = z.object({
  adVideoDataUri: z.string().describe('The generated ad video, as a data URI.'),
});
export type AutoGenerateBrandAdVideoOutput = z.infer<typeof AutoGenerateBrandAdVideoOutputSchema>;

export async function autoGenerateBrandAdVideo(input: AutoGenerateBrandAdVideoInput): Promise<AutoGenerateBrandAdVideoOutput> {
  return autoGenerateBrandAdVideoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoGenerateBrandAdVideoPrompt',
  prompt: `You are an AI assistant that generates a brand advertisement video script based on the product and ad script information.

Product Media: {{media url=productMediaDataUri}}
Ad Script: {{{adScript}}}
AI Voice: {{{aiVoice}}}
AI Voice Tone: {{{aiVoiceTone}}}`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const autoGenerateBrandAdVideoFlow = ai.defineFlow(
  {
    name: 'autoGenerateBrandAdVideoFlow',
    inputSchema: AutoGenerateBrandAdVideoInputSchema,
    outputSchema: AutoGenerateBrandAdVideoOutputSchema,
  },
  async input => {
    // Mock video generation (replace with actual AI video generation logic later)
    const mockVideoDataUri = 'data:video/mp4;base64,TBD...';
    
    const voiceName = (() => {
      if (input.aiVoice.startsWith('Female')) return 'Achernar';
      if (input.aiVoice.startsWith('Neutral')) return 'Geminus';
      return 'Algenib'; // Male or default
    })();

    // Generate AI voice-over
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
      prompt: input.adScript,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );    
    const adVideoDataUri = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    // Combine AI voice-over with mock video (replace with actual video editing logic later)

    return { adVideoDataUri };
  }
);
