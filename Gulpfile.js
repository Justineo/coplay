var gulp = require('gulp');
var replace = require('gulp-replace');
var svgo = require('gulp-svgo');
var Datauri = require('datauri');
var fs = require('fs');
var exec = require('child_process').exec;
var pack = require('./package.json');
var version = pack.version;

gulp.task('icons', function () {
  return gulp.src('./assets/icons/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('./dist/icons'));
});

var svgPattern = /\.svg$/
gulp.task('res', ['icons'], function () {
  var iconData = fs.readdirSync('./dist/icons').reduce(function (icons, file) {
    if (!file.match(svgPattern)) {
      return
    }

    var name = file.replace(svgPattern, '');
    icons[name] = fs.readFileSync('./dist/icons/' + file, 'utf8');
    return icons;
  }, {});

  return gulp.src('./src/coplay.js')
    .pipe(replace('\'__ICONS__\'', JSON.stringify(iconData)))
    .pipe(gulp.dest('./extensions/chrome'))
    .pipe(gulp.dest('./extensions/firefox/data'));
});

gulp.task('cp', ['res'], function () {
  return gulp.src(['./src/*', '!./src/coplay.js'])
    .pipe(gulp.dest('./extensions/chrome'))
    .pipe(gulp.dest('./extensions/firefox/data'));
});

gulp.task('pack-chrome-extension', ['cp'], function (cb) {
  var manifestPath = './extensions/chrome/manifest.json';
  var manifest = JSON.parse(fs.readFileSync(manifestPath, { encoding: 'utf8' }));
  manifest.version = version;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '  '));
  exec('find . -path \'*/.*\' -prune -o -type f -print | zip ../packed/coplay.zip -@', {
    cwd: 'extensions/chrome'
  }, function (error, stdout, stderr) {
    if (error) {
      return cb(error);
    } else {
      cb();
    }
  });
});

gulp.task('pack-firefox-addon', ['cp'], function (cb) {
  var fxPackPath = './extensions/firefox/package.json';
  var fxPack = JSON.parse(fs.readFileSync(fxPackPath, { encoding: 'utf8' }));
  fxPack.version = version;
  fs.writeFileSync(fxPackPath, JSON.stringify(fxPack, null, '  '));
  exec('jpm xpi', {
    cwd: 'extensions/firefox'
  }, function (error, stdout, stderr) {
    if (error) {
      return cb(error);
    } else {
      fs.renameSync('./extensions/firefox/' + pack.name + '.xpi', './extensions/packed/' + pack.name + '.xpi');
      cb();
    }
  });
});

gulp.task('extensions', ['pack-chrome-extension', 'pack-firefox-addon']);
gulp.task('default', ['extensions']);
