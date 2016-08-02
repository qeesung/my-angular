/**
 * author      : qeesung
 * email       : 1245712564@qq.com
 * filename    : gulpfile.js
 * create time : Tue Aug  2 20:15:17 2016
 * description : gulp file for test , lint , build and watch
 */

var jshint = require('gulp-jshint');
var gulp   = require('gulp');
var clean = require('gulp-clean');

var reporterFolder = __dirname + '/lint-reporter';
/**
 * clean the lint check folder
 */
gulp.task('clean-lint', function () {
    return gulp.src(reporterFolder, {read:false})
        .pipe(clean({force:true}));
});

/**
 * static check all all javascript files in the src
 */
gulp.task('lint',['clean-lint'] ,function () {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('gulp-jshint-html-reporter',{
            filename:reporterFolder+'/jslink-check.html',
            createMissingFolders: true
        }));
});
