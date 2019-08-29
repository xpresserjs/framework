export = {
    extArrayRegex($array: []) {
        let regex = "\\.+(";
        const regexEnd = ")";

        if (!$array.length) {
            return regex + regexEnd;
        }

        for (let i = 0; i < $array.length; i++) {
            regex = regex + $array[i] + "|";
        }

        regex = regex.substr(0, regex.length - 1);
        regex = regex + regexEnd;

        return new RegExp(regex, "g");
    },

    findWordsInString($string: string, $keywords: []) {
        if (!$keywords.length) {
            return null;
        }

        let regex = "";

        for (let i = 0; i < $keywords.length; i++) {
            regex = regex + "\\b" + $keywords[i] + "|";
        }

        regex = regex.substr(0, regex.length - 1);
        const pattern = new RegExp(regex, "g");
        return $string.match(pattern);
    },

    isPromise($promise: any) {
        return $promise !== undefined && typeof $promise === "object" && typeof $promise.then === "function";
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

    regExpSourceOrString($string: string | RegExp) {
        if ($string instanceof RegExp) {
            return $string.source;
        }

        return $string;
    },
};
