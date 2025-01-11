import { Account } from "./Account";
import { BookingDay } from "./BookingDay";
import { AuthCredentials } from "../types/client";
import {
    getAccountInformations,
    getBarcode,
    getBookings,
    getConnectionsHistory,
    getFinancialHistory,
    updateBook
} from "../routes/account";
import { ConnectionHistoryEvent, FinancialHistoryEvent } from "../types/account";

export class Client {
    constructor(
        private credentials: AuthCredentials,
        public account?: Account
    ) {}

    async bookDay(identifier: string, quantity = 1, cancel = false): Promise<BookingDay> {
        await updateBook(this.credentials.token, identifier, quantity, cancel);
        return new BookingDay(this.credentials.token, identifier, !cancel, true);
    }
    async getBarcode(): Promise<boolean> {
        return getBarcode(this.credentials.token);
    }
    async getBookings(): Promise<Array<BookingDay>> {
        return getBookings(this.credentials.token);
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
