const DefaultTimestamp = "YYYY-MM-DD H:mm:ss";

/**
 * Server Related configurations.
 */
const ServerConfig = {

    /**
     * Middleware to handle server under maintenance mood
     *
     * if not found default is used.
     */
    maintenanceMiddleware: "MaintenanceMiddleware.js",
    /**
     * Server Port for http connections
     */
    port: 2000,

    /**
     * Url protocol (http|https)
     * Use https if ssl is enabled.
     */
    protocol: "http",

    /**
     * Server domain
     */
    domain: "localhost",

    /**
     * Root Folder
     * if calling xpresser from another folder not route
     * specify e.g  root: '/folder/'
     *
     * must end with trailing slash
     */
    root: "/",

    /**
     * In most development enviroment this is required to be true.
     * When true url helpers will append server port after server url
     *
     * @example
     * http://localhost:2000/some/path
     */
    includePortInUrl: true,

    /**
     * Specify Application BaseUrl directly
     */
    baseUrl: "",

    /**
     * SSL Configurations.
     */
    ssl: {
        // Enable ssl
        enabled: false,

        // Ssl Port
        port: 443,
    },

    /**
     * Enable or disable PoweredBy
     * For security purposes this is advised to be false.
     */
    poweredBy: true,

    /**
     * Enable if you want public folder to be served
     */
    servePublicFolder: true,

    /**
     * Xpresser comes with a few packages for security,
     * You can enable or disable them here.
     * ['bodyParser', 'session', 'helmet']
     */
    use: {
        // Use BodyParser,
        bodyParser: true,
        // Enable Session
        session: false,
        // Enable Flash
        flash: false,
    },
};

const Config = {
    // App Name
    name: "Xpresser",

    // App ENV, should be equivalent to NODE_ENV
    env: "development",

    // Enable Debugging
    debug: {
        // If set to false all debuggers are disabled
        enabled: true,

        // Enable showing controller action on every request.
        controllerAction: true,
    },

    // Log Configurations
    log: {
        // Log enabled Plugins on boot
        plugins: true
    },

    /**
     * Project configurations
     * Its safe to store project related settings here.
     */
    project: {
        fileExtension: ".js",
    },

    // Server Configuration
    server: ServerConfig,

    // Date Configurations
    date: {
        timezone: null,
        format: DefaultTimestamp,
    },

    // Paths Configurations
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
        events: "backend://events",
        controllers: "backend://controllers",
        models: "backend://models",
        middlewares: "backend://middlewares",
        views: "backend://views",
        jsonConfigs: "backend://",
        configs: "backend://configs"
    },

    // Session Configurations
    session: {
        useDefault: false,
        // Path custom handler or false
        useCustomHandler: false,
        secret: "!XpresserSecretKey!",
        cookie: {
            path: ServerConfig.root,
            domain: ServerConfig.domain,
            maxAge: 5000 * 60 * 24,
        },
        resave: true,
        saveUninitialized: true,
    },

    // Template Configurations
    template: {
        use: false,
        engine: "ejs",
        extension: "ejs",

        locals: {
            all: true,
            query: false,
            body: false,
            session: false,
            stackedScripts: false,
        },
    },

    // Response Configurations
    response: {
        cacheFiles: false,
        cacheFileExtensions: ["js", "css"],
        cacheIfMatch: [],
        cacheMaxAge: 31536000,
        overrideServerName: true,
        serverName: "Xpresser",
    },

    // Artisan/Console Configurations
    artisan: {
        loadEvents: false,
        singleModelName: true,
        pluralizeModelTable: true,

        // Replace factory files
        factory: {
            // model: null,
            // controller: null,
            // view: null
        }
    },

    // Modules Configurations
    packages: {},

    // Plugins Configurations
    plugins: {}
};

const Options = {
    requireOnly: false,
    autoBoot: false,
    isConsole: false,
    isTinker: false,
};

export = {Config, Options};
