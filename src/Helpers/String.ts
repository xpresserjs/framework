const StringHelper = {
    upperFirst: (str: string) => {
        return str[0].toUpperCase() + str.substring(1);
    },

    lowerFirst: (str: string) => {
        return str[0].toLowerCase() + str.substring(1);
    },

    hasSuffix: (str: string, suffix: string) => {
        return str.slice(-suffix.length) === suffix;
    },

    withSuffix: (str: string, suffix: string) => {
        if (!StringHelper.hasSuffix(str, suffix)) {
            str += suffix;
        }
        return str;
    },

    withoutSuffix: (str: string, suffix: string) => {
        if (StringHelper.hasSuffix(str, suffix)) {
            str = str.substring(0, str.length - suffix.length);
        }
        return str;
    },
};

export = StringHelper;
