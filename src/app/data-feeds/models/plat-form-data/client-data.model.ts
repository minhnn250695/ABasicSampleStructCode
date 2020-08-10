export class ClientData {
    clientID: string;
    lastName: string;
    firstName: string;
    genderType: GenderType;
    title: string;
    dateOfBirth: string;
    adviserID: string;
    organisationName: string;
}
enum GenderType {
    Female,
    Male,
    Unknown
}