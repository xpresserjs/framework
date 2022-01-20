import {Http} from "../types/http";

export = {
    name: "AppController",

    start(http: any) {
        // JobHelper.dispatch("play")
        return ("I would like to see an error!")
    },

    url_case(http: Http){
        return http.route;
    }
}