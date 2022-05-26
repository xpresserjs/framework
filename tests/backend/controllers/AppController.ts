import {Controller, Http} from "../../../types/http";

export = <Controller.Object>{
    name: "AppController",

    middlewares: {
      "test": "*"
    },

    start(http: any) {
        // JobHelper.dispatch("play")
        return ("I would like to see an error!")
    },

    url_case(http: Http){
        return http.route;
    }
}