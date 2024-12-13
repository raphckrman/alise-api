import {AuthCredentials} from "../types/client";
import {getAccountInformations} from "../routes/account";
import {Account} from "./Account";

export class Client {
    constructor(
        private credentials: AuthCredentials
    ) {};

    async getInformations(): Promise<Account> {
        return getAccountInformations(this.credentials.token);
    }
}