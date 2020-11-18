import {getInstance} from "../../index";
import {DollarSign} from "../../types";

const $ = getInstance();

class JobHelper {
    public name: string | null = null;

    constructor(name: string) {
        if (name) this.name = name;
    }

    /**
     * Use $instance() instead
     * @deprecated
     */
    public xpresserInstance(): DollarSign {
        return $;
    }

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