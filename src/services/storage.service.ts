import * as fs from 'fs/promises';
import * as path from 'path';
import { Poster, Mockup } from '../types';

export class StorageService {
  private postersDir: string;
  private mockupsDir: string;
  private postersMetaFile: string;
  private mockupsMetaFile: string;

  constructor() {
    this.postersDir = path.join(process.cwd(), 'output', 'posters');
    this.mockupsDir = path.join(process.cwd(), 'output', 'mockups');
    this.postersMetaFile = path.join(this.postersDir, 'metadata.json');
    this.mockupsMetaFile = path.join(this.mockupsDir, 'metadata.json');
  }

  async initialize(): Promise<void> {
    await fs.mkdir(this.postersDir, { recursive: true });
    await fs.mkdir(this.mockupsDir, { recursive: true });

    // Initialize metadata files if they don't exist
    try {
      await fs.access(this.postersMetaFile);
    } catch {
      await fs.writeFile(this.postersMetaFile, JSON.stringify([], null, 2));
    }

    try {
      await fs.access(this.mockupsMetaFile);
    } catch {
      await fs.writeFile(this.mockupsMetaFile, JSON.stringify([], null, 2));
    }
  }

  async savePoster(poster: Poster): Promise<void> {
    // Save the poster image file
    const imagePath = path.join(this.postersDir, `${poster.id}.png`);
    const imageBuffer = Buffer.from(poster.imageData, 'base64');
    await fs.writeFile(imagePath, imageBuffer);

    // Save the poster metadata (without the large base64 data)
    const posters = await this.getAllPosters();
    posters.push(poster);
    await fs.writeFile(this.postersMetaFile, JSON.stringify(posters, null, 2));
  }

  async getAllPosters(): Promise<Poster[]> {
    try {
      const data = await fs.readFile(this.postersMetaFile, 'utf-8');
      const posters = JSON.parse(data) as Array<{
        id: string;
        prompt: string;
        imageData: string;
        createdAt: string;
        filepath: string;
      }>;
      return posters.map((p) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    } catch {
      return [];
    }
  }

  async getPosterById(id: string): Promise<Poster | null> {
    const posters = await this.getAllPosters();
    return posters.find((p) => p.id === id) || null;
  }

  async saveMockup(mockup: Mockup): Promise<void> {
    // Save the mockup image file
    const imagePath = path.join(this.mockupsDir, `${mockup.id}.png`);
    const imageBuffer = Buffer.from(mockup.imageData, 'base64');
    await fs.writeFile(imagePath, imageBuffer);

    // Save the mockup metadata (without the large base64 data)
    const mockups = await this.getAllMockups();
    mockups.push(mockup);
    await fs.writeFile(this.mockupsMetaFile, JSON.stringify(mockups, null, 2));
  }

  async getAllMockups(): Promise<Mockup[]> {
    try {
      const data = await fs.readFile(this.mockupsMetaFile, 'utf-8');
      const mockups = JSON.parse(data) as Array<{
        id: string;
        posterId: string;
        propDescription: string;
        imageData: string;
        createdAt: string;
        filepath: string;
      }>;
      return mockups.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      }));
    } catch {
      return [];
    }
  }

  async getMockupById(id: string): Promise<Mockup | null> {
    const mockups = await this.getAllMockups();
    return mockups.find((m) => m.id === id) || null;
  }

  async getMockupsByPosterId(posterId: string): Promise<Mockup[]> {
    const mockups = await this.getAllMockups();
    return mockups.filter((m) => m.posterId === posterId);
  }
}
