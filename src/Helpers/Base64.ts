const Base64 = {
    /**
     * Encode Str or Object
     * If Object, we will Json.stringify it
     * @param str
     */
    encode(str: string | object): string {
        if (typeof str === "object") {
            str = JSON.stringify(str);
        }

        return Buffer.from(str).toString("base64");
    },

    /**
     * Decode encoded text.
     * @param str
     */
    decode(str: string = ""): string {
        return Buffer.from(str, "base64").toString("ascii");
    },

    /**
     * Decode To Json Object
     * @param str
     * @deprecated
     * Use decodeToObject instead.
     * ToBeRemoved:v2.0
     */
    decodeToJson(str: string = ""): object {
        str = Base64.decode(str);
        return JSON.parse(str);
    },

    /**
     * Decode To Json Object
     * @param str
     */
    decodeToObject(str: string = ""): object {
        str = Base64.decode(str);
        return JSON.parse(str);
    },
};

export = Base64;
