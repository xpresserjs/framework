import {Http} from "../types/http";

export = {
    name: "AppController",

    start(http: any) {
        // JobHelper.dispatch("play")
        return http.name();
    },

    url_case(http: Http){
        return http.route;
    }
}