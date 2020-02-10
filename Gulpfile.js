var gulp = require('gulp');
var replace = require('gulp-replace');
var svgo = require('gulp-svgo');
var fs = require('fs');
var exec = require('child_process').exec;
var pack = require('./package.json');
var version = pack.version;

gulp.task('icons', function() {
  return gulp
    .src('./assets/icons/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('./dist/icons'));
});

var svgPattern = /\.svg$/;
gulp.task(
  'res',
  gulp.series('icons', function() {
    var iconData = fs.readdirSync('./dist/icons').reduce(function(icons, file) {
      if (!file.match(svgPattern)) {
        return;
      }

      var name = file.replace(svgPattern, '');
      icons[name] = fs.readFileSync('./dist/icons/' + file, 'utf8');
      return icons;
    }, {});

    return gulp
      .src('./src/coplay.js')
      .pipe(replace("'__ICONS__'", JSON.stringify(iconData)))
      .pipe(gulp.dest('./extensions/chrome'))
      .pipe(gulp.dest('./extensions/firefox'));
  })
);

gulp.task(
  'cp',
  gulp.series('res', function() {
    return gulp
      .src(['./src/*', '!./src/coplay.js'])
      .pipe(gulp.dest('./extensions/chrome'))
      .pipe(gulp.dest('./extensions/firefox'));
  })
);

gulp.task(
  'pack-chrome-extension',
  gulp.series('cp', function(cb) {
    var manifestPath = './extensions/chrome/manifest.json';
    var manifest = JSON.parse(
      fs.readFileSync(manifestPath, { encoding: 'utf8' })
    );
    manifest.version = version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '  '));
    exec(
      "find . -path '*/.*' -prune -o -type f -print | zip ../packed/coplay.chrome.zip -@",
      {
        cwd: 'extensions/chrome'
      },
      function(error) {
        if (error) {
          return cb(error);
        } else {
          cb();
        }
      }
    );
  })
);

gulp.task(
  'pack-firefox-addon',
  gulp.series('cp', function(cb) {
    var manifestPath = './extensions/firefox/manifest.json';
    var manifest = JSON.parse(
      fs.readFileSync(manifestPath, { encoding: 'utf8' })
    );
    manifest.version = version;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, '  '));
    exec(
      "find . -path '*/.*' -prune -o -type f -print | zip ../packed/coplay.firefox.zip -@",
      {
        cwd: 'extensions/firefox'
      },
      function(error) {
        if (error) {
          return cb(error);
        } else {
          cb();
        }
      }
    );
  })
);

gulp.task(
  'extensions',
  gulp.series('pack-chrome-extension', 'pack-firefox-addon')
);
gulp.task('default', gulp.series('extensions'));
