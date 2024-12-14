import { RestManager } from "../rest/RESTManager";
import { ACCOUNT_INFORMATIONS, BASE_URL } from "../rest/endpoints";
import { Account } from "../structures/Account";
import { findBetween } from "../utils/findBetween";

const manager = new RestManager(BASE_URL());

export const getAccountInformations = async (token: string): Promise<Account> => {
    const { data } = await manager.get<string>(ACCOUNT_INFORMATIONS(), {
        Cookie: `PHPSESSID=${token}`
    });
    const firstName = findBetween(data, "id=\"rsp_prenom\" value=\"", "\"")[0];
    const lastName = findBetween(data, "id=\"rsp_nom\" value=\"", "\"")[0];
    const email = findBetween(data, "id=\"rsp_email\" value=\"", "\"")[0];
    const phoneNumber = findBetween(data, "id=\"rsp_tel2\" value=\"", "\"")[0];
    const faxNumber = findBetween(data, "id=\"rsp_tel1\" value=\"", "\"")[0];
    const address = findBetween(data, "id=\"rsp_adr1\" value=\"", "\"")[0] + "" + findBetween(data, "id=\"textfield2\" value=\"", "\"")[0] + " " + findBetween(data, "id=\"rsp_cp\" value=\"", "\"")[0] + " " + findBetween(data, "id=\"rsp_ville\" value=\"", "\"")[0];

    return new Account(firstName, lastName, email, phoneNumber, faxNumber, address);
};
