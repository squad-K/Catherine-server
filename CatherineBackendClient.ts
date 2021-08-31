import { CatherineClient } from "./CatherineClient";
import { CatherineFilter } from "./CatherineFilter";

export class CatherineBackendClient {
  filter: CatherineFilter;
  catherineClient: CatherineClient;
  constructor() {
    this.filter = new CatherineFilter();
    // this.catherineClient = new CatherineClient('ws://localhost:4869/logger');
  }

  connect(url) {
    if (this.catherineClient) {
      throw new Error('重复初始化Client');
    }
    this.catherineClient = new CatherineClient(url);

    this.catherineClient.on('id', (payload) => {
      //console.log('id', payload);
      this.catherineClient.send('fetchFilter');
    });
    this.catherineClient.on('updateFilter', (payload) => {
      //console.log('filters:', payload);
      this.filter.setFilters(payload);
    });

    this.filter.onMatch((matchIds, data) => {
      //console.log(matchIds, data);
      this.catherineClient.send('match', {
        filterIds: matchIds,
        data,
      });
    });

    return this;
  }

  writeLog(data) {
    this.filter.writeLog(data);
  }
}