'use strict';

var gulp		 	=	require('gulp'),
	htmlbuild	 	=	require('gulp-htmlbuild'),
	concat		 	=	require('gulp-concat'),
	uglify		 	=	require('gulp-uglify'),
	livereload	 	=	require('gulp-livereload'),
	rimraf		 	=	require('rimraf'),
	http		 	=	require('http'),
	opn			 	=	require('opn'),
	clivereload	 	=	require('connect-livereload'),
	es			 	=	require('event-stream'),
	connect		 	=	require('connect'),
	serveStatic	 	=	require('serve-static'),
	serveIndex	 	=	require('serve-index');

var lrport = 35900,
	port = 9002,
	environment = './';

var gulpSrcJs = function (opts) {
	var paths = es.through();
	var files = es.through();

	paths.pipe(es.writeArray(function (err, srcs) {

		gulp.src(srcs, opts)
			.pipe(uglify())
			.pipe(files);
	}));

	return es.duplex(paths, files);
};

var jsBuild = es.pipeline(
	concat('stats.js'),
	gulp.dest('./dist')
);

gulp.task('clean', function (cb) {
	rimraf('dist', cb);
});

gulp.task('scripts', function () {
	gulp.src(['./index.html'])
		.pipe(htmlbuild({
			// build js with preprocessor
			js: htmlbuild.preprocess.js(function (block) {

				block.pipe(gulpSrcJs())
					.pipe(jsBuild);

				block.end('stats.js');

			})

		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('connect', function () {
	console.log('Development environment');
	var app = connect()
		.use(clivereload({ port: lrport }))
		.use(serveStatic(environment))
		.use(serveIndex('./'));

	http.createServer(app)
		.listen(port)
		.on('listening', function() {
			console.log('Started connect web server on http://localhost:' + port);
		});
});

gulp.task('serve', ['connect'], function () {

	livereload.listen(lrport);
	opn('http://localhost:' + port);

	gulp.watch([
		'./*.html',
		'./**/*.js',
	]).on('change', livereload.changed);

});

gulp.task('build', ['scripts']);

gulp.task('default', ['clean'], function () {
	//gulp.start('build');
});