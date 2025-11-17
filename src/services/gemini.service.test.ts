import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiService } from './gemini.service';

const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn(function GoogleGenAI() {
      return {
        models: {
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
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: mockBase64Image,
                    mimeType: 'image/png',
                  },
                },
              ],
            },
          },
        ],
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.generatePoster('Test prompt');

      expect(result).toBe(mockBase64Image);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);

      const callArgs = mockGenerateContent.mock.calls[0][0] as {
        model: string;
        contents: string;
      };
      expect(callArgs.model).toBe('gemini-2.5-flash-image');
      expect(callArgs.contents).toContain('Test prompt');
    });

    it('should handle errors when generating poster', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      await expect(geminiService.generatePoster('Test prompt')).rejects.toThrow(
        'Failed to generate poster: API error',
      );
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [],
            },
          },
        ],
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

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
            text?: string;
            inlineData?: { mimeType: string; data: string };
          }>;
        }>;
      };
      expect(callArgs.model).toBe('gemini-2.5-flash-image');
      expect(callArgs.contents[0].parts[0].text).toContain('Prop description');
      expect(callArgs.contents[0].parts[1].inlineData?.data).toBe(
        'base64PosterImageData',
      );
    });

    it('should handle errors when generating mockup', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      await expect(
        geminiService.generateMockup('Poster image data', 'Prop desc'),
      ).rejects.toThrow('Failed to generate mockup: API error');
    });
  });
});
