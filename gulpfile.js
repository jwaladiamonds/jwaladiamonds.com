const fs = require('fs')
const del = require('del')
const gulp = require('gulp')
const crypto = require('crypto')
const babel = require('gulp-babel')
const terser = require('gulp-terser')
const concat = require('gulp-concat')
const gulpSass = require('gulp-sass')
const nodeSass = require('node-sass')
const postcss = require('gulp-postcss')
const browserSync = require('browser-sync').create()

const sass = gulpSass(nodeSass)
const sha384 = (buffer) => crypto
  .createHash('sha384')
  .update(buffer)
  .digest('base64')

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
    css: 'all.min.css',
    css_dir: 'app/public/css/',
    css_file: 'app/public/css/all.min.css',
    css_final: 'public/css/all.min.css',
    js: 'all.min.js',
    js_dir: 'app/public/js/',
    js_file: 'app/public/js/all.min.js',
    js_final: 'public/js/all.min.js'
  }
}

gulp.task('clean-js', () => del([paths.public.js_dir]))
gulp.task('clean-css', () => del([paths.public.css_dir]))
gulp.task('clean', gulp.series(['clean-js', 'clean-css']))

gulp.task('js', () => gulp.src([paths.assets.js])
  .pipe(babel())
  .pipe(concat(paths.public.js))
  .pipe(terser())
  .pipe(gulp.dest(paths.public.js_dir)))

gulp.task('css', () => gulp.src([paths.assets.css])
  .pipe(concat(paths.public.css))
  .pipe(postcss([require('autoprefixer'), require('cssnano')]))
  .pipe(gulp.dest(paths.public.css_dir)))

gulp.task('sass', () => gulp.src(paths.assets.sass)
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(paths.assets.css_dir))
  .pipe(browserSync.stream()))

gulp.task('inject', function (done) {
  let injectCSS = true
  let injectJS = true
  let cssTag, newCSS, jsTag, newJS
  let injected = null

  try {
    const cssBuffer = fs.readFileSync(paths.public.css_file)
    const cssHash = 'sha384-' + sha384(cssBuffer)
    cssTag = /<link href=.+all\.min\.css.+(\n?.*integrity.+\n?.+crossorigin.+)?>/i
    newCSS = `<link href="${paths.public.css_final}" rel="stylesheet"
    integrity="${cssHash}" crossorigin="anonymous">`
  } catch (error) {
    console.log(error)
    injectCSS = false
  }

  try {
    const jsBuffer = fs.readFileSync(paths.public.js_file)
    const jsHash = 'sha384-' + sha384(jsBuffer)
    jsTag = /<script src=.+all\.min\.js.+(\n?.*integrity.+\n?.+crossorigin.+)?><\/script>/i
    newJS = `<script src="${paths.public.js_final}"
    integrity="${jsHash}" crossorigin="anonymous"></script>`
  } catch (error) {
    console.log(error)
    injectJS = false
  }

  fs.readFile('./app/index.html', 'utf8', (err, html) => {
    if (err) throw (err)

    if (injectCSS && injectJS) injected = html.replace(cssTag, newCSS).replace(jsTag, newJS)
    else if (injectCSS) injected = html.replace(cssTag, newCSS)
    else if (injectJS) injected = html.replace(jsTag, newJS)
    else throw (new Error('Nothing to inject'))

    fs.writeFile('./app/index.html', injected, 'utf8', (err) => done(err))
  })
})

gulp.task('reload', function (done) {
  browserSync.reload()
  done()
})

gulp.task('serve', function (done) {
  browserSync.init({
    server: paths.root_dir,
    index: paths.index
  })
  gulp.watch(paths.assets.js, gulp.series(['js', 'inject']))
  gulp.watch(paths.assets.css, gulp.series(['css', 'inject']))
  gulp.watch(paths.assets.sass, gulp.series(['sass']))
  gulp.watch(paths.html, gulp.series(['reload']))
  done()
})

gulp.task('pack', gulp.series(['sass', 'css', 'js', 'inject']))
gulp.task('default', gulp.series(['clean', 'pack', 'serve']))
