const gulp = require("gulp");

const rename = require("gulp-rename");

const concat = require("gulp-concat");
const uglify = require("gulp-uglify");

const cleanCss = require("gulp-clean-css");
const autoPrefix = require("gulp-autoprefixer");

const sass = require("gulp-sass")(require("node-sass"));

const livereload = require("gulp-livereload");

const { jsDir, cssDir } = require("../config");

let defaultTasks = [];

gulp.task("reload-listen", function(callback) {
    livereload.listen();
    callback();
});

gulp.task("watch-js", function(callback) {
    gulp.watch(`${jsDir}/**/*.js`, function() {
        return gulp.src(`${jsDir}/**/*.js`)
                   .pipe(livereload());
    });

    callback();
});

// Concatenate & minify JS
defaultTasks.push("scripts");
gulp.task("scripts", function() {
    const files = [
        `${jsDir}/third-party/jquery.min.js`,
        `${jsDir}/third-party/waypoint.min.js`,
        `${jsDir}/third-party/jquery.countTo.js`,
        `${jsDir}/jpi/expanded-slide-show.js`,
        `${jsDir}/jpi/slide-show.js`,
        `${jsDir}/jpi/helpers.js`,
        `${jsDir}/jpi/templating.js`,
        `${jsDir}/jpi/ajax.js`,
        `${jsDir}/jpi/modal.js`,
        `${jsDir}/jpi/projects.js`,
        `${jsDir}/jpi/home.js`,
        `${jsDir}/jpi/contact-form.js`,
        `${jsDir}/jpi/nav.js`,
        `${jsDir}/jpi/cookie-banner.js`,
        `${jsDir}/jpi/main.js`,
    ];

    return gulp.src(files)
            .pipe(concat("main.min.js"))
            .pipe(uglify())
            .pipe(gulp.dest(`${jsDir}/`));
});

defaultTasks.push("sass");
gulp.task("sass", function() {
    return gulp.src(`${cssDir}/jpi/*.scss`)
               .pipe(sass().on("error", sass.logError))
               .pipe(gulp.dest(`${cssDir}/jpi/`))
               .pipe(livereload());
});

// Watch scss file changes to compile to css
gulp.task("watch-scss", function(callback) {
    gulp.watch(`${cssDir}/jpi/**/*.scss`, gulp.parallel("sass"));
    callback();
});

// Watch files For changes
gulp.task("watch", gulp.series(["reload-listen", "sass", "watch-scss", "watch-js"]));

// Minify stylesheets
defaultTasks.push("stylesheets");
gulp.task("stylesheets", function() {
    return gulp.src(`${cssDir}/jpi/*.css`)
               .pipe(rename({suffix: ".min"}))
               .pipe(autoPrefix({
                   browsers: ["> 0.1%", "ie 8-11"],
                   remove: false,
               }))
               .pipe(cleanCss({
                   compatibility: "ie8",
               }))
               .pipe(gulp.dest(`${cssDir}/`));
});

gulp.task("default", gulp.series(defaultTasks));
