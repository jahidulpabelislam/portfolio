const gulp = require("gulp");

const HubRegistry = require("gulp-hub");

let srcs = ["./dev/gulpfile.js"];

const env = process.env.NODE_ENV || "production";
if (env !== "production") {
    srcs.push("./vendor/jpi/site/dev/gulpfile.js");
}

const hub = new HubRegistry(srcs);

gulp.registry(hub);
