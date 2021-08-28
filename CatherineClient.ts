import { WebSocket } from 'ws';
export class CatherineClient {
  wsClient: WebSocket;
  typeListener: any;
  constructor(url) {
    this.wsClient = new WebSocket(url);
    this.wsClient.on('message', (msg) => this.messageHandler(JSON.parse(msg)));
    this.typeListener = {};
  }

  on(type, callback) {
    this.typeListener[type] = callback;
    return this;
  }

  messageHandler(message) {
    const { type, payload } = message;
    if (this.typeListener[type]) {
      this.typeListener[type](payload);
    }
  }

  send(type, payload) {
    this.wsClient.send(JSON.stringify({
      type,
      payload,
    }));
  }
}