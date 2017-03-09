const isPrimitive = require('./isPrimitive');

class Node {
  constructor() {
    this._weakMap = new WeakMap();
    this._map = new Map();
    this.val = undefined;
  }

  set(arg, val) {
    if (isPrimitive(arg))
      this._map.set(arg, val);
    else
      this._weakMap.set(arg, val);
  }

  get(arg) {
    if (isPrimitive(arg))
      return this._map.get(arg);
    else
      return this._weakMap.get(arg);
  }

  has(arg) {
    if (isPrimitive(arg))
      return this._map.has(arg);
    else
      return this._weakMap.has(arg);
  }
}

module.exports = function memoize (func, options) {
  const root = new Node();

  options = options || {};
  const exceptWhen = options.exceptWhen;

  const memoized = function () {
    let node = root;
    for (let i=0;i<arguments.length;i++) {
      const arg = arguments[i];
      if(exceptWhen && exceptWhen(arg, i)) return func.apply(this, arguments);

      node = node.get(arg);
      if (typeof node === 'undefined') break;
    }
    if (node && typeof node.val !== 'undefined') {
      return node.val;
    } else {
      const val = func.apply(this, arguments);
      const args = Array.prototype.slice.call(arguments);
      let node = root;
      while(args.length > 0) {
        const arg = args.shift();
        if(!node.has(arg)) node.set(arg, new Node());
        node = node.get(arg);
      }
      node.val = val;
      return val;
    }
  };

  Object.defineProperty(memoized, 'name', {
    writable: false,
    enumerable: false,
    configurable: true,
    value: func.name + '_memoized'
  });

  memoized.unmemoized = func;

  return memoized;
};
