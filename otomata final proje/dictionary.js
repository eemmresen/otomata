class Dictionary {
  constructor(pairs) {
    this.pairs = pairs;
    this.map = new Map();
    for (let pair of pairs) {
      this.map.set(JSON.stringify(pair[0]), pair[1]);
    }
  }

  has(key) {
    return this.map.has(JSON.stringify(key));
  }

  get(key) {
    return this.map.get(JSON.stringify(key));
  }
}