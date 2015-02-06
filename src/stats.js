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


  var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
      POSITIVE_INFINITY = Number.POSITIVE_INFINITY;


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
	 *
	 * @example
	 *
	 * var data = [5, [4, 7], {"0": 1}];
	 * 
	 * var linearized = st(data).linearize(12, [34]);
	 * 
	 * console.log(linearized.value());
	 * // => [5, 4, 7, 1, 12, 34]
	 * 
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

	function baseOperator(a, b, fn, identity) {
		identity = identity || 0;

		if (_.isFunction(b)) {
			fn = b;
			b = 1;
		}

		if (_.isFinite(a) && _.isFinite(b)) {
			return fn(a, b);
		}

		if (_.isArray(a) && !b) {
			var r = identity;
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
    			b[i] = fn(a, b[i]);
  		});

  		return b;
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
		}, 1);
	}

	/**
	 * Short method for inverse a number (`1 / a`).
	 *
	 * Note: This method is different from `reverse`.
	 *
	 * @method   inverse
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a The number or list to be inverted.
	 *
	 * @return   {(number|array)}   The inverse of `a`, or a list with each `a` inverted values.
	 */
	function inverse(a) {
		return divide(1, a);
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
		}, 1);
	}

	/**
	 * Retrieve the natural logarithm of a `number`.
	 *
	 * @method   ln
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a The `number`/`list` to be calculated.
	 *
	 * @return   {(number|array)}   All `a`'s natural logarithm.
	 */
	function ln(a) {
		return baseOperator(a, function(a) {
			return Math.log(a);
		});
	}

	/**
	 * Calculates the logarithm of `a` to base `b`. If no base is passed, is
	 * assumed the natural logarithm (with base `e`).
	 *
	 * @method   log
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a The number (or list) to calculate.
	 * @param    {(number|array)} b The base.
	 *
	 * @return   {(number|array)}   A `number` (if `a` and `b` are a `number`), or a `list`.
	 */
	function log(a, b) {
		if (b === undefined)
			return ln(a);

		return baseOperator(a, b, function(a, b) {
			return Math.log(a) / Math.log(b);
		});
	}

	/**
	 * Exponentiation of a number `a` to the exponent `power`.
	 *
	 * @method   pow
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a      The base of an exponentiation.
	 * @param    {(number|array)} power The exponent (or power).
	 *
	 * @return   {(number|array)}        Returns the result in a list or primitive `number`.
	 */
	function pow(a, power) {
		return baseOperator(a, power, function(a, power) {
			return Math.pow(a, power);
		});
	}

	/**
	 * The nth-root of a number.
	 *
	 * @method   root
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a      The number or list to be calculated.
	 * @param    {(number|array)} degree The degree.
	 *
	 * @return   {(number|array)}        The result, number or list.
	 *
	 * @example
	 *
	 * var data = [256, 27, 49, 81, 3];
	 * 
	 * var roots = st(data).root(3);
	 * 
	 * console.log(roots.round(3).value());
	 * // => [6.35, 3, 3.659, 4.327, 1.442]
	 * 
	 */
	function root(a, degree) {
		return baseOperator(a, degree, function(a, degree) {
			return Math.pow(a, 1 / degree);
		});
	}

	/**
	 * Short method for `root` for a degree of `2`, the square root.
	 *
	 * @method   sqrt
	 *
	 * @memberOf stats
	 *
	 * @category math
	 *
	 * @param    {(number|array)} a      The number or list to be calculated.
	 *
	 * @return   {(number|array)}        The result, number or list.
	 *
	 * @example
	 * 
	 * var data = [4, 9, 49, 81, 3];
	 * 
	 * var sqrt = st(data).sqrt();
	 * 
	 * console.log(sqrt.round(5).value());
	 * // => [2, 3, 7, 9, 1.73205]
	 * 
	 */
	function sqrt(a) {
		return baseOperator(a, function(a) {
			return Math.sqrt(a);
		});
	}

	function size(a) {
		a = linearize(a);

		return a.length;
	}


	//////////////////////
	// STATISTICS START //
	//////////////////////

	function MeanMethods(value) {
		this.__wrapped__ = _.clone(value);
	}

	/**
	 * Retrieve the average for a data list. If `weight` is provided, calculates
	 * the weighted average.
	 *
	 * @method   mean
	 *
	 * @memberOf stats
	 *
	 * @category statistic
	 *
	 * @param    {array} x      The data set to be calculated.
	 * @param    {array=} [weight] The weight set.
	 *
	 * @return   {number}        Returns the average of `x`.
	 *
	 * @example
	 *
	 * var age = [19, 22, 18, 36, 25];
	 * 
	 * var mean_age = st(age).mean();
	 * 
	 * console.log(mean_age.value());
	 * // => 24
	 * 
	 * // we can set a weight, or the amount of each 'age' occurrence
	 * var weight = [2, 1, 2, 5, 3];
	 * 
	 * var mean_age = st(age).mean(weight);
	 * 
	 * console.log(mean_age.value());
	 * // => 27
	 * 
	 */
	function mean(x, weight) {
		x = linearize(x);

		if (weight === undefined) {
			return sum(x) / x.length;
		}

		weight = linearize(weight);

		var total_weight = sum(weight);

		return sum(baseOperator(x, weight, function(x, w) {
			return x * w;
		})) / total_weight;
	}

	/**
	 * Calculate the geometric mean of a list.
	 *
	 * @method   geometricMean
	 *
	 * @memberOf stats
	 *
	 * @category statistic
	 *
	 * @param    {(number|array)}      x      The list to be calculated.
	 * @param    {(number|array)}      weight An optional list of weights.
	 *
	 * @return   {number}             The geometric mean.
	 *
	 * @example
	 *
	 * var age = [19, 22, 18, 36, 25];
	 * 
	 * var g_mean_age = st(age).geometricMean();
	 * 
	 * console.log(g_mean_age.value());
	 * // => 23.23476365971026
	 * 
	 * // we can set a weight, or the amount of each 'age' occurrence
	 * var weight = [2, 1, 2, 5, 3];
	 * 
	 * var g_mean_age = st(age).geometricMean(weight);
	 * 
	 * console.log(g_mean_age.value());
	 * // => 25.95929409829258
	 * 
	 */
	function geometricMean(x, weight) {

		x = linearize(x);

		if (weight === undefined) {
			return root(multiply(x), x.length);
		}

		weight = linearize(weight);

		var total_weight = sum(weight);

		return root( multiply( pow(x, weight) ), total_weight );
	}	

	/**
	 * Calculates the harmonic mean of a list.
	 *
	 * @method   harmonicMean
	 *
	 * @memberOf stats
	 *
	 * @category statistic
	 *
	 * @param    {[type]}     x      [description]
	 * @param    {[type]}     weight [description]
	 *
	 * @return   {[type]}            [description]
	 *
	 * @example
	 * 
	 * var age = [19, 22, 18, 36, 25];
	 * 
	 * var h_mean_age = st(age).harmonicMean();
	 * 
	 * console.log(h_mean_age.value());
	 * // => 22.581574587625152
	 * 
	 * // we can set a weight, or the amount of each 'age' occurrence
	 * var weight = [2, 1, 2, 5, 3];
	 * 
	 * var h_mean_age = st(age).harmonicMean(weight);
	 * 
	 * console.log(h_mean_age.value());
	 * // => 24.965542589359554
	 * 
	 */
	function harmonicMean(x, weight) {
		x = linearize(x);

		if (weight === undefined) {
			return divide(x.length, sum(inverse(x)));
		}

		weight = linearize(weight);

		var total_weight = sum(weight);

		return divide(total_weight, sum(divide(weight, x)));
	}

	function variance(x, weight, type) {
		x = linearize(x);

		if (_.isString(weight) && type === undefined) {
			type = weight;
			weight = undefined;
		} else if(type === undefined) {
			type = 'unbiased';
		}

		var n = x.length;

		if (type === 'unbiased') {
			n = n - 1;
		} else if (type === 'biased' || type === 'population') {
			n = n;
		}

		var m = mean(x, weight);

		if (weight === undefined) {
			return divide( sum( pow( subtract( x, m ), 2 ) ), n);
		}

		return divide( sum( multiply( weight, subtract( x, m ) ) ), n);
	}

	//MeanWrapper.prototype = mean.prototype;
	//var _mean = {};
	//alias(mean_geometric, ['geometric'], _mean);
	//mixin.call(mean, mean, _mean, true);
	//_.mixin({mean: mean});

	//mean.prototype = MeanWrapper.prototype;

	////////////////////
	// STATISTICS END //
	////////////////////


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
	 * @param    {number} precision A non-negative `integer` that represents the quantity of decimals to be used (zero will return a integer value).
	 *
	 * @return   {(number|array)}           Return the same type of `value`.
	 *
	 * @example
	 *
	 * 
	 * var data = [10.876, 11.9999, 55.000000001];
	 * 
	 * var rounded = st(data).round(2);
	 * 
	 * console.log(rounded.value());
	 * // => [10.88, 12, 55]
	 * 
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

	/**
	 * An internal function to round only numbers.
	 *
	 * @private
	 * @method   baseRound
	 *
	 * @category math
	 *
	 * @param    {number}  num       The `number` to be rounded.
	 * @param    {number}  precision A non-negative `integer` that represents the quantity of decimals to be used (zero will return a integer value).
	 *
	 * @return   {number}            The rounded value.
	 */
	function baseRound(num, precision) {
		// for maximum accuracy, the parameter number for toFixed should be bigger.
		// i.e., for complex calculus, with bigger numbers, this entire function
		// needs to be revised.

		if (num === NEGATIVE_INFINITY || num === POSITIVE_INFINITY)
			return num;

		//  This is a workaround for round up with no decimals.
		var rounded, original_num = num;

		num = parseFloat(num);

		if( precision === 0 )
			num = baseRound(num/10, 1) * 10;

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

	/**
	 * The mixin method is a more robust way for extending constructors and
	 * objects. This implementation is based on the `lodash`, but with big
	 * changes.
	 *
	 * 1. This `mixin` dosen't create a new instance of the last `Wrapper`. This
	 * is justified for the **huge** better of performance by not creating.
	 *
	 * 2. This `mixin` dosen't save the actions applyed to the current
	 * `Wrapper`, it acts like a `pipeline`, calculate and save in the current
	 * `Wrapper`.
	 *
	 * 3. [TODO] This `mixin` can mix nested methods too.
	 *
	 * @method   mixin
	 *
	 * @memberOf utility
	 *
	 * @category utility
	 *
	 * @param    {(object|function)} object  Any `object` or function that will extend the source methods.
	 * @param    {(object|function)} source  Any `object` or function that will be extended.
	 * @param    {(object|boolean)=} options Optional options to be passed. If `true` will force chaining.
	 *
	 * @return   {(object|function)}         Return the `object` extended.
	 */
	function mixin(object, source, options) {
		var chain = true;
		
		if (options === false) {
			chain = false;
		} else if (_.isObject(options) && 'chain' in options) {
			chain = options.chain;
		}

		//options = options || {};

		// set each method (in source) for object
		_.each(source, function(prop, methodName) {
			// this will set the methods to the global stats
			object[methodName] = prop;

			// this will set the methods to the wrapped object.
			// But now, we already have a collection defined, 
			// so we just pass it to the original function;
			// object.prototype[methodName] = prop;
			object.prototype[methodName] = (function(prop, options){
				function mixed() {
					//if (_.isEmpty(arguments))
						//arguments = options.args;

					// __wrapped__ is just one (or) the first argument,
					// so we pass to the first arguments;
					var chainAll = this.__chain__;

					if (chain || chainAll || !_.isEmpty(prop.prototype)) {
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
				}
				
				if (methodName == "geometric") {
					console.log(arguments, this, object, source, options);
				}

				if (!_.isEmpty(prop.prototype)) {
					console.log(prop, this, object, arguments);
					//mixin.call(this, mixed, prop.prototype, {chain: false, args: arguments});

					return mixed;
				} else {
					return mixed;
				}

				return mixed;

				//F.prototype = prop.prototype;

			}.call(object, prop, options));

		}, object);

		return object;
	}

	function alias(fn, aliases, obj) {
		if (!_.isObject(obj) || !fn)
			return;

		_.each(aliases, function(a) {
			this[a] = fn;
		}, obj);

		return obj;
	}


	/** First we define only the global methods */

	var st = {};

	alias(sum,							['sum'], st);
	alias(subtract,					['subtract'], st);
	alias(multiply,					['multiply'], st);
	alias(divide,						['divide'], st);
	alias(ln,								['ln'], st);
	alias(log,							['log'], st);
	alias(sqrt,							['sqrt', 'squareRoot'], st);
	alias(root,							['root', 'rt'], st);
	alias(pow,							['pow', 'power'], st);

	alias(mean,							['mean', 'average', 'expectation', 'ev'], st);
	alias(geometricMean,		['meanGeometric', 'geometricMean'], st);
	alias(harmonicMean,			['meanHarmonic', 'harmonicMean'], st);

	alias(variance,					['var', 'variance'], st);

	alias(linearize,				['linearize'], st);
	alias(round,						['round'], st);

	mixin.call(stats, stats, st, true);

	/** And only after, we added the chainable methods */

	var _st = {};

	alias(value,						['value'], _st);
	alias(copy,							['copy', 'clone'], _st);
	alias(aggregate,				['aggregate'], _st);
	alias(dispatch,					['dispatch'], _st);

	mixin.call(stats, stats, _st, false);


	// extend the Wrapper
	StatsWrapper.prototype = stats.prototype;


	// Apply own methods to the stats and StatsWrapper


	/*--------------------------------------------------------------------------*/

	window.st = stats;
}(window));