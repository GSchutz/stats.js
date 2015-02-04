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

	/**
	 * @namespace constants
	 */

	/**
	 * Default precision for all calculations. Defining this limit ensure the floating point problem.
	 *
	 * @memberOf constants
	 *
	 * @type {Number}
	 */
	var PRECISION = 10;


	// chain is a object/array/string/number, any value that can be manipulated by Stats
	
	function StatsWrapper(value, chainAll, actions) {
		this.__aggregate__ = false;
		this.__chain__ = !!chainAll;
		this.__wrapped__ = _.clone(value);
	}

	/**
	 * The object creator itself.
	 *
	 * @method   stats
	 *
	 * @category
	 *
	 * @param    {*} wrapper Any value to be wrapped for chaining methods.
	 *
	 * @return   {StatsWrapper}         Always return a `StatsWrapper`.
	 *
	 * @namespace stats
	 */
	function stats(wrapper){
		if (_.isObject(wrapper) && !_.isArray(wrapper)) {
			if (wrapper instanceof StatsWrapper) {
				return wrapper;
			}
			if (_.hasOwnProperty.call(wrapper, '__wrapped__')) {
				return new StatsWrapper((wrapper.__wrapped__), wrapper.__chain__, wrapper.__actions__);
			}
		}
		return new StatsWrapper((wrapper));
	}

	/**
	 * Transform all parameters into a unique `array`, even multidimensional
	 * arrays and objects.
	 *
	 * @method   linearize
	 *
	 * @static
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param {...*} [*] Any value.
	 *
	 * @return {Array} Returns an `array` with all parameters linearized.
	 */
	function linearize() {
		var args = _.toArray(arguments),
			r = [];
		
		_.each(args, function(t){
			if (_.isArray(t) || _.isPlainObject(t)) {
				_.each(t, function(d){
						if (_.isArray(d) || _.isPlainObject(d)) {
							r = r.concat(linearize(d));
						} else {
							r.push(d);
						}
				});
			} else {
				r.push(t);
			}
		});
		
		return r;
	}

	function baseOperator(a, b, fn) {
		if (_.isFinite(a) && _.isFinite(b)) {
			return fn(a, b);
		}

		if (_.isArray(a) && !b) {
			var r = 0;
			a = linearize(a);

    	_.each(a, function(c, i){
    		if (_.isFinite(c))
    			r = fn(r, c);
  		});
  		return r;
		}

		if (_.isArray(a) && _.isFinite(b)) {
			a = linearize(a);

    	_.each(a, function(c, i){
    		if (_.isFinite(c))
    			a[i] = fn(a[i], b);
  		});
		}

		if (_.isArray(a) && _.isArray(b)) {
			a = linearize(a);
			b = linearize(b);

    	_.each(a, function(c, i){
    		if (_.isFinite(c) && _.isFinite(b[i]))
    			a[i] = fn(a[i], b[i]);
  		});
		}

		if (_.isFinite(a) && _.isArray(b)) {
			b = linearize(b);

    	_.each(b, function(c, i){
    		if (_.isFinite(c))
    			a = fn(a, c);
  		});
		}
    
    return a;
	}

	/**
	 * Sum all values passed in argument `a` by argument `b`, accept almost any
	 * number inside any collection (array or plain object)
	 *
	 * @method   sum
	 *
	 * @static
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param {(number|array)} a The `number` or `array` to add from.
	 * @param {(number|array)} b The `number` or `array` that will be added.
	 *
	 * @return {(number|array)}   Always return the same type passed by `a`.
	 *
	 * @example
	 *
	 * var data = [5,7,1,4];
	 *
	 * // sum all data values 
	 * 
	 * var calc = st(data).sum();
	 *
	 * console.log(calc.value()); 
	 * // => 17
	 *
	 * // sum data values by values 
	 * 
	 * var values = [1,0,2,-2];
	 *
	 * var calc = st(data).sum(values);
	 *
	 * console.log(calc.value()); 
	 * // => [6, 7, 3, 2] 
	 */
	function sum(a, b) {
		return baseOperator(a, b, function(a, b) {
			return a + b;
		});
	}

	/**
	 * Subtracts `a` by `b` (`a - b`). If `b` and `a` are a list subtracts each
	 * element in list `b` from each element in list `a`.
	 *
	 * @method   subtract
	 *
	 * @static
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param {(number|array)} a The `number` or `array` to subtracts from.
	 * @param {(number|array)} b The `number` or `array` that will subtracts a.
	 *
	 * @return {(number|array)} Always return the same type passed by `a`.
	 */
	function subtract(a, b) {
		return baseOperator(a, b, function(a, b) {
			return a - b;
		});
	}

	/**
	 * Divide each `a` by `b` (`a / b`). If `a` is a list, divide each element
	 * in `a` by `b` (or each element in `b`). If `a` is a `number` and `b` a
	 * list, divide `a` by every element in `b`.
	 *
	 * @method   divide
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a The `number` or `array` that will be divided.
	 * @param    {(number|array)} b The `number` or `array` that will divide.
	 *
	 * @return   {(number|array)}   Always return the same type passed by `a`.
	 *
	 * @example
	 *
	 * 
	 * var data = [5, 7, 1, 4];
	 * 
	 * // divide '2' from all data values
	 * var calc = st(data).divide(2);
	 * 
	 * console.log(calc.value());
	 * // =>  [2.5, 3.5, 0.5, 2]
	 * 
	 * // divide each data value by each values
	 * var values = [1, 7, 0.5, -2];
	 * 
	 * var calc = st(data).divide(values);
	 * 
	 * console.log(calc.value(), data);
	 * // => [5, 1, 2, -2]
	 * 
	 */
	function divide(a, b) {
		return baseOperator(a, b, function(a, b) {
			return a / b;
		});
	}

	/**
	 * Take element `a` (or each element in `a`), and multiply by `b` (or each
	 * element in `b`).
	 *
	 * @method   multiply
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a The `number` or `array` that will be multiplied.
	 * @param    {(number|array)} b The `number` or `array` that will multiply.
	 *
	 * @return   {(number|array)}   Always return the same type passed by `a`.
	 *
	 * @example
	 *
	 * 
	 * var data = [-3, 1, 0, 0.5, 17];
	 * 
	 * // multiply all data values by '2'
	 * var calc = st(data).multiply(2);
	 * 
	 * console.log(calc.value());
	 * // =>  [-6, 2, 0, 1, 34]
	 * 
	 * // multiply each data value by each values
	 * var values = [3, 7, -2, 0.5, -1];
	 * 
	 * var calc = st(data).multiply(values);
	 * 
	 * console.log(calc.value());
	 * // => [-9, 7, -0, 0.25, -17]
	 * 
	 */
	function multiply(a, b) {
		return baseOperator(a, b, function(a, b) {
			return a * b;
		});
	}

	/**
	 * Just round the variable passed to the passed precision (default is 10 decimals).
	 *
	 * @method   round
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} value       Any `integer` or `float` number, or list of `number`.
	 * @param    {number} precision A non-negative `integer`.
	 *
	 * @return   {(number|array)}           Return the same type of `value`.
	 */
	function round(value, precision) {
		if (_.isFinite(value)) {
			return baseRound(value, precision);
		}

		if (_.isObject(value)) {
			value = linearize(value);

			_.each(value, function(c, i) {
				value[i] = baseRound(c, precision);
			}, this);
		}

		return value;
	}

	function baseRound(num, precision) {
		// for maximum accuracy, the parameter number for toFixed should be bigger.
		// i.e., for complex calculus, with bigger numbers, this entire function
		// needs to be revised.

		//  This is a workaround for round up with no decimals.
		var rounded, original_num = num;

		num = parseFloat(num);

		if( precision === 0 )
			num = roundTo(num/10, 1) * 10;

		precision = precision || PRECISION;
		rounded = +(Math.round(num.toFixed(8) + "e+" + precision)  + "e-" + precision);

		// this error never happen, remeber to remove this code on production.
		if (_.isNaN(rounded) || !_.isNumber(rounded)) {
			var caller_line = (new Error).stack;
			console.error(rounded, original_num);
			console.error(caller_line);
		}

		return rounded;
	}

	/**
	 * Return the value stored (and already calculated) in the pipeline.
	 *
	 * @method   value
	 *
	 * @memberOf stats
	 *
	 * @category chain
	 *
	 * @return   {*} Returns whatever the last function applied has returned.
	 */
	function value() {
		if (this.__aggregate__) {
			dispatch();
		}

		return this.__wrapped__;
	}

	/**
	 * Just set the aggregate property to `true`, so that methods can be
	 * aggregated. This method is usefull when dealing with a lot of data and
	 * performing more than one calculations. This method just join all the
	 * methods applied to the pipeline in one big loop.
	 *
	 * When dealing with complex methods, this method has not been tested
	 * properly.
	 *
	 * @method   aggregate
	 *
	 * @memberOf stats
	 *
	 * @category chain
	 *
	 * @return   {StatsWrapper} Return the current pipeline.
	 */
	function aggregate() {
		this.__aggregate__ = true;

		return this;
	}

	/**
	 * Dispatch all methods chained in the pipeline in one big loop.
	 *
	 * @method   dispatch
	 *
	 * @memberOf stats
	 *
	 * @category chain
	 *
	 * @return   {StatsWrapper} Return the current pipeline with all aggregated method results.
	 */
	function dispatch() {
		// check if we are in an aggregate environment
		if (this.__aggregate__) {

			var ag = this.__aggregate__;

			var r = this.value();

			_.each(r, function(value, i) {
				_.each(this.__aggregate__, function(aggregate) {
					var b = aggregate.args[0]; 

					if (_.isArray(b))
						b = b[i];

					r[i] = aggregate.fn.call(this, r[i], b);
				}, this);
			}, this);
			this.__wrapped__ = r;
		}
		this.__aggregate__ = false;

		return this;
	}

	/**
	 * Copy the current pipeline.
	 *
	 * Remember that `Stats` use a pipeline approach, so when chaining methods, 
	 * the wrapped variable is overwritten by the returned value of the method.
	 *
	 * @method   copy
	 *
	 * @memberOf stats
	 *
	 * @category chain
	 *
	 * @return   {StatsWrapper} Returns a `new StatsWrapper`, don't overwritting the wrapped variable.
	 *
	 * @example
	 *
	 * var price = st([10, 30, 80]);
	 * 
	 * var newPrice = price.multiply(1.1);
	 * 
	 * console.log(price.value());
	 * // => [11, 33, 88]
	 * 
	 * console.log(newPrice.value());
	 * // => [11, 33, 88]
	 * 
	 * // The price has been changed, 
	 * // because we are using the same wrapper.
	 * // If this is a problem, just make a copy:
	 * 
	 * var price = st([10, 30, 80]);
	 * 
	 * var newPrice = price.copy().multiply(1.1);
	 * 
	 * console.log(price.value());
	 * // => [10, 30, 80]
	 * 
	 * console.log(newPrice.value());
	 * // => [11, 33, 88]
	 * 
	 */
	function copy() {
		return stats(this.__wrapped__);
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
						var args = [this.__wrapped__];
						Array.prototype.push.apply(args, arguments);

						if (this.__aggregate__) {
							if (!_.isArray(this.__aggregate__))
								this.__aggregate__ = [];

							var aggregate = {"fn": prop, "args": arguments};

							this.__aggregate__.push(aggregate);

							return this;
						}

						this.__wrapped__ = prop.apply(this, args);
						this.__chain__ = chainAll;

						return this;
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

	st.round = round;

	st.value = value;

	mixin.call(stats, stats, st);

	/** And only after iteration, we added the non-chainable methods */

	var _st = {};

	_st.value = value;
	_st.copy = copy;
	_st.aggregate = aggregate;
	_st.dispatch = dispatch;

	mixin.call(stats, stats, _st, false);


	// extend the Wrapper
	StatsWrapper.prototype = stats.prototype;



	// Apply own methods to the stats and StatsWrapper


	/*--------------------------------------------------------------------------*/

	window.st = stats;
}(window));