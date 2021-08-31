import { createInterface } from 'readline';
import { CatherineFrontendClient } from './CatherineFrontendClient';
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'controller> '
});

const client = new CatherineFrontendClient()
.connect('ws://localhost:4869/controller')
.onMatch((data) => {
  console.log('match', data);
})

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'exit':
      console.log('bye~');
      process.exit(0);
      break;
    default:
      client.updateFilter(line);
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});