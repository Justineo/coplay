var gulp = require('gulp');
var uglify = require('gulp-uglify');
var clean = require('gulp-minify-css');
var fs = require('fs');
var exec = require('child_process').exec;

gulp.task('minify-css', function () {
  return gulp.src('./src/coplay.css')
    .pipe(clean({ keepBreaks: true }))
    .pipe(gulp.dest('./extensions/chrome'))
    .pipe(gulp.dest('./extensions/firefox/data'));
});

gulp.task('minify-js', function () {
  return gulp.src('./src/coplay.js')
    .pipe(uglify())
    .pipe(gulp.dest('./extensions/chrome'))
    .pipe(gulp.dest('./extensions/firefox/data'));
});

gulp.task('pack-chrome-extension', ['minify-css', 'minify-js'], function (cb) {
  exec('find . -path \'*/.*\' -prune -o -type f -print | zip ../packed/coplay.zip -@', {
    cwd: 'extensions/chrome'
  }, function (error, stdout, stderr) {
    if (error) {
      return cb(error);
    } else {
      var pack = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }));
      var version = pack.version;
      var manifestPath = './extensions/chrome/manifest.json';
      var manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }));
      manifest.version = version;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '  '));
      cb();
    }
  });
});

gulp.task('pack-firefox-addon', ['minify-css', 'minify-js'], function (cb) {
  exec('cfx xpi --output-file=../packed/coplay.xpi', {
    cwd: 'extensions/firefox'
  }, function (error, stdout, stderr) {
    if (error) {
      return cb(error);
    } else {
      var pack = JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }));
      var version = pack.version;
      var fxPackPath = './extensions/firefox/package.json';
      var fxPack = JSON.parse(fs.readFileSync(fxPackPath, { encoding: 'utf8' }));
      fxPack.version = version;
      fs.writeFileSync(fxPackPath, JSON.stringify(fxPack, null, '  '));
      cb();
    }
  });
});

gulp.task('extensions', ['pack-chrome-extension', 'pack-firefox-addon']);
gulp.task('default', ['extensions']);
