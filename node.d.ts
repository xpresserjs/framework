declare namespace NodeJS {
    interface Global {
        $: any;
        _: any;
        moment: any;
    }
}
interface XpresserOptions {
    isConsole?: boolean;
    isTinker?: boolean;
}
