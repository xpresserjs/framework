class Deprecated extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "Deprecated"
    }
}

export = Deprecated;