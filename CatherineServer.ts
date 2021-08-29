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

class CatherineServerConnection {
  ws: any;
  storageId: number;
  constructor(ws) {
    this.ws = ws;
  }

  send(type, payload = {}) {
    console.log(type, payload);
    this.ws.send(JSON.stringify({
      type,
      payload,
    }));
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

    this.wss.on('connection', (ws) => {
      const connection = new CatherineServerConnection(ws);
      const id = this.socketStorage.save(connection);
      console.log('new connection: ', id);
      connection.storageId = id;
      ws.send(JSON.stringify({
        type: 'id',
        payload: id,
      }));
      ws.on('message', (msg) => this.messageHandler(connection, JSON.parse(msg)));
    });
  }

  handleUpgrade(request, socket, head) {
    const wss = this.wss;
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  }

  on(type, callback) {
    this.typeListener[type] = callback;
    return this;
  }

  messageHandler(connection, message) {
    console.log(message);
    const { type, payload } = message;
    if (this.typeListener[type]) {
      this.typeListener[type](connection, payload);
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