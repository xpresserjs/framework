declare namespace XpresserHelpers {
    interface Main {
        urlBuilder: any;
        url($path?: string, $query?: object): string;

        route($route: string, $keys?: any[], $query?: object | boolean, $includeUrl?: boolean): string;

        config($config: string, $default?: any): any;

        mix(file: string): string;

        env(key: string, $default?: any): any;

        /**
         * Random String Generator
         * @param [length=10]
         */
        randomStr(length: number): string;

        /**
         * Random Number Generator
         * @param min
         * @param max
         */
        randomInteger(min: number, max: number): number;

        randomArray(length: number): any[];

        now(): string;

        today(): string;

        toDate(date: any, format?: string): any;

        timeAgo(date: any, format?: string): string;
    }

    interface FN {
        extArrayRegex($array: any[]): RegExp;

        findWordsInString($string: string, $keywords: string[]): string;

        isPromise($promise: any): boolean;

        randomStr(length: number): string;
    }

    interface Base64 {
        /**
         * Encode Str or Object
         * If Object, we will Json.stringify it
         */
        encode(str: string | object): string;

        /**
         * Decode encoded text.
         */
        decode(str: string): string;

        /**
         * Decode To Json Object
         */
        decodeToJson(str: string): object;
    }
}
