declare namespace NodeJS {
    interface Global {
        $: any;
        _: any;
        moment: any;
    }
}

interface XpresserOptions {
    autoBoot?: boolean;
    isConsole?: boolean;
    isTinker?: boolean;
}
