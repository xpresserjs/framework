declare namespace Helpers {
    interface Main {
        url($path: string, $query?: object): string;

        route($route: string, $keys?: any[], $query?: object, $includeUrl?: boolean): string;

        config($config: string, $default?: any): any;

        mix(file: string): string;

        env(key: string, $default?: any): any;

        /**
         * Random String Generator
         * @param [length=10]
         */
        randomStr(length: number): string;

        randomArray(length: number): any[];

        now(): string;

        today(): string;

        toDate(date: any, format?: string): any;

        timeAgo(date: any, format?: string): string;
    }
}
