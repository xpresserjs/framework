"use strict";
const self = {
    upperFirst: (str) => {
        return str[0].toUpperCase() + str.substr(1);
    },
    lowerFirst: (str) => {
        return str[0].toLowerCase() + str.substr(1);
    },
    hasSuffix: (str, suffix) => {
        return str.substr(-suffix.length) === suffix;
    },
    withSuffix: (str, suffix) => {
        if (!self.hasSuffix(str, suffix)) {
            str += suffix;
        }
        return str;
    },
    withoutSuffix: (str, suffix) => {
        if (self.hasSuffix(str, suffix)) {
            str = str.substr(0, str.length - suffix.length);
        }
        return str;
    },
};
module.exports = self;
//# sourceMappingURL=String.js.map