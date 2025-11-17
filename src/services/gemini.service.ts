import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const IMAGEN_MODEL = 'imagen-4.0-generate-001';

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
   * Returns base64 encoded PNG image data
   * Posters use 27:40 aspect ratio (portrait movie poster format)
   */
  async generatePoster(prompt: string): Promise<string> {
    try {
      const enhancedPrompt = `Create a high-quality digital poster image for: "${prompt}".
The poster should be visually appealing, professional, and suitable for selling as a digital product on Etsy.`;

      const response = await this.client.models.generateImages({
        model: IMAGEN_MODEL,
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '27:40',
          outputMimeType: 'image/png',
        },
      });

      // Extract image data from response
      const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;

      if (!imageBytes) {
        throw new Error('No image data found in response');
      }

      // Return base64 encoded image data
      return imageBytes;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate poster: ${error.message}`);
      }
      throw new Error('Failed to generate poster: Unknown error');
    }
  }

  /**
   * Generate a mockup image by combining a poster with a prop/scene
   * Returns base64 encoded PNG image data
   * Mockups use 16:9 aspect ratio (standard display format)
   */
  async generateMockup(
    posterImageBase64: string,
    propDescription: string,
  ): Promise<string> {
    try {
      // For mockups, we generate a new image showing the poster in context
      // Since we can't directly composite images with Imagen, we describe what we want
      const mockupPrompt = `Create a realistic, photorealistic product mockup image showing a digital poster displayed ${propDescription}.
The poster should be clearly visible and the mockup should be professional, high-quality, and suitable for an Etsy product listing.
Make it look like a real photograph of the poster in the described setting.`;

      const response = await this.client.models.generateImages({
        model: IMAGEN_MODEL,
        prompt: mockupPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
          outputMimeType: 'image/png',
        },
      });

      // Extract image data from response
      const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;

      if (!imageBytes) {
        throw new Error('No image data found in response');
      }

      // Return base64 encoded image data
      return imageBytes;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate mockup: ${error.message}`);
      }
      throw new Error('Failed to generate mockup: Unknown error');
    }
  }
}
