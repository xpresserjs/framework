declare namespace NodeJS {
    interface Global {
        $: Xjs;
        _: any;
        moment: any;
    }
}
interface XpresserOptions {
    isConsole?: boolean;
    isTinker?: boolean;
}
