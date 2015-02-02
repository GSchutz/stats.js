/**
 * Stats
 *
 * Stats is a complex library for statistical use.
 * It is intended to give all the simple and complex methods, 
 * as the basics interpretations as well.
 *
 * @author Guilherme Schutz
 * gschutz.com
 */


;(function(exports) {
	// chain is a object/array/string/number, any value that can be manipulated by Stats
	
	function Stats(value, chainAll, actions) {
		this.__actions__ = actions || [];
		this.__chain__ = !!chainAll;
		this.__wrapped__ = value;
	}


	function stats(wrapper){
		if (_.isPlainObject(wrapper) && !_.isArray(wrapper)) {
			if (wrapper instanceof StatsWrapper) {
				return wrapper;
			}
			if (_.hasOwnProperty.call(wrapper, '__wrapped__')) {
				return new Stats(wrapper.__wrapped__, wrapper.__chain__, _.clone(wrapper.__actions__));
			}
		}
		return new Stats(wrapper);
	}


	function sum(a, b) {
		return a + b;
	}

	function subtract(a, b) {
		return a - b;
	}

	function divide(a, b) {
		return a / b;
	}

	function multiply(a, b) {
		return a * b;
	}

	function value() {
		return baseWrapperValue(this.__wrapped__, this.__actions__);
	}

	function baseWrapperValue(value, actions) {
	  var result = value;

	  var index = -1,
	      length = actions.length;

	  while (++index < length) {
	    var args = [result],
	        action = actions[index];

	    Array.prototype.push.apply(args, action.args);
	    result = action.func.apply(action.thisArg, args);
	  }

	  return result;
	}


	function mixin(object, source, options) {
		var chain = true;
		
    if (options === false) {
      chain = false;
    } else if (_.isObject(options) && 'chain' in options) {
      chain = options.chain;
    }
		// set each method (in source) for object
		_.each(source, function(prop, methodName) {
			// this will set the methods to the global stats
			object[methodName] = prop;

			// this will set the methods to the wrapped object.
			// But now, we already have a collection defined, 
			// so we just pass it to the original function;
			// object.prototype[methodName] = prop;
			object.prototype[methodName] = (function(prop){
				return function() {
					// __wrapped__ is just one (or) the first argument,
					// so we pass to the first arguments;
	        var chainAll = this.__chain__;

	        if (chain || chainAll) {
	          var result = object(this.__wrapped__);
	          (result.__actions__ = _.clone(this.__actions__)).push({ 'func': prop, 'args': arguments, 'thisArg': object });
	          result.__chain__ = chainAll;
	          return result;
	        }
	        var args = [this.__wrapped__];
	        Array.prototype.push.apply(args, arguments);

					return prop.apply(this, args);
				};
			}(prop));

		}, object);

		return object;
	}

	/** First we define only the Chainable methods */

	var st = {};

	st.sum = sum;
	st.subtract = subtract;
	st.divide = divide;
	st.multiply = multiply;

	st.value = value;

	mixin.call(stats, stats, st);

	/** And only after iteration, we added the non-chainable methods */

	var _st = {};

	_st.value = value;

	mixin.call(stats, stats, _st, false);


	// extend the Wrapper
	Stats.prototype = stats.prototype;



	// Apply own methods to the stats and StatsWrapper

	/*
	_(st).each(function() {

	})
	*/

  /*--------------------------------------------------------------------------*/

  window.st = stats;
}(window));