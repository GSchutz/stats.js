/**
 * Example.js is a demonstration of the Stats.js
 */

_.mixin(_.pick(st, ['subtract', 'divide', 'multiply', 'sum']));

console.log(_.sum(1,2));

var __perf_counter = 0;
	
console.log(' ------ test 1 -------')

var calc = st(1)
	.sum(3)
	.divide(2)
	.sum(4)
	.multiply(2)
	.subtract(3)
	.sum(1)
	.multiply(3);

console.log(calc.value());

console.log(' ------ test 2 -------')

function test2() {
	var funcs = ['divide', 'divide', 'multiply', 'sum'];

	var calc = _(1);

	for(var i = 0; i < 10000; i++) {
		calc = calc[_(funcs).sample()](_.random(1, 10));
	}

	var r = calc.take(1000).value();

	console.log(r);

	return r;
};

//perf(function() {
//	console.log(perf(test2).value());
//});
perf(test2)

console.log(' ------ test 3 -------')

function test3() {
	var funcs = ['divide', 'divide', 'multiply', 'sum'];

	var r = 1;

	for(var i = 0; i < 100000; i++) {
		r = st[_(funcs).sample()](r, _.random(1, 10));
	}

	console.log(r);

	return r;
};

//perf(test3);



function perf(fn) {
	__perf_counter += 1;

	var i = (new Date()).getTime();

	var v = fn();

	var o = (new Date()).getTime();

	console.log(o - i);

	return v;
}