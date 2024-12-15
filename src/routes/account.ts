import { RestManager } from "../rest/RESTManager";
import {
    ACCOUNT_BOOKINGS,
    ACCOUNT_CONNECTIONS_HISTORY,
    ACCOUNT_CONSUMPTIONS_HISTORY,
    ACCOUNT_FINANCIAL_HISTORY,
    ACCOUNT_INFORMATIONS,
    BASE_URL,
    BOOK_MEAL,
    BOOKING_GET_DETAILS,
    UNBOOK_MEAL,
    UNBOOKING_GET_DETAILS
} from "../rest/endpoints";
import { Account } from "../structures/Account";
import { BookingDay } from "../structures/BookingDay";
import { ConnectionHistoryEvent, ConsumptionHistoryEvent, FinancialHistoryEvent } from "../types/account";
import { findBetween } from "../utils/findBetween";
import { extractData, safeParseFloat, getCookieHeaders, parseDate } from "../utils/parsing";

const manager = new RestManager(BASE_URL());

export const getAccountInformations = async (token: string): Promise<Account> => {
    const { data } = await manager.get<string>(ACCOUNT_INFORMATIONS(), getCookieHeaders(token));

    const establishment = extractData(data, "<nobr>", "<nobr>       </h1>");
    const firstName = extractData(data, "id=\"rsp_prenom\" value=\"", "\"");
    const lastName = extractData(data, "id=\"rsp_nom\" value=\"", "\"");
    const email = extractData(data, "id=\"rsp_email\" value=\"", "\"");
    const phoneNumber = extractData(data, "id=\"rsp_tel2\" value=\"", "\"");
    const faxNumber = extractData(data, "id=\"rsp_tel1\" value=\"", "\"");
    const address = `${extractData(data, "id=\"rsp_adr1\" value=\"", "\"")} ${extractData(data, "id=\"textfield2\" value=\"", "\"")} ${extractData(data, "id=\"rsp_cp\" value=\"", "\"")} ${extractData(data, "id=\"rsp_ville\" value=\"", "\"")}`;
    const balance = safeParseFloat(extractData(data, "<b>", " &#128; </b>"));

    const dateStr = extractData(data, "<time>", "</time>");
    const [day, month, year] = dateStr.split("/").map(Number);
    const estimatedAt = new Date(year, month - 1, day);

    return new Account(establishment, firstName, lastName, email, phoneNumber, faxNumber, address, balance, estimatedAt);
};

export const getConnectionsHistory = async (token: string): Promise<Array<ConnectionHistoryEvent>> => {
    try {
        const { data } = await manager.get<string>(ACCOUNT_CONNECTIONS_HISTORY(), getCookieHeaders(token));
        const rawEventsList = findBetween(data, "<tr class='ligneTableau' ><td>", "</tr>");

        return rawEventsList.map(item => {
            const date = parseDate(findBetween(item, "<time>", "</time>")[0]);
            const label = findBetween(item, "<td>", "</td>")[0];
            return { label, date };
        });
    } catch (error) {
        console.error("Error fetching connection history:", error);
        return [];
    }
};

export const getConsumptionsHistory = async (token: string): Promise<Array<ConsumptionHistoryEvent>> => {
    try {
        const { data } = await manager.get<string>(ACCOUNT_CONSUMPTIONS_HISTORY(), getCookieHeaders(token));
        const rawEventsList = findBetween(data, "<tr class='detail_conso'>", "</tr>");

        return rawEventsList.map(item => {
            const rawElements = findBetween(item, "<td>", "</td>");
            const date = parseDate(findBetween(rawElements[0], "", " <b>")[0]);
            const label = findBetween(rawElements[0], "<b>", "</b>")[0];
            const type = rawElements[1];
            const quantity = safeParseFloat(findBetween(item, "<td align='center'>", "</td>")[0]);
            const amount = -safeParseFloat(findBetween(item, "<td align='right'><b>", " &euro;</b></td>")[0]);

            return { label, type, date, quantity, amount };
        });
    } catch (error) {
        console.error("Error fetching consumption history:", error);
        return [];
    }
};

export const getFinancialHistory = async (token: string): Promise<Array<FinancialHistoryEvent>> => {
    try {
        const { data } = await manager.get<string>(ACCOUNT_FINANCIAL_HISTORY(), getCookieHeaders(token));
        const rawEventsList = findBetween(data, "<tr class='detail'>", "<tr class='detail'>");

        const result = rawEventsList.map(item => {
            const [day, month, year] = findBetween(item, "<td class='detail_date'>", "</td>")[0].split("/").map(Number);
            const date = new Date(2000 + year, month - 1, day);
            const label = findBetween(item, "<td class='detail_data'>", "</td>")[0];
            const debit = safeParseFloat(findBetween(item, "<td class='detail_debit_montant'>", "</td>")[0]);
            const credit = safeParseFloat(findBetween(item, "<td class='detail_credit_montant'>", "</td>")[0]);

            const amount = credit - debit;
            return { label, date, amount };
        });

        return result.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
        console.error("Error fetching financial history:", error);
        return [];
    }
};

export const getBookings = async (token: string): Promise<Array<BookingDay>> => {
    try {
        const { data } = await manager.get<string>(ACCOUNT_BOOKINGS(), getCookieHeaders(token));
        const availableBookings = findBetween(data, '<table width="100%" cellpadding=2 cellspacing=0 border=0><tr><td align=center>', '" w');

        return availableBookings.map(item => {
            if (findBetween(item + '"', '<td id="', '"').length === 0) return null;
            const [year, month, day] = findBetween(item + '"', '<td id="', '"')[0].split("-").map(Number);
            const date = new Date(year, month - 1, day);
            const identifier = findBetween(item, "?date=", ' "')[0];
            const booked = findBetween(item, '<a href="', ' "?date').some(url => url.includes("aliReservationCancel.php"));
            const canBook = identifier ? true : false;

            return new BookingDay(token, identifier ?? null, booked, canBook, date);
        }).filter(item => item !== null) as Array<BookingDay>;
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return [];
    }
};

export const updateBook = async (token: string, identifier: string, quantity = 1, cancel = false): Promise<boolean> => {
    try {
        await manager.get<string>(cancel ? UNBOOKING_GET_DETAILS(identifier) : BOOKING_GET_DETAILS(identifier), getCookieHeaders(token));
        console.log(cancel);
        await manager.post<string>(cancel ? UNBOOK_MEAL() : BOOK_MEAL(), cancel ? "ref=cancel&btnOK.x=0&btnOK.y=0&valide_form=1" : "CONS_QUANTITE=" + quantity.toString() + "&restaurant=1&btnOK.x=0&btnOK.y=0&valide_form=1", {
            headers: {
                "Cookie":       `PHPSESSID=${token}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        return true;
    } catch (error) {
        console.error("Error updating booking:", error);
        return false;
    }
};
