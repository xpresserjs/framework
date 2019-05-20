const self = {
    upperFirst: (str: string) => {
        return str[0].toUpperCase() + str.substr(1);
    },

    lowerFirst: (str: string) => {
        return str[0].toLowerCase() + str.substr(1);
    },

    hasSuffix: (str: string, suffix: string) => {
        return str.substr(-suffix.length) === suffix;
    },

    withSuffix: (str: string, suffix: string) => {
        if (!self.hasSuffix(str, suffix)) {
            str += suffix;
        }
        return str;
    },

    withoutSuffix: (str: string, suffix: string) => {
        if (self.hasSuffix(str, suffix)) {
            str = str.substr(0, str.length - suffix.length)
        }
        return str;
    },
};

export = self;
