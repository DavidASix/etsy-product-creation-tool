import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageService } from './storage.service';
import * as fs from 'fs/promises';
import { Poster, Mockup } from '../types';

vi.mock('fs/promises');

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = new StorageService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize', () => {
    it('should create directories if they do not exist', async () => {
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await storageService.initialize();

      expect(fs.mkdir).toHaveBeenCalledTimes(2);
      expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('savePoster', () => {
    it('should save poster metadata and image', async () => {
      const poster: Poster = {
        id: '123',
        prompt: 'Test poster',
        imageData: 'Test image data',
        createdAt: new Date(),
        filepath: 'output/posters/123.png',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await storageService.savePoster(poster);

      expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllPosters', () => {
    it('should return all posters', async () => {
      const mockPosters = [
        {
          id: '123',
          prompt: 'Test poster',
          imageData: 'Test data',
          createdAt: new Date().toISOString(),
          filepath: 'output/posters/123.png',
        },
      ];

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPosters));

      const posters = await storageService.getAllPosters();

      expect(posters).toHaveLength(1);
      expect(posters[0].id).toBe('123');
    });

    it('should return empty array if file does not exist', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const posters = await storageService.getAllPosters();

      expect(posters).toEqual([]);
    });
  });

  describe('getPosterById', () => {
    it('should return poster by id', async () => {
      const mockPosters = [
        {
          id: '123',
          prompt: 'Test poster',
          imageData: 'Test data',
          createdAt: new Date().toISOString(),
          filepath: 'output/posters/123.png',
        },
      ];

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPosters));

      const poster = await storageService.getPosterById('123');

      expect(poster).not.toBeNull();
      expect(poster?.id).toBe('123');
    });

    it('should return null if poster not found', async () => {
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));

      const poster = await storageService.getPosterById('999');

      expect(poster).toBeNull();
    });
  });

  describe('saveMockup', () => {
    it('should save mockup metadata and image', async () => {
      const mockup: Mockup = {
        id: '456',
        posterId: '123',
        propDescription: 'Test prop',
        imageData: 'Test mockup data',
        createdAt: new Date(),
        filepath: 'output/mockups/456.txt',
      };

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await storageService.saveMockup(mockup);

      expect(fs.writeFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getAllMockups', () => {
    it('should return all mockups', async () => {
      const mockMockups = [
        {
          id: '456',
          posterId: '123',
          propDescription: 'Test prop',
          imageData: 'Test data',
          createdAt: new Date().toISOString(),
          filepath: 'output/mockups/456.png',
        },
      ];

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockMockups));

      const mockups = await storageService.getAllMockups();

      expect(mockups).toHaveLength(1);
      expect(mockups[0].id).toBe('456');
    });
  });

  describe('getMockupsByPosterId', () => {
    it('should return mockups for a specific poster', async () => {
      const mockMockups = [
        {
          id: '456',
          posterId: '123',
          propDescription: 'Test prop 1',
          imageData: 'Test data',
          createdAt: new Date().toISOString(),
          filepath: 'output/mockups/456.png',
        },
        {
          id: '457',
          posterId: '124',
          propDescription: 'Test prop 2',
          imageData: 'Test data',
          createdAt: new Date().toISOString(),
          filepath: 'output/mockups/457.txt',
        },
      ];

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockMockups));

      const mockups = await storageService.getMockupsByPosterId('123');

      expect(mockups).toHaveLength(1);
      expect(mockups[0].posterId).toBe('123');
    });
  });
});
