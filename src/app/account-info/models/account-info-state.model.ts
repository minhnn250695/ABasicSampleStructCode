export class AccountInfoState {
    profilePhotoUrl: string;
    firstName: string;
    lastName: string;
    loginEmail: string;

    getFullName() {
        return (this.firstName || this.lastName) &&
            `${this.firstName ? this.firstName : ""} ${this.lastName ? this.lastName : ""}` || "N/A";
    }

}
