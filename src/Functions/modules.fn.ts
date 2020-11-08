import BuildUrl = require("build-url");
import lodash, {LoDashStatic} from "lodash";
import moment from "moment";

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
    }
};

export = modules;