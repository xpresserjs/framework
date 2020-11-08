declare namespace NodeJS {
    interface Global {
        $: any;
        xpresserInstance(instanceId?: string): any;
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
