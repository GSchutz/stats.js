'use strict';

// this constructor just wrapp something
function $$Wrapper(value) {
  this.$wrapped = value;
  this.$aggregate = [];

  this.$lazyMode = false;

  this.value = function() {
    if (this.$aggregate.length > 0) {
      for(var k in this.$aggregate) {
        var args = [this.$wrapped];
        args.push.apply(args, this.$aggregate[k].args);
        this.$wrapped = this.$aggregate[k].fn.apply(this, args);
      }
    }
    return this.$wrapped;
  }
}

// this is our main constructor, our Lib
function $$(value) {
  return new $$Wrapper(value);
}

function assign(object, source) {
  for (var m in source) {
    if (source.hasOwnProperty(m)) {
      object[m] = source[m];
    }
  }
  return object;
}

/////////////////////
// Private Methods //
/////////////////////

function mixin(object, source, options) {
  for(var methodName in source) {
    object.prototype[methodName] = function(method, methodName) {
      function mixed() {
        if (this.$lazyMode === true) {
          var args = Array.prototype.slice.call(arguments);

          this.$aggregate.push({fn: method, args: args});

          return this;
        } else {
          var args = [this.$wrapped];
          Array.prototype.push.apply(args, arguments);
    
          return new source(method.apply(this, args));
        }
      }
      return mixed;
    }.call(source, source[methodName], methodName);
  }
  return object;
}

////////////////////
// Public Methods //
////////////////////

function sum() {
  var args = Array.prototype.slice.call(arguments);
  var t = 0;

  for(var i in args) {
    t += args[i];
  }
  return t;
}

function multiply() {
  var args = Array.prototype.slice.call(arguments);
  var t = 1;

  for(var i in args) {
    t *= args[i];
  }
  return t;
}

$$.sum = sum;
$$.multiply = multiply;

function Cache() {
  var list = {};

  this.list = function() {
    return list;
  };

  this.get = function(key) {
    return list[key];
  };

  this.set = function(key, value) {
    list[key] = value;
    return value;
  };
};

function $$Memoize() {


}

$$.memoize = function(fn) {
  var cache = new Cache();

  var memoize = function() {
    var args = Array.prototype.slice.call(arguments),
      key = args[0];

    var cached = cache.get(key);

    // if result already exist, return it
    if (cached)
      return cached;

    // if not, we save it first and them return.
    cached = fn.apply(cache, args);

    return cache.set(key, cached);
  };

  memoize.cache = cache;

  return memoize;
};

mixin($$, $$);
$$Wrapper.prototype = $$.prototype;

///////////////////////
// Wrapper Extenders //
///////////////////////

$$Wrapper.prototype.lazy = function() {
  this.$lazyMode = true;

  this.load = function(_continue) {
    this.value();
    this.$aggregate = [];
    this.$lazyMode = !!_continue;

    return this;
  };

  return this;
};


/////////////
// TESTING //
/////////////

console.log($$.multiply(2,6));
console.log($$.sum(2,5,7));
console.log($$(3).lazy().sum(4).multiply(2).sum(2).load(true).sum(4).multiply(.5).value());
console.log($$(3).sum(2,5,7).multiply(2).sum(-3).value());
console.log($$(3).sum(2,5,7).multiply(2).sum(-3).value());

var factorial = $$.memoize(function(n) {
  if (n === 0)
    return 1;

  return n * factorial(n - 1);
});

console.log(factorial.cache);

// function factorial(n) {
//   if (n === 0)
//     return 1;

//   return n * factorial(n - 1);
// }

// console.log(factorial(1));
// console.log(factorial(2));
// console.log(factorial(3));
// console.log(factorial(4));
// console.log(factorial(5));


function testing() {
  $$.sum(2,3) === 5;
  $$(2).sum(3).value() === 5;
}


perf(function() {
  for(var i = 1; i <= 5; i+=1) {
    factorial(i);
  }
})




var __perf_counter = 0;
function perf(fn) {
  console.log(' ------ test '+ __perf_counter +' -------')
  __perf_counter += 1;

  var i = (new Date()).getTime();

  var v = fn();

  var o = (new Date()).getTime();

  console.log(v);

  console.log(o - i);

  return v;
}


/////////////////////////////
// JavaScript Prototyping  //
/////////////////////////////



