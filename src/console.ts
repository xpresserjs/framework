
import fs = require("fs");
declare let $: Xjs;

const args = process.argv.splice(3);
if (args[2] === "--from-tinker") {
    $.$options.isTinker = true;
    args.splice(2, 1);
}

import commands = require("./Console/Commands");

// Require artisan helper Functions
const argCommand = args[0];
if (typeof argCommand === "undefined") {
    $.logErrorAndExit("No command provided!");
}

const loadJobs = (path) => {
    if (fs.existsSync(path)) {
        const jobFiles = fs.readdirSync(path);
        for (let i = 0; i < jobFiles.length; i++) {
            const jobFile = jobFiles[i];
            const jobFullPath = path + "/" + jobFile;

            if (fs.lstatSync(jobFullPath).isDirectory()) {
                loadJobs(jobFullPath);
            } else if (fs.lstatSync(jobFullPath).isFile()) {

                const job = require(jobFullPath);
                if (typeof job !== "object") {
                    $.logErrorAndExit("Job: {" + jobFile + "} did not return object!");

                    if (job.hasOwnProperty("command") || !job.hasOwnProperty("handler")) {
                        $.logErrorAndExit("Job: {" + jobFile + "} is not structured properly!");
                    }
                }

                const jobCommand = "@" + job.command;
                commands[jobCommand] = job;
            }
        }
    }
};

class JobHelper {
    public static end() {
        process.exit();
    }
}

const jobPath = $.path.backend("jobs");
if (argCommand.substr(0, 1) === "@") {
    loadJobs(jobPath);
}

if (typeof commands[argCommand] === "undefined") {

    if (typeof $.$options.isTinker === "boolean" && $.$options.isTinker) {
        $.log("Console Command not found!");
    } else {
        $.logAndExit("Command not found!");
    }

} else {
    // Send only command args to function
    args.splice(0, 1);
    const runFn = commands[argCommand];
    let afterRun = null;
    if (typeof runFn === "object" && typeof runFn.handler === "function") {
        require("./Routes/Loader");
        afterRun = runFn.handler(args, JobHelper);
    } else {
        afterRun = runFn(args, JobHelper);
    }
}
