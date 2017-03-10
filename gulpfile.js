var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var cleanCSS = require('gulp-clean-css');
var babel = require('gulp-babel');
var minifyejs = require('gulp-minify-ejs');

var jsDest = 'dist/scripts';

var cssFiles = [
  'node_modules/font-awesome/css/font-awesome.min.css',
  'node_modules/normalizecss/normalize.css',
  'styles.css'
];

var jsFiles = [
  'node_modules/localforage/dist/localforage.min.js',
  'lib/ejs_production.js',
  'node_modules/moment/min/moment.min.js',
  'node_modules/tinycolor2/dist/tinycolor-min.js',
  'dist/scripts/index.js'
];

gulp.task('es6', function() {
  return gulp.src('index.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('ejs', function() {
  return gulp.src('*.ejs')
    //.pipe(minifyejs())
    .pipe(gulp.dest('dist'));
});

gulp.task('js', ['es6'], function() {
  return gulp.src(jsFiles)
    .pipe(concat('scripts.js'))
    .pipe(uglify())
    .pipe(gulp.dest(jsDest));
});

gulp.task('index', function() {
  return gulp.src('index.html')
    .pipe(htmlreplace({
      js: 'scripts/scripts.js',
      css: 'styles/styles.css'
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
  return gulp.src(cssFiles)
    .pipe(concat('styles.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/styles'));
});

gulp.task('fonts', function() {
  return gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('default', ['index', 'js', 'css', 'fonts', 'ejs']);