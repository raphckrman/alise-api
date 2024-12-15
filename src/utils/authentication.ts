import { RestManager } from "../rest/RESTManager";
import { Client } from "../structures/Client";
import { AUTH_LOGIN, BASE_URL } from "../rest/endpoints";
import { getAccountInformations } from "../routes/account";

const manager = new RestManager(BASE_URL());

export const authenticateWithCredentials = async (username: string, password: string, site: string, remember = true, minimalist = false): Promise<Client> => {
    const { cookies } = await manager.post(AUTH_LOGIN(site), {
        txtLogin:       username,
        txtMdp:         password,
        chkKeepSession: remember ? "1" : "0"
    });

    const regex = /PHPSESSID=([\dA-Za-z]+)/g;
    const matches: Array<string> = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(cookies.toString())) !== null) {
        matches.push(match[1]);
    }

    const cookie = matches[matches.length - 1];


    return new Client({
        token:    cookie,
        username: remember ? username : null,
        password: remember ? password : null
    }, !minimalist ? await getAccountInformations(cookie) : undefined);
};
