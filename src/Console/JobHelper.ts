import {DollarSign} from "../../types";

declare const $: DollarSign;

class JobHelper {
    public job: string | null = null;

    constructor(job: string) {
        if (job) this.job = job;
    }

    public end(silent = false) {
        if (!silent) {
            $.log(`Job: (${this.job}) ran at: ${$.helpers.now()}`);
        }

        return $.exit();
    }
}

export = JobHelper;