

export class ClientInfo {

    constructor(id: string, name: string, gender: string, age: number) {
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.age = age;
        this.isSelected = false;
    }
    id: string;
    name: string;
    gender: string;
    age: number;
    isSelected: boolean;
    email: string;
    firstName: string;
    lastName: string;
    portalActivateStatus: number;
}