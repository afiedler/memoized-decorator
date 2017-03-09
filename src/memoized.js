const memoize = require('./memoize');

module.exports = function memoized (options) {
  return function memoizedDecorator (target, key, descriptor) {
    descriptor.value = memoize(descriptor.value, options);
    return descriptor;
  }
};