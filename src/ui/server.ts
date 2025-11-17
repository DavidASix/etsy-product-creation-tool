import express, { Request, Response } from 'express';
import path from 'path';
import { GeminiService } from '../services/gemini.service';
import { StorageService } from '../services/storage.service';
import { Poster, PosterGenerationRequest } from '../types';

export class UIServer {
  private app: express.Application;
  private port: number;
  private geminiService: GeminiService;
  private storageService: StorageService;

  constructor(port: number = 3000) {
    this.app = express();
    this.port = port;
    this.geminiService = new GeminiService();
    this.storageService = new StorageService();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.static(path.join(process.cwd(), 'public')));
  }

  private setupRoutes(): void {
    // Serve the main UI
    this.app.get('/', (_req: Request, res: Response) => {
      res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });

    // Generate a poster
    this.app.post('/api/posters', async (req: Request, res: Response) => {
      try {
        const { prompt } = req.body as PosterGenerationRequest;

        if (!prompt) {
          res.status(400).json({ error: 'Prompt is required' });
          return;
        }

        // Generate poster using Gemini
        const posterContent = await this.geminiService.generatePoster(prompt);

        // Create poster object
        const poster: Poster = {
          id: Date.now().toString(),
          prompt,
          imageData: posterContent,
          createdAt: new Date(),
          filepath: `output/posters/${Date.now()}.txt`,
        };

        // Save poster
        await this.storageService.savePoster(poster);

        res.json(poster);
      } catch (error) {
        console.error('Error generating poster:', error);
        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate poster',
        });
      }
    });

    // Get all posters
    this.app.get('/api/posters', async (_req: Request, res: Response) => {
      try {
        const posters = await this.storageService.getAllPosters();
        res.json(posters);
      } catch (error) {
        console.error('Error fetching posters:', error);
        res.status(500).json({
          error:
            error instanceof Error ? error.message : 'Failed to fetch posters',
        });
      }
    });

    // Get a specific poster
    this.app.get('/api/posters/:id', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const poster = await this.storageService.getPosterById(id);

        if (!poster) {
          res.status(404).json({ error: 'Poster not found' });
          return;
        }

        res.json(poster);
      } catch (error) {
        console.error('Error fetching poster:', error);
        res.status(500).json({
          error:
            error instanceof Error ? error.message : 'Failed to fetch poster',
        });
      }
    });
  }

  async start(): Promise<void> {
    await this.storageService.initialize();

    this.app.listen(this.port, () => {
      console.log(`
🎨 Etsy Product Creation Tool UI Server

Server running at: http://localhost:${this.port}
API endpoints:
  - POST /api/posters - Generate a new poster
  - GET  /api/posters - List all posters
  - GET  /api/posters/:id - Get a specific poster

Press Ctrl+C to stop the server
      `);
    });
  }
}
