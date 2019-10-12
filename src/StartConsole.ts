import fs = require("fs");
import {Xpresser} from "../xpresser";

declare let $: Xpresser;

const args: any[] = process.argv.splice(3);

if (args[2] === "--from-tinker") {
    $.options.isTinker = true;
    args.splice(2, 1);
}

import commands = require("./Console/Commands");

// Require artisan helper Functions
const argCommand: string = args[0];
if (typeof argCommand === "undefined") {
    $.logErrorAndExit("No command provided!");
}
const DefinedCommands = {};
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
                DefinedCommands[jobCommand] = job;
            }
        }
    }
};

const JobHelper = {
    end() {
        $.exit();
    },
};

if (argCommand.substr(0, 1) === "@") {
    const jobPath = $.path.backend("jobs");
    loadJobs(jobPath);
}

if (typeof commands[argCommand] === "undefined" && typeof DefinedCommands[argCommand] === "undefined") {

    if ($.options.isTinker) {
        $.log("Console Command not found!");
    } else {
        $.logAndExit("Command not found!");
    }

} else {
    // Send only command args to function
    args.splice(0, 1);

    if (typeof commands[argCommand] === "function") {
        // Run Command
        commands[argCommand](args, JobHelper);
    } else if (typeof DefinedCommands[argCommand] === "object") {
        const command = DefinedCommands[argCommand];

        if (typeof command.handler !== "function") {
            $.logAndExit(`Command: {${argCommand}} has no handler method`);
        }

        // Load Events
        require("./Events/Loader");
        // Process Routes
        require("./Routes/Loader");
        $.routerEngine.processRoutes($.router.routes);

        // Run Command
        command.handler(args, JobHelper);
    }
}
