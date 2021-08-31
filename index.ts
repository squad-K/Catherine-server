import { createServer } from 'http';
import { URL } from 'url';
import { CatherineServer } from './CatherineServer';

const server = createServer();

//开始写逻辑

const loggerServer = new CatherineServer();
const controllerServer = new CatherineServer();

loggerServer.on('match', (connection, payload) => {
  const { filterIds, data } = payload;
  filterIds.forEach(id => {
    controllerServer.to(id).send('match', data);
  });
});

loggerServer.on('fetchFilter', (connection) => {
  connection.send('updateFilter', filters);
});

const filters = {};
controllerServer.on('filter', (connection, payload) => {
  filters[connection.storageId] = payload;
  loggerServer.sendToAll('updateFilter', filters);
});

server.on('upgrade', function upgrade(request, socket, head) {
  const url = new URL(request.url, `http://${request.headers.host}`); 

  if (request.url === '/logger') {
    loggerServer.handleUpgrade(request, socket, head);
  } else if (url.pathname === '/controller') {
    controllerServer.handleUpgrade(request, socket, head);
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