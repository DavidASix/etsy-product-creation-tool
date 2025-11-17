import { GoogleGenAI } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const IMAGEN_MODEL = 'imagen-4.0-generate-001';
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

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
   * Posters use 9:16 aspect ratio (portrait format)
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
          aspectRatio: '9:16',
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
   * Uses generateContent to include the actual poster image in the scene
   * Mockups use 4:3 aspect ratio
   */
  async generateMockup(
    posterImageBase64: string,
    propDescription: string,
  ): Promise<string> {
    try {
      // Default to modern living room if no description provided
      const sceneDescription =
        propDescription.trim() ||
        'on the wall in a modern, minimalist living room with neutral tones';

      const mockupPrompt = `Create a photorealistic mockup image showing this poster displayed ${sceneDescription}.
The poster should be clearly visible, well-lit, and professionally presented in the scene.
Make it look like a high-quality product photography suitable for an Etsy listing.
The scene should look natural and inviting, showcasing the poster as the focal point.`;

      // Use generateContent with the poster image as context
      const contents = [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/png',
                data: posterImageBase64,
              },
            },
            {
              text: mockupPrompt,
            },
          ],
        },
      ];

      const response: GenerateContentResponse =
        await this.client.models.generateContent({
          model: GEMINI_IMAGE_MODEL,
          contents: contents,
          config: {
            imageConfig: {
              aspectRatio: '4:3',
            },
          },
        });

      // Extract image data from response
      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error('No content generated');
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          // Return base64 encoded image data
          return part.inlineData.data;
        }
      }

      throw new Error('No image data found in response');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to generate mockup: ${error.message}`);
      }
      throw new Error('Failed to generate mockup: Unknown error');
    }
  }
}
