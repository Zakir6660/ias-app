'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating AI voice overs.
 *
 * It includes the flow definition, input/output schemas, and a wrapper function
 * for generating voice overs with customizable parameters like voice, language, speed,
 * pitch, and emotion.
 *
 * @exports generateAiVoiceOver - The wrapper function to generate AI voice overs.
 * @exports GenerateAiVoiceOverInput - The input type for the generateAiVoiceOver function.
 * @exports GenerateAiVoiceOverOutput - The output type for the generateAiVoiceOver function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import { voiceStyles } from '@/lib/data';

const GenerateAiVoiceOverInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  voice: z.string().describe('The voice style to use.'),
  language: z.enum(['English', 'Hindi', 'Spanish', 'Portuguese', 'French', 'Arabic']).describe('The language of the text.'),
  speed: z.number().min(0.5).max(2).default(1).describe('The speed of the speech (0.5-2).'),
  pitch: z.number().min(-5).max(5).default(0).describe('The pitch of the speech (-5 to 5).'),
  tone: z
    .enum(['Friendly', 'Professional', 'Sales'])
    .describe('The tone to convey in the speech.'),
});

export type GenerateAiVoiceOverInput = z.infer<typeof GenerateAiVoiceOverInputSchema>;

const GenerateAiVoiceOverOutputSchema = z.object({
  media: z
    .string()
    .describe('The generated audio in WAV format as a data URI.'),
});

export type GenerateAiVoiceOverOutput = z.infer<typeof GenerateAiVoiceOverOutputSchema>;

export async function generateAiVoiceOver(input: GenerateAiVoiceOverInput): Promise<GenerateAiVoiceOverOutput> {
  return generateAiVoiceOverFlow(input);
}

const generateAiVoiceOverFlow = ai.defineFlow(
  {
    name: 'generateAiVoiceOverFlow',
    inputSchema: GenerateAiVoiceOverInputSchema,
    outputSchema: GenerateAiVoiceOverOutputSchema,
  },
  async input => {
    const {
      text,
      voice,
    } = input;

    // Map input parameters to TTS configuration
    const selectedVoice = voiceStyles.find(style => style.name === voice);
    const voiceName = selectedVoice ? selectedVoice.voiceName : 'Algenib';


    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No media returned from TTS model.');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

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
