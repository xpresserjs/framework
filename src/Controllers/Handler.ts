declare const _: any;

const $defaultHandler = {
    tasks: {},
};

class Handler {
    public handler: {
        __extend__?: {
            tasks?: object,
        },
    };

    constructor($handler) {
        if ($handler) {
            this.handler = $handler;
            this.handler.__extend__ = $defaultHandler;
        } else {
            throw Error("Handler not defined!");
        }
    }

    public cloneHandler(): object {
        return _.clone(this.handler);
    }

    public tasks($tasks: object): this {
        this.handler.__extend__.tasks = Object.assign(this.handler.__extend__.tasks || {}, $tasks);
        return this;
    }

}

export = Handler;
