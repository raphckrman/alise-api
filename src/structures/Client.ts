import { Account } from "./Account";
import { AuthCredentials } from "../types/client";
import { getAccountInformations, getConnectionsHistory, getConsumptionsHistory, getFinancialHistory } from "../routes/account";
import { ConnectionHistoryEvent, ConsumptionHistoryEvent, FinancialHistoryEvent } from "../types/account";

export class Client {
    constructor(
        private credentials: AuthCredentials
    ) {}

    async getComsumptionsHistory(): Promise<Array<ConsumptionHistoryEvent>> {
        return getConsumptionsHistory(this.credentials.token);
    }
    async getConnectionsHistory(): Promise<Array<ConnectionHistoryEvent>> {
        return getConnectionsHistory(this.credentials.token);
    }
    async getFinancialHistory(): Promise<Array<FinancialHistoryEvent>> {
        return getFinancialHistory(this.credentials.token);
    }
    async getInformations(): Promise<Account> {
        return getAccountInformations(this.credentials.token);
    }


}
