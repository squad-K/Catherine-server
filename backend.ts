import { createInterface } from 'readline';
import { WebSocket } from 'ws';
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'logger> '
});

class CatherineFilter {
  filters: any;
  onMatchCallback: any;
  constructor() {
    this.filters = {};
  }

  setFilters(filters) {
    this.filters = filters;
  }

  writeLog(data: string) {
    const matchIds = [];
    for (const id in this.filters) {
      const filterStr = this.filters[id];
      if (data.includes(filterStr)) {
        matchIds.push(id);
      }
    }
    if (matchIds.length) {
      this.onMatchCallback(matchIds, data);
    }
  }

  onMatch(callback) {
    this.onMatchCallback = callback;
  }
}

const filter = new CatherineFilter();

const ws = new WebSocket('ws://localhost:4869/logger')

ws.on('message', (msg) => {
  const { type, payload } = JSON.parse(msg);
  switch (type) {
    case 'id':
      console.log('id:', payload);
      break;

    case 'updatefilters':
      console.log('filters:', payload);
      filter.setFilters(payload);
      break;

    default:
      break;
  }
});

filter.onMatch((matchIds, data) => {
  ws.send(JSON.stringify({
    type: 'match',
    payload: {
      filterIds: matchIds,
      data,
    },
  }));
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