import {Http} from "../types/http";

export = {
    name: "AppController",

    start(http: any) {
        // JobHelper.dispatch("play")
        throw new Error("I would like to see an error!")
    },

    url_case(http: Http){
        return http.route;
    }
}