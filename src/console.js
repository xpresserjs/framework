// Find XjsConfig
if (typeof XjsConfig === 'undefined') {
    console.log('===> XjsConfig not found!');
    process.exit();
}

if (process.argv.length <= 2) {
    console.log('===> No command provided!');
    process.exit();
}

let args = process.argv;

// Require Framework
global['__isConsole'] = true;
require('./x');

if (args[2] === '--from-tinker') {
    $.isTinker = true;
    args.splice(2, 1);
}

require('./objects/commands.obj');

// Require artisan helper functions
let argCommand = args[2];
if (typeof argCommand === "undefined") {
    $.logErrorAndExit('No command provided!');
}

let commands = $['console:commands'];

const fs = require('fs');
const loadJobs = function (path) {
    if (fs.existsSync(path)) {
        const jobFiles = fs.readdirSync(path);
        for (let i = 0; i < jobFiles.length; i++) {
            const jobFile = jobFiles[i];
            const jobFullPath = path + '/' + jobFile;

            if (fs.lstatSync(jobFullPath).isDirectory()) {
                loadJobs(jobFullPath);
            } else if (fs.lstatSync(jobFullPath).isFile()) {

                const job = require(jobFullPath);
                if (typeof job !== 'object') {
                    $.logErrorAndExit('Job: {' + jobFile + '} did not return object!');

                    if (job.hasOwnProperty('command') || !job.hasOwnProperty('handler')) {
                        $.logErrorAndExit('Job: {' + jobFile + '} is not structured properly!')
                    }
                }

                const jobCommand = '@' + job.command;
                commands[jobCommand] = job;
            }
        }
    }
};

class JobHelper {
    static end() {
        process.exit();
    };
}

const jobPath = $.backendPath('jobs');
if (argCommand.substr(0, 1) === '@') {
    loadJobs(jobPath);
}

if (typeof commands[argCommand] === 'undefined') {

    if (typeof $.isTinker === 'boolean' && $.isTinker) {
        $.log('Console Command not found!');
    } else {
        $.logAndExit('Command not found!')
    }

} else {
    // Send only command args to function
    args.splice(0, 3);
    const runFn = commands[argCommand];
    let afterRun = null;
    if (typeof runFn === 'object' && typeof runFn['handler'] === 'function') {
        afterRun = runFn['handler'](args, JobHelper);
    } else {
        afterRun = runFn(args, JobHelper);
    }
}