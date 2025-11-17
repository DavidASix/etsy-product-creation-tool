import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runCli } from './cli';
import inquirer from 'inquirer';

vi.mock('inquirer');

describe('CLI', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should display welcome message', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ userInput: 'test' });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Hello! Welcome to the Etsy Product Creator CLI.',
    );
  });

  it('should prompt for user input', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ userInput: 'test input' });

    await runCli();

    expect(inquirer.prompt).toHaveBeenCalledWith([
      {
        type: 'input',
        name: 'userInput',
        message: 'Please enter something:',
      },
    ]);
  });

  it('should echo back user input', async () => {
    const testInput = 'Hello World';
    vi.mocked(inquirer.prompt).mockResolvedValue({ userInput: testInput });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith(`You said: ${testInput}`);
  });

  it('should handle empty input', async () => {
    vi.mocked(inquirer.prompt).mockResolvedValue({ userInput: '' });

    await runCli();

    expect(consoleLogSpy).toHaveBeenCalledWith('You said: ');
  });
});
