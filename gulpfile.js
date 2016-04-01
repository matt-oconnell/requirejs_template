var gulp        = require('gulp');
var babelify 	= require('babelify');
var sass        = require('gulp-sass');
var browserify 	= require('browserify');
var uglify 		= require('gulp-uglify');
var buffer 		= require('vinyl-buffer');
var sourcemaps 	= require('gulp-sourcemaps');
var source 		= require('vinyl-source-stream');
var browserSync = require('browser-sync').create();

/*
 * Serve: Browsersync on dist/sass, dist/js, and *.html changes
 */
gulp.task('serve', ['sass', 'js'], function() {

	browserSync.init({
		proxy: {
			target: 's.box/orca/es6_template'
		}
	});

	gulp.watch('./src/sass/**/*.sass', ['sass']);
	gulp.watch('./src/js/**/*.js', ['js']);
	gulp.watch('**/*.html').on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
	return gulp.src('./src/sass/**/*.sass')
		.pipe(sass())
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream());
});

// Compile ES6
gulp.task('js', function() {
	var bundler = browserify({
		entries: './src/js/app.js',
		debug: true
	});
	bundler.transform('babelify', {presets: ['es2015']});
	bundler.bundle()
		.on('error', function(err) {
			console.error(err);
		})
		.pipe(source('app.js'))
		.pipe(buffer())
		//.pipe(sourcemaps.init({loadMaps: true}))
		//.pipe(uglify())
		//.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/js'));
});

gulp.task('default', ['serve']);