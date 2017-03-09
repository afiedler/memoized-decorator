module.exports = function isPrimative(val) {
  const type = typeof val;
  return val === null || (type !== 'object' && type !== 'function');
};