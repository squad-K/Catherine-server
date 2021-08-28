export class CatherineFilter {
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