const Config = {
    // App Name
    name: "Xpresser",

    // App ENV, should be equivalent to NODE_ENV
    env: "development",

    // Enable Debugging
    debug: {
        // If set to false all debugging && debug logs are disabled
        // While if set to true all debug settings are set to their configuration values.
        enabled: true,

        controllerAction: true,

        // Enable showing controller action on every request.
        requests: {
            // Enable Request Debugging
            enabled: true,

            // Enable color in logs
            colored: true,

            // Show all request log data
            showAll: true,

            // Items to show in the request debug log
            show: {
                time: false,
                statusCode: true,
                statusMessage: false
            },

            // Ignore specific urls
            ignore: []
        },

        // Deprecated warnings
        deprecationWarnings: {
            enabled: true,
            showStack: false
        },
    },

    // Log Configurations
    log: {
        // Log enabled Plugins on boot
        plugins: true,
        serverDomainAndPort: false,
    },

    /**
     * Project configurations
     * Its safe to store project related settings here.
     */
    project: {
        fileExtension: ".js",
    },

    // Server Configuration
    server: {

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
         * In most development environment this is required to be true.
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
         * ['bodyParser', 'flash' 'helmet']
         */
        use: {
            // Use BodyParser,
            bodyParser: true,
            // Enable Flash
            flash: false,
        },

        requestEngine: {
            dataKey: 'data',
            proceedKey: 'proceed',
            messageKey: '_say'
        },

        /**
         * Xpresser Router Config
         */
        router: {
            pathCase: "snake" // snake or kebab
        },
    },

    // Date Configurations
    date: {
        timezone: null,
        format: "YYYY-MM-DD H:mm:ss",
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

    // Template Configurations
    template: {
        use: false,
        engine: "ejs",
        extension: "ejs",

        locals: {
            all: true,
            query: false,
            body: false,
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
    plugins: {},
};

const Options = {
    requireOnly: false,
    autoBoot: false,
    isConsole: false,
    isTinker: false,
    exposeDollarSign: true,
    instanceId: undefined,
    isFromXjsCli: false,
};

export = {Config, Options};
