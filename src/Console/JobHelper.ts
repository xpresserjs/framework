import {getInstance} from "../../index";
import {DollarSign} from "../../types";
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
    public isFromXjsCli(){
        return $.options.isFromXjsCli
    }

    public end(silent: boolean = false) {
        if (!silent) {
            $.log(`Job: (${this.name}) ran at: ${$.helpers.now()}`);
        }

        return $.exit();
    }
}

export = JobHelper;