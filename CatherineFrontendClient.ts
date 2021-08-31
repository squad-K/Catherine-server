import { CatherineClient } from "./CatherineClient";

export class CatherineFrontendClient {
  catherineClient: CatherineClient;
  onMatchCallback: Function;
  constructor() {
    // this.catherineClient = new CatherineClient('ws://localhost:4869/logger');
  }

  connect(url) {
    if (this.catherineClient) {
      throw new Error('重复初始化Client');
    }
    this.catherineClient = new CatherineClient(url);

    this.catherineClient.on('id', (payload) => {
      //console.log('id', payload);
    });
    this.catherineClient.on('match', (payload) => {
      // console.log('match', payload);
      this.onMatchCallback(payload);
    });

    return this;
  }

  onMatch(callback: Function) {
    this.onMatchCallback = callback;
    return this;
  }

  updateFilter(filter) {
    this.catherineClient.send('filter', filter);
  }
}