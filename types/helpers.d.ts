import {LoDashStatic} from "lodash";
import moment from "moment";

declare namespace Xpresser {
    namespace Helpers {
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

            toDate(date?: any, format?: string): any;

            timeAgo(date: any, format?: string): string;
        }

        interface Util {
            extArrayRegex(arr: any[]): (RegExp | string);

            /**
             * Find words in string
             * @param str
             * @param $keywords
             */
            findWordsInString(str: string, $keywords: string[]): RegExpMatchArray | null;

            /**
             * Check if value is a promise
             * @param value - value to check
             * @return boolean
             */
            isPromise(value: any): boolean;

            /**
             * Check if value is an AsyncFunction
             * @param value - value  to check
             * @return boolean
             */
            isAsyncFn(value: any): boolean;

            /**
             * Generate Random string.
             * @param length - Length of string to generate.
             */
            randomStr(length: number): string;

            /**
             * Get Source of RegExp or return string if not regex
             * @param str
             */
            regExpSourceOrString(str: string | RegExp): string;
        }

        interface Base64 {
            /**
             * Encode Str or Object
             * If Object, we will Json.stringify it
             * @param str
             */
            encode(str: string | object): string;

            /**
             * Decode encoded text.
             * @param str
             */
            decode(str: string): string;

            /**
             * Decode To Json Object
             * @param str
             */
            decodeToObject(str: string): object;
        }

        interface Modules {
            /**
             * Lodash Package
             */
            lodash(): LoDashStatic;

            /**
             * Moment Package
             */
            moment(): typeof moment;

            /**
             * BuildUrl Package
             */
            buildUrl(): any
        }
    }
}

export = Xpresser;
