import { RestManager } from "../rest/RESTManager";
import { ACCOUNT_CONNECTIONS_HISTORY, ACCOUNT_INFORMATIONS, BASE_URL } from "../rest/endpoints";
import { Account } from "../structures/Account";
import { ConnectionHistoryEvent } from "../types/account";
import { findBetween } from "../utils/findBetween";

const manager = new RestManager(BASE_URL());

export const getAccountInformations = async (token: string): Promise<Account> => {
    const { data } = await manager.get<string>(ACCOUNT_INFORMATIONS(), {
        Cookie: `PHPSESSID=${token}`
    });

    const establishment = findBetween(data, "<nobr>", "<nobr>       </h1>")[0];
    const firstName = findBetween(data, "id=\"rsp_prenom\" value=\"", "\"")[0];
    const lastName = findBetween(data, "id=\"rsp_nom\" value=\"", "\"")[0];
    const email = findBetween(data, "id=\"rsp_email\" value=\"", "\"")[0];
    const phoneNumber = findBetween(data, "id=\"rsp_tel2\" value=\"", "\"")[0];
    const faxNumber = findBetween(data, "id=\"rsp_tel1\" value=\"", "\"")[0];
    const address = findBetween(data, "id=\"rsp_adr1\" value=\"", "\"")[0] + "" + findBetween(data, "id=\"textfield2\" value=\"", "\"")[0] + " " + findBetween(data, "id=\"rsp_cp\" value=\"", "\"")[0] + " " + findBetween(data, "id=\"rsp_ville\" value=\"", "\"")[0];
    const balance = parseFloat(findBetween(data, "<b>", " &#128; </b>")[0].replace(",", "."));

    const [day, month, year] = findBetween(data, "<time>", "</time>")[0].split("/").map(Number);
    const estimatedAt = new Date(year, month - 1, day);

    return new Account(establishment, firstName, lastName, email, phoneNumber, faxNumber, address, balance, estimatedAt);
};

export const getConnectionsHistory = async (token: string): Promise<Array<ConnectionHistoryEvent>> => {
    const { data } = await manager.get<string>(ACCOUNT_CONNECTIONS_HISTORY(), {
        Cookie: `PHPSESSID=${token}`
    });

    const rawEventsList = findBetween(data, "<tr class='ligneTableau' ><td>", "</tr>");

    const result: Array<ConnectionHistoryEvent> = rawEventsList.map(item => {
        const [day, month, year, hours, minutes] = findBetween(item, "<time>", "</time>")[0].split(/[\s/:]/).map(Number);
        const date = new Date(year, month - 1, day, hours, minutes);
        const label = findBetween(item, "<td>", "</td>")[0];
        return { label, date };
    });

    return result;
};
