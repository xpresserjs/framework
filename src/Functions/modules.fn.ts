import BuildUrl from "build-url";
import lodash, {LoDashStatic} from "lodash";
import moment from "moment";
import momentT from "moment-timezone";

const modules = {
    /**
     * Return lodash
     */
    lodash(): LoDashStatic {
        return lodash;
    },

    buildUrl(): any {
        return BuildUrl;
    },

    moment(): typeof moment {
        return moment;
    },

    momentT(): typeof momentT {
        return momentT
    }
};

export = modules;
