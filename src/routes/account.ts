import {RestManager} from "../rest/RESTManager";
import {ACCOUNT_INFORMATIONS, BASE_URL} from "../rest/endpoints";
import { Account } from "../structures/Account";
import {findBetween} from "../utils/findBetween";

const manager = new RestManager(BASE_URL());

export const getAccountInformations = async (token: string): Promise<Account> => {
    const { data, cookies } = await manager.get<string>(ACCOUNT_INFORMATIONS(), {
        Cookie: `PHPSESSID=${token}`
    })
    const firstName = findBetween(data, "id=\"rsp_prenom\" value=\"", "\"")
    const lastName = findBetween(data, "id=\"rsp_nom\" value=\"", "\"")
    const email = findBetween(data, "id=\"rsp_email\" value=\"", "\"")
    const phoneNumber = findBetween(data, "id=\"rsp_tel2\" value=\"", "\"")
    const faxNumber = findBetween(data, "id=\"rsp_tel1\" value=\"", "\"")
    const address = findBetween(data, "id=\"rsp_adr1\" value=\"", "\"") + "" + findBetween(data, "id=\"textfield2\" value=\"", "\"") + " " + findBetween(data, "id=\"rsp_cp\" value=\"", "\"") + " " + findBetween(data, "id=\"rsp_ville\" value=\"", "\"")

    return new Account(firstName, lastName, email, phoneNumber, faxNumber, address)
}