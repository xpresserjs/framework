import {DollarSign} from "../../types";

declare const $: DollarSign;

class JobHelper {
    public name: string | null = null;

    constructor(name: string) {
        if (name) this.name = name;
    }

    public end(silent: boolean = false) {
        if (!silent) {
            $.log(`Job: (${this.name}) ran at: ${$.helpers.now()}`);
        }

        return $.exit();
    }
}

export = JobHelper;