

export class Customer {

    name: string;
    status: string;
    license: string;
    state: string;
    postcode: number;
    id: string;
    constructor(name: string, status: string) {
        this.name = name;
        this.status = status;
    }

}