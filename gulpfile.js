const del = require('del');
const gulp = require('gulp');
const rev = require('gulp-rev');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const minify = require('gulp-minify');
const concat = require('gulp-concat');
const gulpSass = require('gulp-sass');
const nodeSass = require('node-sass');
const cleanCss = require('gulp-clean-css');
const browserSync = require('browser-sync').create();

const sass = gulpSass(nodeSass)

const paths = {
    root_dir: './app',
    index: './index.html',
    html: 'app/*.html',
    assets: {
        css_dir: 'app/assets/css/',
        css: 'app/assets/css/*.css',
        js: 'app/assets/js/*.js',
        sass: 'app/assets/scss/*.scss'
    },
    public: {
        dir: 'app/public/',
        css_dir: 'app/public/css/',
        css: 'all.min.css',
        js_dir: 'app/public/js/',
        js: 'all.min.js',
        cache: 'app/public/rev-manifest.json'
    }
};

gulp.task('clean-cache', function () {
    return del([paths.public.cache]);
});

gulp.task('clean-js', function () {
    return del([paths.public.js_dir]);
});
 
gulp.task('clean-css', function () {
    return del([paths.public.css_dir]);
});

gulp.task('clean', gulp.series(['clean-cache', 'clean-js', 'clean-css']))

gulp.task('pack-js', function () {    
    return gulp
        .src([paths.assets.js], { sourcemaps: true })
        .pipe(babel())
        .pipe(uglify())
        .pipe(concat(paths.public.js))
        .pipe(minify({
            ext:{
                min:'.js'
            },
            noSource: true
        }))
        .pipe(rev())
        .pipe(gulp.dest(paths.public.js_dir))
        .pipe(rev.manifest(paths.public.cache, {
            merge: true
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('pack-css', function () {    
    return gulp
        .src([paths.assets.css])
        .pipe(concat(paths.public.css))
        .pipe(cleanCss())
        .pipe(rev())
        .pipe(gulp.dest(paths.public.css_dir))
        .pipe(rev.manifest(paths.public.cache, {
            merge: true
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('compile-sass', function() {
    return gulp
    .src(paths.assets.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(paths.assets.css_dir))
    .pipe(browserSync.stream());
})

gulp.task('pack', gulp.series(['compile-sass', 'pack-css', 'pack-js']));

gulp.task('reload', function(done){
    browserSync.reload();
    done();
});

gulp.task('serve', function(done) {
    browserSync.init({
        server: paths.root_dir,
        index: paths.index,
    });
    gulp.watch(paths.assets.js, gulp.series(['pack-js', 'reload']));
    gulp.watch(paths.assets.css, gulp.series(['pack-css', 'reload']));
    gulp.watch(paths.assets.sass, gulp.series(['compile-sass', 'reload']));
    done();
});

gulp.task('default', gulp.series(['clean', 'pack', 'serve']));