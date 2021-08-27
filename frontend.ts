import { WebSocket } from 'ws';
import { createInterface } from 'readline';
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'controller> '
});

console.log(WebSocket);
const ws = new WebSocket('ws://localhost:4869/controller')

ws.on('message', (msg) => {
  const { type, payload } = JSON.parse(msg);
  switch (type) {
    case 'id':
      console.log('id', payload);
      break;

    case 'match':
      console.log('match', payload);
      break;
  
    default:
      break;
  }
});

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'exit':
      console.log('bye~');
      process.exit(0);
      break;
    default:
      ws.send(JSON.stringify({
        type: 'filter',
        payload: line,
      }));
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});