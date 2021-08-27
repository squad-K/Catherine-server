import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const server = createServer();
const loggerWss = new WebSocketServer({ noServer: true });
const controllerWss = new WebSocketServer({ noServer: true });

class Storage {
  storage: {};
  id: number;
  constructor() {
  }

  save(item) {
    const id = this.id++;
    this.storage[id] = item;
  }

  remove(id) {
    delete this.storage[id];
  }

  find(id) {
    return this.storage[id];
  }
}

const loggerStorage = new Storage();

function loggerMessageHandler(ws, message) {
  switch (message.type) {
    case 'match':
      const { filterIds, data } = message.payload;
      filterIds.forEach(id => {
        ControllerStorage.find(id).send({
          type: 'match',
          payload: data,
        })
      });
      break;
  
    default:
      break;
  }
}

loggerWss.on('connection', function connection(ws) {
  const id = loggerStorage.save(ws);
  ws.storageId = id;
  ws.send({
    type: 'id',
    payload: id,
  });
  ws.on('message', (msg) => loggerMessageHandler(ws, msg))
});

const filters = {};
function updateFilter(filters) {
  loggerWss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send({
        type: 'updatefilters',
        payload: filters,
      });
    } 
  });
}

function controllerMessageHandler(ws, message) {
  switch (message.type) {
    case 'filter':
      const filter = message.payload;
      filters[ws.storageId] = filter;
      updateFilter(filter);
      break;
  
    default:
      break;
  }
}

const ControllerStorage = new Storage();

controllerWss.on('connection', function connection(ws) {
  const id = ControllerStorage.save(ws);
  ws.storageId = id;
  ws.send({
    type: 'id',
    payload: id,
  });
  ws.on('message', (msg) => controllerMessageHandler(ws, msg));
});

server.on('upgrade', function upgrade(request, socket, head) {
  const url = new URL(request.url); 

  if (url.pathname === '/logger') {
    loggerWss.handleUpgrade(request, socket, head, function done(ws) {
      loggerWss.emit('connection', ws, request);
    });
  } else if (url.pathname === '/controller') {
    controllerWss.handleUpgrade(request, socket, head, function done(ws) {
      controllerWss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(4869);

/*

const filter = new CatherineFilter();

filter.setQuery({
  id: 'query1',
  filter: (log) => log.include('aaa'),
});
filter.writeLog('测试日志aaa'); //触发match
filter.writeLog('测试日志bbb'); //不触发
filter.on('match', (query, log) => {
  console.log(query); // => object(id = 'query1')
  console.log(log); // => '测试日志aaa'
})


// 事件模型下的websocket
ws.on('connection', (socket) => {
  socket.on('filter', (msg) => {
    filter.setQuery({
      id: socket.id,
      filter: parseFilter(msg),
    });
  })
})

MQconsumer.on('message', (message) => {
  filter.writeLog(message);
})

filter.on('match', (query, log) => {
  ws.to(query.id).emit('event', log);
})


//负责收集日志的场景
ws = new WebSocket('ws://catherine.cc/foo');

//msg = '{ id: 'query1', filter: 'test'}'
ws.on('filter', (msg) => {
  filter.setQuery(parseFilter(msg));
});

filter.on('match', (query, log) => {
  ws.emit('log', log);
})

filter.writeLog('测试日志aaa');
filter.writeLog('测试日志test'); //将会上报给ws://catherine.cc/foo
filter.writeLog('测试日志ccc');
*/