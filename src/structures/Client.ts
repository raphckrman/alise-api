import { Account } from "./Account";
import { AuthCredentials } from "../types/client";
import { getAccountInformations } from "../routes/account";

export class Client {
    constructor(
        private credentials: AuthCredentials
    ) {}

    async getInformations(): Promise<Account> {
        return getAccountInformations(this.credentials.token);
    }
}
