
export class UpdatePermissionRequest {

    constructor(
        public UserId: string,
        public username: string,
        public customerId: string,
        public type: number,
        public enabled: boolean) {
    }
}