const DefaultTimestamp = "YYYY-MM-DD H:mm:ss";

const ServerConfig = {
    startOnBoot: true,
    port: 2000,
    protocol: "http",
    domain: "localhost",
    root: "/",
    includePortInUrl: true,
    baseUrl: "",
    use: {
        helmet: false,
    },
    ssl: {
        enabled: false,
        port: 443,
    },
};

const Config = {
    name: "Xpresser",
    env: "development",
    debug: {
        enabled: true,
        controllerAction: true,
        routerLiveView: false,
    },
    project: {
        fileExtension: ".js",
    },
    server: ServerConfig,
    database: {
        startOnBoot: true,
        timestampFormat: DefaultTimestamp,
        config: {
            client: "sqlite",
            connection: {
                filename: "database.sqlite",
            },
            migrations: {
                tableName: "migrations",
            },
            useNullAsDefault: true,
        },
    },
    date: {
        format: DefaultTimestamp,
    },
    paths: {
        base: __dirname,
        // Should be relative to the base set above.
        // e.g base+'/'+backend should resolve to /full/path/base/backend
        backend: "base://backend",

        // Must be relative to base
        frontend: "frontend",
        public: "public",
        storage: "storage",
        xjs: "xjs",
        // Npm Dir
        npm: "base://node_modules",

        // Other Paths
        routesFile: "backend://routes.js",
        controllers: "backend://controllers",
        models: "backend://models",
        middlewares: "backend://middlewares",
        views: "backend://views",
        jsonConfigs: "base://",
    },
    session: {
        startOnBoot: false,
        secret: "!XpresserSecretKey!",
        cookie: {
            path: ServerConfig.root,
            domain: ServerConfig.domain,
            maxAge: 5000 * 60 * 24,
        },
        resave: true,
        saveUninitialized: true,
    },
    template: {
        use: false,
        engine: "ejs",
        extension: "ejs",

        locals: {
            all: true,
            __get: false,
            __post: false,
            __session: false,
            __stackedScripts: false,
        },
    },
    response: {
        cacheFiles: false,
        cacheFileExtensions: ["js", "css"],
        cacheIfMatch: [],
        cacheMaxAge: 31536000,
        overrideServerName: true,
        serverName: "Xpresser",
    },
    backgroundMonitor: {
        start: "forever start {file}",
        stop: "forever stop {file}",
    },
    artisan: {
        singleModelName: true,
        pluralizeModelTable: true,
    },
    mail: {
        default: "nodemailer",
        configs: {},
    },
};

const Options = {
    isConsole: false,
    isTinker: false,
};

export = {Config, Options};
