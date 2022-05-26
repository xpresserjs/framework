import {getInstance} from "../../index";
import {HttpError} from "../../types/http";

const $ = getInstance();

class MyRequestEngine extends $.extendedRequestEngine() {
    name(){
        return this.send("This is not mine.")
    }

    onError(e: any, formatted: HttpError.Data) {
        console.log(e)
        return this.send(formatted);
    }
}

export = MyRequestEngine;