declare namespace NodeJS {
    interface Global {
        $: any;
        _: any;
        moment: any;
    }
}

declare interface XpresserOptions {
    autoBoot?: boolean;
    isConsole?: boolean;
    isTinker?: boolean;
    puta?: import("object-collection");
}
