import inquirer from 'inquirer';

interface CliAnswers {
  userInput: string;
}

export async function runCli(): Promise<void> {
  console.log('Hello! Welcome to the Etsy Product Creator CLI.');

  const answers = await inquirer.prompt<CliAnswers>([
    {
      type: 'input',
      name: 'userInput',
      message: 'Please enter something:',
    },
  ]);

  console.log(`You said: ${answers.userInput}`);
}
