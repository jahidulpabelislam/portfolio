const gulp = require("gulp");

const fs = require("fs");
const exec = require("child_process").exec;

const { assetsDir } = require("./../vendor/jpi/site/dev/config");

const defaultTasks = [];

const errorCallback = function(err) {
    if (err) {
        console.log(err);
    }
};

const runCommand = function(command, callback) {
    return exec(command, function(err, res, stdErr) {
        // If found store in text file
        if (res && res.trim() !== "null") {
            callback(res.trim());
            return;
        }
        // Else log any errors
        console.log(err, res, stdErr);
        callback(null);
    });
};

defaultTasks.push("store-version");
gulp.task("store-version", function(callback) {
    const githubBaseURL = "https://github.com/jahidulpabelislam/portfolio";
    const fileName = `${assetsDir}/version.txt`;
    let versionText = "";

    // Try to get current branch name
    runCommand("git branch | grep \\* | cut --complement -d ' ' -f1", function(branchName) {
        /**
         * We only use branch name as the 'version' if current branch is a dev branch (i.e. not master and not a detached tag state)
         * Else if production, find and get the current running tag to use as the current 'version'
         */
        if (branchName && branchName !== "master" && !branchName.startsWith("(HEAD detached at v")) {
            versionText = `<a href="${githubBaseURL}/tree/${branchName}/" class="link" target="_blank" rel="noopener noreferrer">${branchName}</a>`;
            fs.writeFile(fileName, versionText, errorCallback);
            callback();
            return;
        }

        // Try and get the currently running tag
        runCommand("git describe --abbrev=0 --tags", function(tagName) {
            // If found store in text file
            if (tagName) {
                versionText = `<a href="${githubBaseURL}/releases/tag/${tagName}/" class="link" target="_blank" rel="noopener noreferrer">${tagName}</a>`;
            }
            // Else drop back to branch name if exists else remove version value from file
            else if (branchName) {
                versionText = `<a href="${githubBaseURL}/tree/${branchName}/" class="link" target="_blank" rel="noopener noreferrer">${branchName}</a>`;
            }

            fs.writeFile(fileName, versionText, errorCallback);
            callback();
        });
    });
});

gulp.task("default", gulp.series(defaultTasks));
