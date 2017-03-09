# memoized-decorator

This package exports a memoization function and a ECMAScript decorator that can be used to memoize methods on a class.
It is primarily designed to memoize functions or methods that receive immutable data.

Here's an example of the memoization function in use:

```js
const memoize = require('./index').memoize;

function fib(n) {
   if(n == 1 || n == 2) return 1;
   return fib(n-1) + fib(n-2);
}

const memoFib = memoize(fib);

memoFib(10);

// only calls fib(n) once for each n, since the results are memoized
```

Here is an example of the decorator:

```js
const memoized = require('memoized-decorator').decorator;

class MyMath {
   @memoized
   fib(n) {
      if(n == 1 || n == 2) return 1;
      return this.fib(n-1) + this.fib(n-2);
   }
}
```

Unlike other memoization functions for Javascript, this function does *not* compute a cache key using the function
arguments. Instead, it uses `Map` and `WeakMap` to form a tree which is then searched for memoized values. This should
be far faster, especially if the memoized function is called with large arguments. Additionally, because `WeakMap` lets
the garbage collector release memory if all other references to a key have been destroyed, this method should also save
memory.

## Caveat: Mutable Arguments
The main caveat to this method is that if you modify a function argument but do not make a deep copy, by default the
memoized function will not recognize the difference. Here's an example:

```js
const memoSum = memoize((a, b) => a.val + b.val);
const A = { val: 5 };
const B = { val: 6 };

memoSum(A,B);
// -> 11

A.val = 1;
memoSum(A,B);
// -> 11
```

Because of this, this memoization method is primarily for immutable data. However, if you must use your memoized
function with mutable data as well, you can tell it to conditionally bypass memoization by providing an `exceptWhen`
option.

```js
const memoSum = memoize((a, b) => a.val + b.val, { exceptWhen: (arg) => arg.mutable });
const A = { val: 5, mutable: true };
const B = { val: 6 };

memoSum(A,B);
// -> 11  -- not memoized since exceptWhen(A) === true!

A.val = 1;
memoSum(A,B);
// -> 7
```

With the decorator, this can be passed in as well: `@memoized({ exceptWhen: (arg) => arg.mutable })`. The `exceptWhen`
option can also take a `index` as the second argument, which will be set to the argument index. For example, this will
not memoize when the second argument has the prop `mutable`: `(arg, index) => index === 1 && arg.mutable`.

## Other Caveats
* If the function you are memoizing returns `undefined` for a given set of arguments, that value will not be cached and
  subsequent calls to the memoized version of your function will still call the original.
* Primitive keys (strings, numbers, booleans, symbols, and null) are stored in a `Map`, which means they will not be
  cleared from memory if they are de-referenced in outside code.
* If your function returns large objects, those *will* remain in memory until the corresponding keys are de-referenced.

## Other Details
The `@memoized` decorator and the `memoize` function attached the unmemoized version of the function like this:
```js
function myFunc () {}

const memoFunc = memoize(myFunc);
memoFunc.unmemoized === func;
// -> true
```

The memoized function will have a `name` property set to the original function name plus `"_memoized"`:
```js
memoFunc.name;
// -> "myFunc_memoized"
```
