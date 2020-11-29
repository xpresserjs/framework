declare namespace NodeJS {
    interface Global {
        $: any;
        xpresserInstance(instanceId?: string): any;
        InXpresserError: typeof Error;
    }
}

/**
 * Make Declaration public
 */
declare namespace xpresser {
    type useNamespace_Xpresser_Instead = boolean
}
declare namespace Xpresser {
}
