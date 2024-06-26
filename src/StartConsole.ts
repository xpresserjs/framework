import fs from "fs";

import {getInstance} from "../index";
import PathHelper from "./Helpers/Path";
import JobHelper from "./Console/JobHelper";
import Console from "./Console/Commands";


const {Commands, Artisan}: { Commands: Record<string, any>, Artisan: Record<string, any> } = Console;
const DefinedCommands: Record<string, any> = {};
const $ = getInstance();

// Get Command Arguments
const cloneArgs = [...process.argv];
const args: any[] = cloneArgs.splice(3);

// Check if command is from xjs-cli
if (args[args.length - 1] === "--from-xjs-cli") {

    // if true, set isFromXjsCli to true,
    $.options.isFromXjsCli = true;

    // remove --from-xjs-cli from args and process.argv
    args.length = args.length - 1;
    process.argv.length = process.argv.length - 1;
}

// Require Artisan helper Functions
let argCommand: string = args[0];

// return error if no command is defined.
if (typeof argCommand === "undefined") {
    $.logErrorAndExit("No command provided!");
}

// Trim argCommand
argCommand = argCommand.trim();

let isJobCommand = argCommand.substring(0, 1) === "@";

/*
 If default commands does not have `argCommand`
 Then assume this command:
 1. is a plugin command, so load plugins commands
 2. is a job.
 */
if (isJobCommand || !Commands.hasOwnProperty(argCommand)) {

    /*
    load plugins commands first since defined jobs may call plugin commands.
     */
    const PluginData: any = $.engineData.get("PluginEngine:namespaces", {});
    const plugins = Object.keys(PluginData);

    for (const plugin of plugins) {
        const $plugin: Record<string, any> = PluginData[plugin];

        if ($plugin.hasOwnProperty("commands")) {
            const commands: Record<string, any> = $plugin["commands"];
            const commandKeys = Object.keys(commands);

            for (const command of commandKeys) {
                Commands[command] = commands[command];
            }
        }
    }

    // Load Job if command has `@` sign before it.
    if (isJobCommand) {
        argCommand = argCommand.substring(1);
        let jobPath = $.path.backend(`jobs/${argCommand}`);
        // Add project extension if not exists.
        jobPath = PathHelper.addProjectFileExtension(jobPath);

        // Check if job file exists
        if (!fs.existsSync(jobPath)) {
            $.logErrorAndExit(`Job: (${argCommand}) does  not exist.`);
        }

        /*
         * Require Job and read its configurations.
         */
        const job = require(jobPath);
        if (typeof job !== "object") {
            $.logErrorAndExit("Job: {" + argCommand + "} did not return object!");

            if (!job.hasOwnProperty("handler")) {
                $.logErrorAndExit("Job: {" + argCommand + "} is not structured properly!");
            }
        }

        DefinedCommands[argCommand] = job;
    }
}

if (typeof Commands[argCommand] === "undefined" && typeof DefinedCommands[argCommand] === "undefined") {

    if ($.options.isTinker) {
        $.log(`Console Command not found: {${argCommand}}`);
    } else {
        $.logAndExit(`Command not found: {${argCommand}}`);
    }

} else {
    const jobHelper = new JobHelper(argCommand);

    // Send only command args to function
    args.splice(0, 1);

    if (typeof Commands[argCommand] === "function") {
        // Run Command
        if (argCommand === 'routes') {
            require("./Routes/Loader");
            // Register Routes
            $.routerEngine.processRoutes($.router.routes);
        }

        Commands[argCommand](args, jobHelper);

    } else if (typeof Commands[argCommand] === "string") {

        const command = require(Commands[argCommand]);
        command(args, {artisan: Artisan, helper: jobHelper});

    } else if (typeof DefinedCommands[argCommand] === "object") {

        const command: {
            use?: {
                events: boolean,
                routes: boolean,
            },
            command?: string,
            schedule?: string,
            handler: (...args: any[]) => (any | void),
        } = DefinedCommands[argCommand];

        if (typeof command.handler !== "function") {
            $.logAndExit(`Command: {${argCommand}} has no handler method`);
        }

        if (command.use && typeof command.use === "object") {
            const {use} = command;

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
        try {
            command.handler(args, jobHelper);
        } catch (e) {
            $.logPerLine([
                {error: `Error in command: {${argCommand}}`},
                {errorAndExit: e},
            ]);
        }

    }
}
