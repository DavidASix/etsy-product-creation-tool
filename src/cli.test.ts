import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runCli } from './cli';
import inquirer from 'inquirer';

vi.mock('inquirer');
vi.mock('./services/storage.service', () => {
  return {
    StorageService: vi.fn(function StorageService() {
      return {
        initialize: vi.fn().mockResolvedValue(undefined),
        getAllPosters: vi.fn().mockResolvedValue([]),
        getPosterById: vi.fn().mockResolvedValue(null),
        savePoster: vi.fn().mockResolvedValue(undefined),
        saveMockup: vi.fn().mockResolvedValue(undefined),
        getAllMockups: vi.fn().mockResolvedValue([]),
      };
    }),
  };
});
vi.mock('./services/gemini.service', () => {
  return {
    GeminiService: vi.fn(function GeminiService() {
      return {
        generatePoster: vi.fn().mockResolvedValue('Mock poster content'),
        generateMockup: vi.fn().mockResolvedValue('Mock mockup content'),
      };
    }),
  };
});

describe('CLI', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display welcome message', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ action: 'exit' });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '\n🎨 Etsy Product Creation Tool - CLI\n',
    );
  });

  it('should show main menu options', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ action: 'exit' });

    await runCli();

    expect(inquirer.prompt).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'list',
          name: 'action',
          message: 'What would you like to do?',
        }),
      ]),
    );
  });

  it('should exit when user selects exit', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ action: 'exit' });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith('\n👋 Goodbye!\n');
  });

  it('should handle view posters with no posters', async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ action: 'view-posters' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith('\n📭 No posters found.\n');
  });

  it('should handle view mockups with no mockups', async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ action: 'view-mockups' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith('\n📭 No mockups found.\n');
  });

  it('should handle generate mockup with no posters', async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({ action: 'generate-mockup' })
      .mockResolvedValueOnce({ action: 'exit' });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '\n❌ No posters found. Please generate a poster first.\n',
    );
  });
});
