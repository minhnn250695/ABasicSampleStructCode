import { UserRole } from './user-role.model';

export class UserAccount {

    id: string;
    userName: string;
    firstName: string;
    lastName: string;
    companyId: string;
    isAdmin: boolean;
    roles: string[];
    profileImage: string;
    roleAccess: UserRole[];
    status: string;
    householdName: string;
    factFind: boolean;
    crmPermission: boolean;
}