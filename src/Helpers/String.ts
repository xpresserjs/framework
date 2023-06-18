class  StringHelper {
    static upperFirst(str: string) {
        return str[0].toUpperCase() + str.substring(1);
    }

    static lowerFirst(str: string) {
        return str[0].toLowerCase() + str.substring(1);
    }

    static hasSuffix(str: string, suffix: string)  {
        return str.slice(-suffix.length) === suffix;
    }

    static withSuffix(str: string, suffix: string)  {
        if (!this.hasSuffix(str, suffix)) {
            str += suffix;
        }
        return str;
    }

    static withoutSuffix(str: string, suffix: string)  {
        if (this.hasSuffix(str, suffix)) {
            str = str.substring(0, str.length - suffix.length);
        }
        return str;
    }
}

export default StringHelper;
