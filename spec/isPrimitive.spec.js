const isPrimitive = require('../src/isPrimitive');

describe('isPrimitive', () => {
  describe('primitives', () => {
    it('returns true for a number', () => { expect(isPrimitive(1)).toEqual(true); });
    it('returns true for a string', () => { expect(isPrimitive('test')).toEqual(true); });
    it('returns true for `null`', () => { expect(isPrimitive(null)).toEqual(true); });
    it('returns true for `undefined`', () => { expect(isPrimitive(undefined)).toEqual(true); });
    it('returns true for `false`', () => { expect(isPrimitive(false)).toEqual(true); });
    it('returns true for a symbol', () => { expect(isPrimitive(Symbol())).toEqual(true); });
  });

  describe('non-primitives', () => {
    it('returns false for an object', () => { expect(isPrimitive({})).toEqual(false); });
    it('returns false for a function', () => { expect(isPrimitive(function() {})).toEqual(false); });
    it('returns false for a regex', () => { expect(isPrimitive(/test/)).toEqual(false); });
    it('returns false for an array', () => { expect(isPrimitive([])).toEqual(false); });
  });
});
