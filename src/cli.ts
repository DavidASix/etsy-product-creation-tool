import inquirer from 'inquirer';
import { StorageService } from './services/storage.service';
import { GeminiService } from './services/gemini.service';
import { Mockup } from './types';

interface MainMenuAnswer {
  action: 'generate-mockup' | 'view-mockups' | 'exit';
}

interface PosterSelectionAnswer {
  posterId: string;
}

interface MockupPromptAnswer {
  propDescription: string;
}

export async function runCli(): Promise<void> {
  console.log('\n🎨 Etsy Product Creator - Mockup Generator CLI\n');

  const storageService = new StorageService();
  await storageService.initialize();

  let running = true;

  while (running) {
    const { action } = await inquirer.prompt<MainMenuAnswer>([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Generate mockup from poster', value: 'generate-mockup' },
          { name: 'View all mockups', value: 'view-mockups' },
          { name: 'Exit', value: 'exit' },
        ],
      },
    ]);

    switch (action) {
      case 'generate-mockup':
        await generateMockup(storageService);
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

async function generateMockup(storageService: StorageService): Promise<void> {
  const posters = await storageService.getAllPosters();

  if (posters.length === 0) {
    console.log(
      '\n❌ No posters found. Please generate a poster using the UI first.\n',
    );
    return;
  }

  const posterChoices = posters.map((poster) => ({
    name: `${poster.prompt.substring(0, 50)}${poster.prompt.length > 50 ? '...' : ''} (ID: ${poster.id})`,
    value: poster.id,
  }));

  const { posterId } = await inquirer.prompt<PosterSelectionAnswer>([
    {
      type: 'list',
      name: 'posterId',
      message: 'Select a poster to create a mockup for:',
      choices: posterChoices,
    },
  ]);

  const poster = await storageService.getPosterById(posterId);
  if (!poster) {
    console.log('\n❌ Poster not found.\n');
    return;
  }

  const { propDescription } = await inquirer.prompt<MockupPromptAnswer>([
    {
      type: 'input',
      name: 'propDescription',
      message:
        'Describe the mockup scene/prop (e.g., "framed on a white wall in a modern living room"):',
      validate: (input: string) =>
        input.trim() !== '' || 'Please enter a description',
    },
  ]);

  console.log('\n⏳ Generating mockup...\n');

  try {
    const geminiService = new GeminiService();
    const mockupContent = await geminiService.generateMockup(
      poster.imageData,
      propDescription,
    );

    const mockup: Mockup = {
      id: Date.now().toString(),
      posterId: poster.id,
      propDescription,
      imageData: mockupContent,
      createdAt: new Date(),
      filepath: `output/mockups/${Date.now()}.txt`,
    };

    await storageService.saveMockup(mockup);

    console.log('✅ Mockup generated successfully!');
    console.log(`\nMockup ID: ${mockup.id}`);
    console.log(`Saved to: ${mockup.filepath}`);
    console.log(`\nMockup preview:\n`);
    console.log(
      mockupContent.substring(0, 200) +
        (mockupContent.length > 200 ? '...' : ''),
    );
    console.log('\n');
  } catch (error) {
    console.error(
      '\n❌ Error generating mockup:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.log('');
  }
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
