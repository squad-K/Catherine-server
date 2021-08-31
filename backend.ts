import { createInterface } from 'readline';
import { CatherineBackendClient } from './CatherineBackendClient';

const backendClient = new CatherineBackendClient()
.connect('ws://localhost:4869/logger');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'logger> '
});

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'exit':
      console.log('bye~');
      process.exit(0);
      break;
    default:
      backendClient.writeLog(line);
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});