

// A cache that expires.
module.exports = class Cache extends Map {
  // timeout = 30 seconds
  constructor(timeout = 1000 * 30) {
      super();
      this.timeout = timeout;
  }
  set(key, value) {
      if (this.has(key)) {
          clearTimeout(super.get(key).tid);
      }
      super.set(key, {
          tid: (0, timers_1.setTimeout)(this.delete.bind(this, key), this.timeout).unref(),
          value,
      });
      return this;
  }
  get(key) {
      const ENTRY = super.get(key);
      if (ENTRY) {
          return ENTRY.value;
      }
      return null;
  }
  getOrSet(key, fn) {
      if (this.has(key)) {
          return this.get(key);
      }
      else {
          let value = fn();
          this.set(key, value);
          (async () => {
              try {
                  await value;
              }
              catch (err) {
                  this.delete(key);
              }
          })();
          return value;
      }
  }
  delete(key) {
      let ENTRY = super.get(key);
      if (ENTRY) {
          clearTimeout(ENTRY.tid);
          return super.delete(key);
      }
      return false;
  }
  clear() {
      for (const ENTRY of this.values()) {
          clearTimeout(ENTRY.tid);
      }
      super.clear();
  }
}
