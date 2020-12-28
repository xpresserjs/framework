import {getInstance} from "../../index";
import {DollarSign} from "../../types";

const $ = getInstance();

class JobHelper {
    public name: string | null = null;

    constructor(name: string) {
        if (name) this.name = name;
    }

    /**
     * Check if job was called from xjs-cli
     */
    public isFromXjsCli(){
        return $.options.isFromXjsCli
    }

    /**
     * Get current xpresser instance.
     */
    public $(): DollarSign {
        return $;
    }

    /**
     * Use $() instead
     * @deprecated
     */
    public $instance(): DollarSign {
        return $;
    }

    public end(silent: boolean = false) {
        if (!silent) {
            $.log(`Job: (${this.name}) ran at: ${$.helpers.now()}`);
        }

        return $.exit();
    }
}

export = JobHelper;