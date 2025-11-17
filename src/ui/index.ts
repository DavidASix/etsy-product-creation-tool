import { UIServer } from './server';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = new UIServer(port);

server.start().catch((error: Error) => {
  console.error('Failed to start UI server:', error);
  process.exit(1);
});
