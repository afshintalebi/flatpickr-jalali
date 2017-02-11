// Base Gulp File
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    notify = require('gulp-notify'),
    del = require('del'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),
    runSequence = require('run-sequence'),
    gulpIgnore = require('gulp-ignore'),
    obfuscate = require('gulp-js-obfuscator'),
    browserSync = require('browser-sync'),
    browserify = require('gulp-browserify'),
    preprocess = require('gulp-preprocess'),
    argv = require('yargs').argv;

var env = argv.production ? 'production' : 'development',
    isProduction = argv.production ? true : false,
    outputDir = './dist',
    sourceDir = './src';

var jsSources=[
        sourceDir + '/js/*.js'
    ],
    copySources=[],
    jsIgnores=[
    ],
    obfuscateIgonres = [];

// BrowserSync Task (Live reload)
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: outputDir
        }
    })
});

// Html preprocess
gulp.task('html', function() {
    gulp.src(sourceDir+'/index.html',{base:sourceDir})
        .pipe(preprocess({context: { env: 'production', DEBUG: true}})) //To set environment variables in-line
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notify('index file saved'));
});

// Copy & minify JS files
gulp.task('js', function() {
    return gulp.src(jsSources,{base:sourceDir})
        .pipe(gulpif(Array.isArray(jsIgnores) && jsIgnores.length > 0,gulpIgnore.exclude(jsIgnores)))
        .pipe(browserify({
            // insertGlobals : true,
            debug : !isProduction
        }))
        .pipe(gulpif(isProduction && Array.isArray(obfuscateIgonres) && obfuscateIgonres.length > 0,obfuscate({}, obfuscateIgonres)))
        // .pipe(concat('scripts.js'))
        .pipe(gulpif(env == 'production', uglify()))
        .pipe(gulp.dest(outputDir))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(notify('Js files saved'));
});

// Copy & minify JS files
gulp.task('assets', function() {
    return gulp.src(sourceDir+'/assets/**/*',{base:sourceDir})
        .pipe(gulp.dest(outputDir));
});
// Gulp Watch Task
gulp.task('watch', ['browserSync'], function () {
    gulp.watch(jsSources, ['js']);
    gulp.watch(sourceDir+'/index.html',['html']);
});


// Gulp default task
gulp.task('default'/*,['clean']*/,function () {
    runSequence('watch');
});

// Gulp build task: make js and copy files
gulp.task('build',function () {
    runSequence('assets','js','html','watch');
});