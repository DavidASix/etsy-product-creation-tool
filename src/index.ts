import { runCli } from './cli';

runCli().catch((error: Error) => {
  console.error('Error running CLI:', error);
  process.exit(1);
});
