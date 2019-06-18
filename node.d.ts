declare namespace NodeJS {
    interface Global {
        $: Xpresser;
        _: any;
        moment: any;
    }
}
interface XpresserOptions {
    isConsole?: boolean;
    isTinker?: boolean;
}
