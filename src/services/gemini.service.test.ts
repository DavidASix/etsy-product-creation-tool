/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    it('should generate poster content from prompt', async (): Promise<void> => {
      const mockResponse = {
        text: 'Generated poster content',
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.generatePoster('Test prompt');

      expect(result).toBe('Generated poster content');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-1.5-flash',
          contents: expect.stringContaining('Test prompt'),
        }),
      );
    });

    it('should handle errors when generating poster', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      await expect(geminiService.generatePoster('Test prompt')).rejects.toThrow(
        'Failed to generate poster: API error',
      );
    });

    it('should handle empty response', async () => {
      const mockResponse = {
        text: null,
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      await expect(geminiService.generatePoster('Test prompt')).rejects.toThrow(
        'Failed to generate poster: No content generated',
      );
    });
  });

  describe('generateMockup', () => {
    it('should generate mockup content from poster and prop description', async (): Promise<void> => {
      const mockResponse = {
        text: 'Generated mockup content',
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      const result = await geminiService.generateMockup(
        'Poster description',
        'Prop description',
      );

      expect(result).toBe('Generated mockup content');
      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-1.5-flash',
          contents: expect.stringContaining('Poster description'),
        }),
      );
    });

    it('should handle errors when generating mockup', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API error'));

      await expect(
        geminiService.generateMockup('Poster desc', 'Prop desc'),
      ).rejects.toThrow('Failed to generate mockup: API error');
    });
  });
});
