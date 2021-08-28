import { createInterface } from 'readline';
import { CatherineClient } from './CatherineClient';
import { CatherineFilter } from './CatherineFilter';

const filter = new CatherineFilter();

const client = new CatherineClient('ws://localhost:4869/logger')

client.on('id', (payload) => {
  console.log('id', payload);
});
client.on('updatefilters', (payload) => {
  console.log('filters:', payload);
  filter.setFilters(payload);
});

filter.onMatch((matchIds, data) => {
  client.send('match', {
    filterIds: matchIds,
    data,
  });
});

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
      filter.writeLog(line);
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});