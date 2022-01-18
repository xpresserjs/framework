import {getInstance} from "../index";

const $ = getInstance();

class CustomRequestEngine extends $.extendedRequestEngine() {
    name(){
        return this.send("This is not mine.")
    }
}

export = CustomRequestEngine;