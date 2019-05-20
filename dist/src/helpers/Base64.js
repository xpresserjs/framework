"use strict";
class Base64 {
    /**
     * Encode Str or Object
     * If Object, we will Json.stringify it
     * @param str
     */
    static encode(str) {
        if (typeof str === "object") {
            str = JSON.stringify(str);
        }
        return Buffer.from(str).toString("base64");
    }
    /**
     * Decode encoded text.
     * @param str
     */
    static decode(str) {
        return Buffer.from(str, "base64").toString("ascii");
    }
    /**
     * Decode To Json Object
     * @param str
     */
    static decodeToJson(str) {
        str = Base64.decode(str);
        return JSON.parse(str);
    }
}
module.exports = Base64;
//# sourceMappingURL=Base64.js.map