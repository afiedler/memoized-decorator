const memoize = require('../src/memoize');

describe('memoize()', () => {

  it('attaches the original function to the memoized version', () => {
    let dummy = jasmine.createSpy('dummy').and.returnValue(1);
    let memoDummy = memoize(dummy);
    expect(memoDummy.unmemoized === dummy).toEqual(true);
  });

  it('sets the `name` property to the original name plus "_memoized"', () => {
    function someNamedFunction () {}
    let memo = memoize(someNamedFunction);
    expect(memo.name).toEqual('someNamedFunction_memoized');
  });

  describe('the memoization of one return value', () => {
    let dummy, memoDummy, retVal;
    beforeEach(() => {
      retVal = { some: 'value' };
      dummy = jasmine.createSpy('dummy').and.returnValue(retVal);
      memoDummy = memoize(dummy);
    });

    describe('when called with no arguments', () => {
      it('memoizes the return value', () => {
        expect(memoDummy()).toEqual(retVal);
        expect(dummy).toHaveBeenCalledWith();
        expect(memoDummy()).toEqual(retVal);
        expect(dummy.calls.count()).toEqual(1);
      });
    });

    describe('when called with one primitive (P) argument', () => {
      it('memoizes the return value', () => {
        expect(memoDummy(1)).toEqual(retVal);
        expect(dummy).toHaveBeenCalledWith(1);
        expect(memoDummy(1)).toEqual(retVal);
        expect(dummy.calls.count()).toEqual(1);
      });
    });

    describe('when called with one non-primitive (NP) argument', () => {
      it('memoizes the return value', () => {
        const arg1 = { a: 'b' };
        expect(memoDummy(arg1)).toEqual(retVal);
        expect(dummy).toHaveBeenCalledWith(arg1);
        expect(memoDummy(arg1)).toEqual(retVal);
        expect(dummy.calls.count()).toEqual(1);
      });
    });

    describe('when called with (P, P, NP)', () => {
      it('memoizes the return value', () => {
        const arg1 = 1;
        const arg2 = 2;
        const arg3 = function () {};
        expect(memoDummy(arg1, arg2, arg3)).toEqual(retVal);
        expect(dummy).toHaveBeenCalledWith(arg1, arg2, arg3);
        expect(memoDummy(arg1, arg2, arg3)).toEqual(retVal);
        expect(dummy.calls.count()).toEqual(1);
      });
    });

    describe('when called with (P, NP, P)', () => {
      it('memoizes the return value', () => {
        const arg1 = 1;
        const arg2 = /test/;
        const arg3 = 3;
        expect(memoDummy(arg1, arg2, arg3)).toEqual(retVal);
        expect(dummy).toHaveBeenCalledWith(arg1, arg2, arg3);
        expect(memoDummy(arg1, arg2, arg3)).toEqual(retVal);
        expect(dummy.calls.count()).toEqual(1);
      });
    });

    describe('when called with (NP, P, P)', () => {
      it('memoizes the return value', () => {
        const arg1 = { a: 'b' };
        const arg2 = 2;
        const arg3 = 3;
        expect(memoDummy(arg1, arg2, arg3)).toEqual(retVal);
        expect(dummy).toHaveBeenCalledWith(arg1, arg2, arg3);
        expect(memoDummy(arg1, arg2, arg3)).toEqual(retVal);
        expect(dummy.calls.count()).toEqual(1);
      });
    });
  });

  describe('the memoization of different return values', () => {
    describe('when called with two different object references that are deepEqual but not ===', () => {
      let dummy, memoDummy;
      let arg1, arg2;
      beforeEach(() => {
        arg1 = { a: 'b' };
        arg2 = { a: 'b' };
        dummy = jasmine.createSpy('dummy');
        dummy.and.callFake((a1, a2) => {
          if(a1 === arg1 || a2 === arg1) return 1;
          else if(a1 === arg2 || a2 === arg2) return 2;
          else return 3;
        });
        memoDummy = memoize(dummy);
      });

      it('memoizes the return values separately for a call like (NP)', () => {
        expect(memoDummy(arg1)).toEqual(1);
        expect(dummy).toHaveBeenCalledWith(arg1);
        expect(memoDummy(arg1)).toEqual(1);
        expect(dummy.calls.count()).toEqual(1);

        expect(memoDummy(arg2)).toEqual(2);
        expect(dummy).toHaveBeenCalledWith(arg2);
        expect(memoDummy(arg2)).toEqual(2);
        expect(dummy.calls.count()).toEqual(2);
      });

      it('memoizes the return values separately for a call like (P, NP)', () => {
        expect(memoDummy(1, arg1)).toEqual(1);
        expect(dummy).toHaveBeenCalledWith(1, arg1);
        expect(memoDummy(1, arg1)).toEqual(1);
        expect(dummy.calls.count()).toEqual(1);

        expect(memoDummy(1, arg2)).toEqual(2);
        expect(dummy).toHaveBeenCalledWith(1, arg2);
        expect(memoDummy(1, arg2)).toEqual(2);
        expect(dummy.calls.count()).toEqual(2);
      });
    });
  });

  describe('when an argument is `undefined`', () => {
    let dummy, memoDummy;
    beforeEach(() => {
      dummy = jasmine.createSpy('dummy').and.returnValue('return value');
      memoDummy = memoize(dummy);
    });

    it('memoizes when called with just undefined (U)', () => {
      expect(memoDummy(undefined)).toEqual('return value');
      expect(dummy).toHaveBeenCalledWith(undefined);
      expect(memoDummy(undefined)).toEqual('return value');
      expect(dummy.calls.count()).toEqual(1);
    });

    it('memoizes when called with (P, P, U)', () => {
      expect(memoDummy(1, 2, undefined)).toEqual('return value');
      expect(dummy).toHaveBeenCalledWith(1, 2, undefined);
      expect(memoDummy(1, 2, undefined)).toEqual('return value');
      expect(dummy.calls.count()).toEqual(1);
    });

    it('memoizes when called with (P, U, P)', () => {
      expect(memoDummy(1, undefined, 2)).toEqual('return value');
      expect(dummy).toHaveBeenCalledWith(1, undefined, 2);
      expect(memoDummy(1, undefined, 2)).toEqual('return value');
      expect(dummy.calls.count()).toEqual(1);
    });

    it('memoizes when called with (U, P, P)', () => {
      expect(memoDummy(undefined, 1, 2)).toEqual('return value');
      expect(dummy).toHaveBeenCalledWith(undefined, 1, 2);
      expect(memoDummy(undefined, 1, 2)).toEqual('return value');
      expect(dummy.calls.count()).toEqual(1);
    });
  });

  describe('when the return value is `undefined`', () => {
    let dummy, memoDummy;
    beforeEach(() => {
      dummy = jasmine.createSpy('dummy').and.returnValue(undefined);
      memoDummy = memoize(dummy);
    });

    it('does not memoize when called with (P)', () => {
      expect(memoDummy(1)).toEqual(undefined);
      expect(dummy).toHaveBeenCalledWith(1);
      expect(memoDummy(1)).toEqual(undefined);
      expect(dummy.calls.count()).toEqual(2);
    });

    it('does not memoize when called with (P, NP, P)', () => {
      let arg2 = { a: 'b' };
      expect(memoDummy(1, arg2, 3)).toEqual(undefined);
      expect(dummy).toHaveBeenCalledWith(1, arg2, 3);
      expect(memoDummy(1, arg2, 3)).toEqual(undefined);
      expect(dummy.calls.count()).toEqual(2);
    });
  });

  describe('options.exceptWhen', () => {
    let dummy, memoDummy;
    beforeEach(() => {
      dummy = jasmine.createSpy('dummy').and.returnValue(1);
      memoDummy = memoize(dummy, { exceptWhen: (arg, i) => arg === 'no-memo' && i === 1 });
    });

    describe('returns true for a particular set of args', () => {
      it('does not memoize', () => {
        expect(memoDummy(0, 'no-memo')).toEqual(1);
        expect(dummy).toHaveBeenCalledWith(0, 'no-memo');
        expect(memoDummy(0, 'no-memo')).toEqual(1);
        expect(dummy.calls.count()).toEqual(2);
      });
    });

    describe('returns false for a particular set of args', () => {
      it('still memoizes', () => {
        expect(memoDummy('no-memo', 0)).toEqual(1);
        expect(dummy).toHaveBeenCalledWith('no-memo', 0);
        expect(memoDummy('no-memo', 0)).toEqual(1);
        expect(dummy.calls.count()).toEqual(1);
      });
    });
  });

});