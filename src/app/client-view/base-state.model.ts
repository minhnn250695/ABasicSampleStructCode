import { HouseHoldResponse } from './models';

export class BaseClientState {
    houseHolds: HouseHoldResponse;

    getIds() {
        let members = this.getMembers();
        return members && members.map(item => item.id);
    }

    getMembers() {
        return this.houseHolds && this.houseHolds.members;
    }
}