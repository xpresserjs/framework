"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const Console = require("./Console/Commands");
const PathHelper = require("./Helpers/Path");
const { Commands, Artisan } = Console;
const DefinedCommands = {};
// Get Command Arguments
const args = process.argv.splice(3);
if (args[2] === "--from-tinker") {
    $.options.isTinker = true;
    args.splice(2, 1);
}
// Require Artisan helper Functions
let argCommand = args[0];
// return error if no command is defined.
if (typeof argCommand === "undefined") {
    $.logErrorAndExit("No command provided!");
}
// Trim argCommand
argCommand = argCommand.trim();
/**
 * If default commands does not have `argCommand`
 * Then assume this command:
 * 1. is a plugin command, so load plugins commands
 * 2. is a job.
 */
if (!Commands.hasOwnProperty(argCommand)) {
    /**
     * load plugins commands first since defined jobs may call plugin commands.
     */
    const PluginData = $.engineData.get("PluginEngine:namespaces", {});
    const plugins = Object.keys(PluginData);
    for (const plugin of plugins) {
        const $plugin = PluginData[plugin];
        if ($plugin.hasOwnProperty("commands")) {
            const commands = $plugin["commands"];
            const commandKeys = Object.keys(commands);
            for (const command of commandKeys) {
                Commands[command] = commands[command];
            }
        }
    }
    // Load Job if command has `@` sign before it.
    if (argCommand.substr(0, 1) === "@") {
        argCommand = argCommand.substr(1);
        let jobPath = $.path.backend(`jobs/${argCommand}`);
        // Add project extension if not exists.
        jobPath = PathHelper.addProjectFileExtension(jobPath);
        // Check if job file exists
        if (!fs.existsSync(jobPath)) {
            $.logErrorAndExit(`Job File: (${jobPath}) does  not exists.`);
        }
        /**
         * Require Job and read its configurations.
         */
        const job = require(jobPath);
        if (typeof job !== "object") {
            $.logErrorAndExit("Job: {" + jobPath + "} did not return object!");
            if (!job.hasOwnProperty("handler")) {
                $.logErrorAndExit("Job: {" + jobPath + "} is not structured properly!");
            }
        }
        DefinedCommands[argCommand] = job;
    }
}
/**
 * JobHelper
 *
 *  A class whose instance is passed as the last argument in job handler functions.
 */
const JobHelper = {
    end() {
        $.exit();
    },
};
if (typeof Commands[argCommand] === "undefined" && typeof DefinedCommands[argCommand] === "undefined") {
    if ($.options.isTinker) {
        $.log(`Console Command not found: {${argCommand}}`);
    }
    else {
        $.logAndExit(`Command not found: {${argCommand}}`);
    }
}
else {
    // Send only command args to function
    args.splice(0, 1);
    if (typeof Commands[argCommand] === "function") {
        // Run Command
        Commands[argCommand](args, JobHelper);
    }
    else if (typeof Commands[argCommand] === "string") {
        const command = require(Commands[argCommand]);
        command(args, { artisan: Artisan, helper: JobHelper });
    }
    else if (typeof DefinedCommands[argCommand] === "object") {
        const command = DefinedCommands[argCommand];
        if (typeof command.handler !== "function") {
            $.logAndExit(`Command: {${argCommand}} has no handler method`);
        }
        if (command.use && typeof command.use === "object") {
            const { use } = command;
            // Load Events if use.events
            if (use.events) {
                require("./Events/Loader");
            }
            // Load and Process Routes if use.routes
            if (use.routes) {
                require("./Routes/Loader");
                // Register Routes
                $.routerEngine.processRoutes($.router.routes);
            }
        }
        // Run Command
        command.handler(args, JobHelper);
    }
}
