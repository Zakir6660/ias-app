"use server";

import {
  generateAiVoiceOver,
  GenerateAiVoiceOverInput,
} from "@/ai/flows/generate-ai-voice-over";
import {
  autoGenerateBrandAdVideo,
  AutoGenerateBrandAdVideoInput,
} from "@/ai/flows/auto-generate-brand-ad-video";

export async function handleGenerateVoiceOver(
  input: GenerateAiVoiceOverInput
) {
  try {
    const result = await generateAiVoiceOver(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}

export async function handleGenerateBrandAd(
  input: AutoGenerateBrandAdVideoInput
) {
  try {
    const result = await autoGenerateBrandAdVideo(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: (error as Error).message };
  }
}
