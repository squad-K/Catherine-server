import { WebSocketServer, WebSocket } from 'ws';

class Storage {
  storage: {};
  id: number;
  constructor() {
    this.id = 1;
    this.storage = {};
  }

  save(item) {
    const id = this.id++;
    this.storage[id] = item;
    return id;
  }

  remove(id) {
    delete this.storage[id];
  }

  find(id) {
    return this.storage[id];
  }
}

export class CatherineServer {
  socketStorage: Storage;
  wss: WebSocketServer;
  typeListener: any;
  constructor() {
    this.socketStorage = new Storage();
    this.wss = new WebSocketServer({ noServer: true });
    this.typeListener = {};

    this.wss.on('connection', function connection(ws) {
      const id = this.socketStorage.save(ws);
      console.log('new connection: ', id);
      ws.storageId = id;
      ws.send(JSON.stringify({
        type: 'id',
        payload: id,
      }));
      ws.on('message', (msg) => this.messageHandler(ws, JSON.parse(msg)));
    });
  }

  handleUpgrade(request, socket, head) {
    this.wss.handleUpgrade(request, socket, head, function done(ws) {
      this.wss.emit('connection', ws, request);
    });
  }

  on(type, callback) {
    this.typeListener[type] = callback;
    return this;
  }

  messageHandler(ws, message) {
    const { type, payload } = message;
    if (this.typeListener[type]) {
      this.typeListener[type](ws, payload);
    }
  }

  to(id) {
    return this.socketStorage.find(id);
  }

  sendToAll(type, payload) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type,
          payload,
        }));
      }
    });
  }
}