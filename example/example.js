/**
 * Example.js is a demonstration of the Stats.js
 */
var __perf_counter = 1;
var __eg_counter = 1;

/*------------- //////////////////// -------------*/
/*------------- // START Examples // -------------*/
/*------------- //////////////////// -------------*/

function eg(method) {
	console.log('------- '+ __eg_counter +') Example '+ method +' -------')
	return __eg_counter++;
}

//////////////////
// Example: sum //
//////////////////
eg('sum');

var data = [5,7,1,4];

// sum all data values
var calc = st(data).sum();

console.log(calc.value());
// => 17

// sum all data values
var calc = st(data).sum([2,3,1,2]);

console.log(calc.value());
// => 17

// sum data values by values
var values = [1,0,2,-2];

var calc = st(data).sum(values);

console.log(calc.value());
// => [6, 7, 3, 2]


///////////////////////
// Example: subtract //
///////////////////////
eg('subtract');

var data = [5,7,1,4];

// subtract '1' from all data values
var calc = st(data).subtract(1);

console.log(calc.value());
// =>  [4, 6, 0, 3]

// subtract each data value by each values
var values = [1,0,2,-2];

var calc = st(data).subtract(values);

console.log(calc.value(), data);
// => [3, 6, -2, 5]


/////////////////////
// Example: divide //
/////////////////////
eg('divide');

var data = [5, 7, 1, 4];

// divide '2' from all data values
var calc = st(data).divide(2);

console.log(calc.value());
// =>  [2.5, 3.5, 0.5, 2]

// divide each data value by each values
var values = [1, 7, 0.5, -2];

var calc = st(data).divide(values);

console.log(calc.value(), data);
// => [5, 1, 2, -2]


/////////////////////
// Example: multiply //
/////////////////////
eg('multiply');

var data = [-3, 1, 0, 0.5, 17];

// multiply all data values by '2'
var calc = st(data).multiply(2);

console.log(calc.value());
// =>  [-6, 2, 0, 1, 34]

// multiply each data value by each values
var values = [3, 7, -2, 0.5, -1];

var calc = st(data).multiply(values);

console.log(calc.value());
// => [-9, 7, -0, 0.25, -17]


////////////////////////
// Example: aggregate //
////////////////////////
eg('aggregate');

var data = [1,2,3,4];

var calc = st(data)
	// start aggregate
	.aggregate()
		.sum([2,-6,2,2])
		.sum(-2)
	// stop aggregate
	.dispatch();

console.log(calc.value());
// => [1, -6, 3, 4]


////////////////////////
// Example: aggregate //
////////////////////////
eg('copy');

var price = st([10, 30, 80]);

var newPrice = price.multiply(1.1);

console.log(price.value());
// => [11, 33, 88]

console.log(newPrice.value());
// => [11, 33, 88]

// The price has been changed, 
// because we create one wrapper.
// If this is a problem, just make a copy:

var price = st([10, 30, 80]);

var newPrice = price.copy().multiply(1.1);

console.log(price.value());
// => [10, 30, 80]

console.log(newPrice.value());
// => [11, 33, 88]



////////////////////
// Example: round //
////////////////////
eg('round');

var price = st([10.876, 11.001, 55.000000001]).round(10);

console.log(price);
// => [2, 4, 6, 8]


/*------------- ////////////////// -------------*/
/*------------- // END Examples // -------------*/
/*------------- ////////////////// -------------*/
	

function sum() {
	var calc = st([1,4])
		.sum([3,2,5])
		.sum(4);

	return calc.value();
}

perf(sum);
	

function divide() {
	var calc = st([1,2,2])
		.divide(2)
		.divide([2,2]);


	return calc.value();
}

perf(divide);

function subtract() {
	var calc = st([13,23])
		.subtract(3)
		.sum([4,5])
		.subtract([0,5])
		.sum();


	return calc.value();
}

perf(subtract);

//console.log(calc.value(), calc2.value());


function test2() {
	var funcs = ['divide', 'divide', 'multiply', 'sum'];

	var calc = st(1);

	for(var i = 0; i < 100000; i++) {
		calc[_(funcs).sample()](_.random(1, 10));
	}

	var r = calc.value();

	console.log(r);

	return r;
};

//perf(test2)

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

var soma = function(a,b) {
	return a + b;
}

function test4()  {
	var a = [2,34,5,-46,7,-7,-4,-3,4];
	var r = 0;

	r = st(a).sum();

	console.log(a.length);

	return r;
}

//console.log(perf(test4));


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