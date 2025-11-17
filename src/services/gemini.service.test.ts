import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiService } from './gemini.service';

const mockGenerateImages = vi.fn();
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn(function GoogleGenAI() {
      return {
        models: {
          generateImages: mockGenerateImages,
          generateContent: mockGenerateContent,
        },
      };
    }),
  };
});

describe('GeminiService', () => {
  let geminiService: GeminiService;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    mockGenerateImages.mockClear();
    mockGenerateContent.mockClear();
    geminiService = new GeminiService();
  });

  describe('constructor', () => {
    it('should throw error if GEMINI_API_KEY is not set', () => {
      delete process.env.GEMINI_API_KEY;

      expect(() => new GeminiService()).toThrow(
        'GEMINI_API_KEY is not set in environment variables',
      );

      process.env.GEMINI_API_KEY = 'test-api-key';
    });
  });

  describe('generatePoster', () => {
    it('should generate poster image from prompt', async (): Promise<void> => {
      const mockBase64Image = 'base64ImageDataHere';
      const mockResponse = {
        generatedImages: [
          {
            image: {
              imageBytes: mockBase64Image,
            },
          },
        ],
      };

      mockGenerateImages.mockResolvedValue(mockResponse);

      const result = await geminiService.generatePoster('Test prompt');

      expect(result).toBe(mockBase64Image);
      expect(mockGenerateImages).toHaveBeenCalledTimes(1);

      const callArgs = mockGenerateImages.mock.calls[0][0] as {
        model: string;
        prompt: string;
        config: { numberOfImages: number; aspectRatio: string };
      };
      expect(callArgs.model).toBe('imagen-4.0-generate-001');
      expect(callArgs.prompt).toContain('Test prompt');
      expect(callArgs.config.aspectRatio).toBe('27:40');
      expect(callArgs.config.numberOfImages).toBe(1);
    });

    it('should handle errors when generating poster', async () => {
      mockGenerateImages.mockRejectedValue(new Error('API error'));

      await expect(geminiService.generatePoster('Test prompt')).rejects.toThrow(
        'Failed to generate poster: API error',
      );
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        generatedImages: [],
      };

      mockGenerateImages.mockResolvedValue(mockResponse);

      await expect(geminiService.generatePoster('Test prompt')).rejects.toThrow(
        'Failed to generate poster: No image data found in response',
      );
    });
  });

  describe('generateMockup', () => {
    it('should generate mockup image from poster image and prop description', async (): Promise<void> => {
      const mockBase64Mockup = 'base64MockupImageDataHere';
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: mockBase64Mockup,
                    mimeType: 'image/png',
                  },
                },
              ],
            },
          },
        ],
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.generateMockup(
        'base64PosterImageData',
        'Prop description',
      );

      expect(result).toBe(mockBase64Mockup);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);

      const callArgs = mockGenerateContent.mock.calls[0][0] as {
        model: string;
        contents: Array<{
          parts: Array<{
            inlineData?: { mimeType: string; data: string };
            text?: string;
          }>;
        }>;
      };
      expect(callArgs.model).toBe('gemini-2.5-flash-image');
      expect(callArgs.contents[0].parts[0].inlineData?.data).toBe(
        'base64PosterImageData',
      );
      expect(callArgs.contents[0].parts[1].text).toContain('Prop description');
    });

    it('should handle errors when generating mockup', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      await expect(
        geminiService.generateMockup('Poster image data', 'Prop desc'),
      ).rejects.toThrow('Failed to generate mockup: API error');
    });

    it('should use default room description if none provided', async () => {
      const mockBase64Mockup = 'base64MockupImageDataHere';
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: mockBase64Mockup,
                    mimeType: 'image/png',
                  },
                },
              ],
            },
          },
        ],
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      await geminiService.generateMockup('base64PosterImageData', '');

      const callArgs = mockGenerateContent.mock.calls[0][0] as {
        contents: Array<{
          parts: Array<{
            text?: string;
          }>;
        }>;
      };
      expect(callArgs.contents[0].parts[1].text).toContain(
        'modern, minimalist living room',
      );
    });
  });
});
