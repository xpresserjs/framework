import {init} from "../index"

function main(port: number) {

    const $ = init({
        name: "Test Xpresser",
        env: 'development',

        paths: {
            base: __dirname,
            backend: "base://backend/",
        },
        server: {port, router: {pathCase: 'kebab'}}
    })

    $.initializeTypescript(__filename);

    $.on.boot(next => {
        // $.router.config.pathCase = 'kebab';

        $.router.get('/', "AppController@start")
        $.router.path('/test', () => {
            $.router.get("@url_case");
        }).controller("App");

        return next();
    });


    $.boot();
}

main(3000)
