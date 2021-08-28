import { createInterface } from 'readline';
import { CatherineClient } from './CatherineClient';
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'controller> '
});

const client = new CatherineClient('ws://localhost:4869/controller')

client.on('id', (payload) => {
  console.log('id', payload);
});
client.on('match', (payload) => {
  console.log('match', payload);
});

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'exit':
      console.log('bye~');
      process.exit(0);
      break;
    default:
      client.send('filter', line);
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});