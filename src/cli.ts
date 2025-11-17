import inquirer from 'inquirer';
import { StorageService } from './services/storage.service';
import { GeminiService } from './services/gemini.service';
import { Poster, Mockup } from './types';

type MainMenuAction =
  | 'generate-poster'
  | 'generate-mockup'
  | 'view-posters'
  | 'view-mockups'
  | 'exit';

export async function runCli(): Promise<void> {
  console.log('\n🎨 Etsy Product Creation Tool - CLI\n');

  // Ensure stdin is in raw mode for interactive prompts
  if (process.stdin.isTTY && process.stdin.setRawMode) {
    process.stdin.setRawMode(true);
  }

  const storageService = new StorageService();
  const geminiService = new GeminiService();
  await storageService.initialize();

  let running = true;

  while (running) {
    const { action } = await inquirer.prompt<{ action: MainMenuAction }>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📝 Generate a new poster', value: 'generate-poster' },
          { name: '🖼️  Generate mockup from poster', value: 'generate-mockup' },
          { name: '👀 View all posters', value: 'view-posters' },
          { name: '📋 View all mockups', value: 'view-mockups' },
          { name: '🚪 Exit', value: 'exit' },
        ],
      },
    ]);

    switch (action) {
      case 'generate-poster':
        await generatePoster(storageService, geminiService);
        break;
      case 'generate-mockup':
        await generateMockup(storageService, geminiService);
        break;
      case 'view-posters':
        await viewPosters(storageService);
        break;
      case 'view-mockups':
        await viewMockups(storageService);
        break;
      case 'exit':
        console.log('\n👋 Goodbye!\n');
        running = false;
        break;
    }
  }
}

async function generatePoster(
  storageService: StorageService,
  geminiService: GeminiService,
): Promise<void> {
  const { prompt } = await inquirer.prompt<{ prompt: string }>([
    {
      type: 'input',
      name: 'prompt',
      message: 'Describe the poster you want to create:',
      validate: (input: string) =>
        input.trim() !== '' || 'Please enter a description',
    },
  ]);

  console.log('\n⏳ Generating poster...\n');

  try {
    const posterImageBase64 = await geminiService.generatePoster(prompt);

    const posterId = Date.now().toString();
    const poster: Poster = {
      id: posterId,
      prompt,
      imageData: posterImageBase64,
      createdAt: new Date(),
      filepath: `output/posters/${posterId}.png`,
    };

    await storageService.savePoster(poster);

    console.log('✅ Poster image generated successfully!');
    console.log(`\nPoster ID: ${poster.id}`);
    console.log(`Saved to: ${poster.filepath}`);
    console.log('');
  } catch (error) {
    console.error(
      '\n❌ Error generating poster:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.log('');
  }
}

async function generateMockup(
  storageService: StorageService,
  geminiService: GeminiService,
): Promise<void> {
  const posters = await storageService.getAllPosters();

  if (posters.length === 0) {
    console.log('\n❌ No posters found. Please generate a poster first.\n');
    return;
  }

  const posterChoices = posters.map((poster) => ({
    name: `${poster.prompt.substring(0, 60)}${poster.prompt.length > 60 ? '...' : ''} (Created: ${new Date(poster.createdAt).toLocaleDateString()})`,
    value: poster.id,
  }));

  const { posterId } = await inquirer.prompt<{ posterId: string }>([
    {
      type: 'list',
      name: 'posterId',
      message: 'Select a poster to create a mockup for:',
      choices: posterChoices,
      loop: false,
    },
  ]);

  const poster = await storageService.getPosterById(posterId);
  if (!poster) {
    console.log('\n❌ Poster not found.\n');
    return;
  }

  const { propDescription } = await inquirer.prompt<{
    propDescription: string;
  }>([
    {
      type: 'input',
      name: 'propDescription',
      message:
        'Describe the mockup scene/prop (leave blank for default modern living room):',
    },
  ]);

  console.log('\n⏳ Generating mockup...\n');

  try {
    const mockupImageBase64 = await geminiService.generateMockup(
      poster.imageData,
      propDescription,
    );

    const mockupId = Date.now().toString();
    const mockup: Mockup = {
      id: mockupId,
      posterId: poster.id,
      propDescription,
      imageData: mockupImageBase64,
      createdAt: new Date(),
      filepath: `output/mockups/${mockupId}.png`,
    };

    await storageService.saveMockup(mockup);

    console.log('✅ Mockup image generated successfully!');
    console.log(`\nMockup ID: ${mockup.id}`);
    console.log(`Saved to: ${mockup.filepath}`);
    console.log('');
  } catch (error) {
    console.error(
      '\n❌ Error generating mockup:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.log('');
  }
}

async function viewPosters(storageService: StorageService): Promise<void> {
  const posters = await storageService.getAllPosters();

  if (posters.length === 0) {
    console.log('\n📭 No posters found.\n');
    return;
  }

  console.log(`\n📋 Found ${posters.length} poster(s):\n`);

  for (const poster of posters) {
    console.log(`ID: ${poster.id}`);
    console.log(`Prompt: ${poster.prompt}`);
    console.log(`Created: ${poster.createdAt.toLocaleString()}`);
    console.log(`File: ${poster.filepath}`);
    console.log('---');
  }

  console.log('');
}

async function viewMockups(storageService: StorageService): Promise<void> {
  const mockups = await storageService.getAllMockups();

  if (mockups.length === 0) {
    console.log('\n📭 No mockups found.\n');
    return;
  }

  console.log(`\n📋 Found ${mockups.length} mockup(s):\n`);

  for (const mockup of mockups) {
    const poster = await storageService.getPosterById(mockup.posterId);
    console.log(`ID: ${mockup.id}`);
    console.log(`Poster: ${poster?.prompt.substring(0, 50) || 'Unknown'}`);
    console.log(`Scene: ${mockup.propDescription}`);
    console.log(`Created: ${mockup.createdAt.toLocaleString()}`);
    console.log(`File: ${mockup.filepath}`);
    console.log('---');
  }

  console.log('');
}
