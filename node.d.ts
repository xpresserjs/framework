declare namespace NodeJS {
    interface Global {
        $: any;
        _: any;
    }
}
interface XpresserOptions {
    isConsole?: boolean;
    isTinker?: boolean;
}