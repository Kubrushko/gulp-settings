var gulp = require( 'gulp' );
var rename = require( 'gulp-rename' );
var sass = require( 'gulp-sass' );
var uglify = require( 'gulp-uglify' );
var autoprefixer = require( 'gulp-autoprefixer' );
var sourcemaps = require( 'gulp-sourcemaps' );
var browserify = require( 'browserify' );
var babelify = require( 'babelify' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var browserSync = require( 'browser-sync' ).create();
var reload = browserSync.reload;

var styleSRC = 'src/scss/style.scss';
var styleDIST = './dist/css/';
var styleWatch = 'src/scss/**/*.scss';

var jsSRC = 'script.js';
var jsFolder = 'src/js/';
var jsDIST = './dist/js/';
var jsWatch = 'src/js/**/*.js';
var jsFILES = [jsSRC];

var htmlWatch = '**/*.html';
var phpWatch = '**/*.php';

gulp.task('browser-sync', function() {
	browserSync.init({
		injectChanges: true,
		server: {
			baseDir: "./"
		}
		/*open: false,
		injectChanges: true,
		proxy: 'https://gulp.dev',
		https: {
			key: '/*.key',
			cert: '/*.crt'
		}*/ /*- это для https на localhost, если есть сертификаты*/
	});
});

gulp.task('style', function(){
	gulp.src( styleSRC )
		.pipe( sourcemaps.init() )
		.pipe( sass({
			errorLogToConsole: true,
			outputStyle: 'compressed'
		}) )
		.on( 'error', console.error.bind( console ) )
		.pipe( autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}) )
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( styleDIST ) )
		.pipe( browserSync.stream() );
});

gulp.task('js', function() {
	jsFILES.map(function( entry ){
		return browserify({
			entries: [jsFolder + entry]
		})
		.transform( babelify, { presets: ['env'] } )
		.bundle()
		.pipe( source( entry ) )
		.pipe( rename({ extname: '.min.js' }) )
		.pipe( buffer() )
		.pipe( sourcemaps.init({ loadMaps: true }) )
		.pipe( uglify() )
		.pipe( sourcemaps.write( './' ) )
		.pipe( gulp.dest( jsDIST ) )
		.pipe( browserSync.stream() );
	});
	// browserify - handles the modules
	// transform babelify - converts es6 js to vanilla js
	// bundle - to one single file
	// source
	// rename .min
	// buffer - after previous steps for creating sourcemaps
	// init sourcemap
	// uglify
	// write sourcemap
	// dist
});

gulp.task('default', ['style', 'js']);

gulp.task('watch', ['default', 'browser-sync'], function(){
	gulp.watch( styleWatch, ['style'] );
	gulp.watch( jsWatch, ['js', reload] );
	gulp.watch( htmlWatch, reload );
	gulp.watch( phpWatch, reload );
});