
import { EventCode } from './EventCode';

export class EventMessage {

    constructor(code: EventCode, msg: string) {
        this.code = code;
        this.message = msg;
    }

    code: EventCode;
    message: string
};




