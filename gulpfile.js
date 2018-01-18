var gulp = require('gulp'),
    clean = require('gulp-clean'),
    watch = require('gulp-watch'),
    spritesmith = require('gulp.spritesmith'),
    sass = require('gulp-sass'),
    importCss = require('gulp-import-css'),
    sequence = require('run-sequence'),
    merge = require('merge-stream'),
    gls = require('gulp-live-server'),
    opn = require('opn'),
    colors = require('colors');

var config = {
    path: 'static',
    port: 8081,
    
    sprite: {
        image: 'sprite.png',
        css: '_sprite.scss'
    }
};

var server = gls.static(config.path, config.port);

gulp.task('clean', function () {
    return gulp.src(['./' + config.path + '/css', './' + config.path + '/images/sprite.png'], {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

gulp.task('sprite', function () {
    var spriteData = gulp.src(['./assets/sprite-images/*.png', './assets/sprite-images/**/*.png'])
        .pipe(spritesmith({
            imgName: config.sprite.image,
            cssName: config.sprite.css,

            imgPath: '../images/' + config.sprite.image
        }));

    var imageStream = spriteData.img
        .pipe(gulp.dest('./' + config.path + '/images'));

    var cssStream = spriteData.css
        .pipe(gulp.dest('./assets/scss/'));

    return merge(imageStream, cssStream);
});

gulp.task('css', function () {
    return gulp.src('./assets/css/*.css')
        .pipe(importCss())
        .pipe(gulp.dest('./' + config.path + '/css'));
});

gulp.task('sass', function () {
    return gulp.src('./assets/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./' + config.path + '/css'));
});

gulp.task('watch', function () {
    var watch_opts = {
        readDelay: 1000
    };
    var run = function(tasks) {
        return function() {
            sequence(tasks);
        };
    };

    // [sprite-images]
    watch(['./assets/sprite-images/*.png', './assets/sprite-images/**/*.png'], watch_opts, run('sprite'));
    // ['css']
    watch(['./assets/css/*.css', './assets/css/**/*.css'], watch_opts, run('css'));
    // ['sass']
    watch(['./assets/scss/*.scss', './assets/scss/**/*.scss'], watch_opts, run('sass'));
});

gulp.task('default', function () {
    var buildPath = function(paths) {
        var return_paths = [];
        paths.forEach(function(path){
            return_paths.push('./' + config.path + path);
        });

        return return_paths;
    };

    sequence('clean', 'sprite', 'css', 'sass', 'watch', function() {
        server.start();

        watch('./static/**/*', function(file) {
            //console.log(file.relative);
            server.notify.apply(server, [file]);
        });

        console.log('');
        console.log('Recommended to use [' + 'chrome'.yellow + '] browser and install [' + 'LiveReload'.yellow + '] extension');
        console.log('');
        console.log('[LiveReload] extension:');
        console.log('https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=zh-TW'.yellow);
        console.log('');
    });
});

gulp.task('dev', function() {
    sequence('default', function() {
        opn('http://localhost:' + config.port, { app: 'chrome' });
    });
});