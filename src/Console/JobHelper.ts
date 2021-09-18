import {getInstance} from "../../index";
import {exec} from "child_process";

const $ = getInstance();

class JobHelper {
    public name: string | null = null;
    public $: typeof $;

    constructor(name: string) {
        if (name) this.name = name;
        this.$ = $;
    }

    /**
     * Check if job was called from xjs-cli
     */
    public isFromXjsCli() {
        return $.options.isFromXjsCli
    }

    public end(silent: boolean = false) {
        if (!silent) {
            $.log(`Job: (${this.name}) ran at: ${$.helpers.now()}`);
        }

        return $.exit();
    }


    /**
     * Dispatch a job from anywhere in your application.
     * @param job
     * @param args
     */
    static dispatch(job: string, args: any[] = []) {
        /**
         * Set Time to 1secs
         */
        setTimeout(() => {
            /**
             * Add to next tick.
             */
            process.nextTick(() => {
                // Show logs if in development
                const showLog = $.config.get("env") === "development";

                // Get Project base path using `tsBaseFolder | default base`
                const base = $.engineData.get("tsBaseFolder", $.path.base());

                // Get main module and remove base path out of it.
                const mainModule = require.main!.filename.replace(base, "");

                // Use `ts-node` if is typescript.
                const app = $.isTypescript() ? "npx ts-node" : "node";

                // Build Command
                const command = `cd ${base} && ${app} .${mainModule} cli @${job} ${args.join(" ")}`.trim();

                // Execute command
                exec(command, (err, stdout) => {
                    if (showLog) {
                        if (err) console.error(err);
                        else console.log((stdout || "").trim());
                    }
                });
            });
        }, 1000);
    }
}

export = JobHelper;