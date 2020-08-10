import { UserAccount } from './user-account.model';
import { SecurityToken } from './security-token.model';

export class LoginResponse {

    user: UserAccount;
    token: SecurityToken;
}