/**
 * Xpresser Util Functions
 * @type Xpresser.Helpers.Util
 */
export = {
    extArrayRegex(arr: []): RegExp | string {
        let regex = "\\.+(";
        const regexEnd = ")";

        if (!arr.length) {
            return regex + regexEnd;
        }

        for (let i = 0; i < arr.length; i++) {
            regex = regex + arr[i] + "|";
        }

        regex = regex.substr(0, regex.length - 1);
        regex = regex + regexEnd;

        return new RegExp(regex, "g");
    },

    findWordsInString(str: string, keywords: []): RegExpMatchArray {
        if (!keywords.length) {
            return null;
        }

        let regex = "";

        for (let i = 0; i < keywords.length; i++) {
            regex = regex + "\\b" + keywords[i] + "|";
        }

        regex = regex.substr(0, regex.length - 1);
        const pattern = new RegExp(regex, "g");
        return str.match(pattern);
    },

    isPromise(value: any): boolean {
        return value !== undefined && typeof value === "object" && typeof value.then === "function";
    },

    /**
     * Check if value is an AsyncFunction
     * @param fn
     */
    isAsyncFn(fn: () => any): boolean {
        return typeof fn === "function" && fn.constructor.name === "AsyncFunction";
    },

    randomStr(length = 10) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let i = 0;
        while (i < length) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            i++;
        }
        return text;
    },

    regExpSourceOrString(str: string | RegExp) {
        if (str instanceof RegExp) {
            return str.source;
        }

        return str;
    },
};
