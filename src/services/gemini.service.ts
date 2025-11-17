import { GoogleGenAI } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const model = 'gemini-2.5-flash-image';

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
   */
  async generatePoster(prompt: string): Promise<string> {
    try {
      const enhancedPrompt = `Create a high-quality digital poster image for: "${prompt}".
The poster should be visually appealing, professional, and suitable for selling as a digital product on Etsy.`;

      const response: GenerateContentResponse =
        await this.client.models.generateContent({
          model,
          contents: enhancedPrompt,
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
        throw new Error(`Failed to generate poster: ${error.message}`);
      }
      throw new Error('Failed to generate poster: Unknown error');
    }
  }

  /**
   * Generate a mockup image by combining a poster with a prop/scene
   * Returns base64 encoded PNG image data
   */
  async generateMockup(
    posterImageBase64: string,
    propDescription: string,
  ): Promise<string> {
    try {
      const mockupPrompt = `Create a realistic product mockup image showing this poster in the following setting: ${propDescription}.
The mockup should be professional, photorealistic, and suitable for an Etsy product listing.`;

      const response: GenerateContentResponse =
        await this.client.models.generateContent({
          model,
          contents: [
            {
              parts: [
                {
                  text: mockupPrompt,
                },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: posterImageBase64,
                  },
                },
              ],
            },
          ],
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
