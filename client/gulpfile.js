var gulp = require('gulp');
var webpack = require('gulp-webpack');
var sass = require('gulp-sass');
var please = require('gulp-pleeease');
var notify = require('gulp-notify');
var cached = require('gulp-cached');
var plumber = require('gulp-plumber');

var config = {
  dest: {
    js: '../priv/static/js',
    styles: '../priv/static/css'
  },
  options: {
    please: {
      minifier: false
    },
    plumber: {
      errorHandler: notify.onError('Error: <%= error.message %>')
    },
    webpack: {
      output: {
        filename: 'bundle.js',
        sourceMapFilename: 'sourcemap'
      },
      module: {
        loaders: [
          {
            test: /\.jsx?$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel'
          }
        ]
      },
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      devtool: 'source-map',
      bail: true // To pass the first error to plumber
    }
  }
};

gulp.task('js', function() {
  gulp.src('./js/app.js')
    .pipe(cached('js'))
    .pipe(plumber(config.options.plumber))
    .pipe(webpack(config.options.webpack))
    .pipe(gulp.dest(config.dest.js));
});

gulp.task('styles', function() {
  gulp.src('./styles/**/*.scss')
    .pipe(cached('styles'))
    .pipe(plumber(config.options.plumber))
    .pipe(sass())
    .pipe(please(config.options.please))
    .pipe(gulp.dest(config.dest.styles));
});

gulp.task('watch', ['js', 'styles'], function() {
  gulp.watch('./js/**/*.js', ['js']);
  gulp.watch('./styles/**/*.scss', ['styles']);
});

gulp.task('default', ['watch']);
