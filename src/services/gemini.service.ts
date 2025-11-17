import { GoogleGenAI } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

export class GeminiService {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Generate a poster image based on a text prompt
   * Note: Gemini doesn't directly generate images, so we'll use it to generate
   * detailed descriptions that could be used with image generation APIs
   * For this rough implementation, we'll generate a text-based poster
   */
  async generatePoster(prompt: string): Promise<string> {
    try {
      const enhancedPrompt = `Create a detailed description for a digital poster design based on this prompt: "${prompt}".
Include specific details about:
- Layout and composition
- Color scheme
- Typography style
- Visual elements
- Overall mood and aesthetic
- Text content that should appear on the poster

Format your response as a detailed design specification that could be used to create the poster.`;

      const response: GenerateContentResponse =
        await this.client.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: enhancedPrompt,
        });

      const text = response.text;
      if (!text) {
        throw new Error('No content generated');
      }

      return text;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate poster: ${error.message}`);
      }
      throw new Error('Failed to generate poster: Unknown error');
    }
  }

  /**
   * Generate a mockup image by combining a poster with a prop/scene
   * This uses Gemini to generate instructions for mockup creation
   */
  async generateMockup(
    posterDescription: string,
    propDescription: string,
  ): Promise<string> {
    try {
      const mockupPrompt = `You are creating a product mockup for an Etsy listing.

Poster design: ${posterDescription}
Mockup prop/scene: ${propDescription}

Generate a detailed description of how this poster would look when displayed in the specified mockup setting. Include:
- How the poster fits into the scene
- Lighting and shadows
- Perspective and angles
- Environmental details
- How the prop complements the poster
- Overall presentation quality

Format this as a detailed mockup specification.`;

      const response: GenerateContentResponse =
        await this.client.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: mockupPrompt,
        });

      const text = response.text;
      if (!text) {
        throw new Error('No content generated');
      }

      return text;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate mockup: ${error.message}`);
      }
      throw new Error('Failed to generate mockup: Unknown error');
    }
  }
}
