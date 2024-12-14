import { Account } from "./Account";
import { AuthCredentials } from "../types/client";
import { getAccountInformations, getConnectionsHistory } from "../routes/account";

export class Client {
    constructor(
        private credentials: AuthCredentials
    ) {}

    async getConnectionsHistory(): Promise<boolean> {
        return getConnectionsHistory(this.credentials.token);
    }
    async getInformations(): Promise<Account> {
        return getAccountInformations(this.credentials.token);
    }


}
