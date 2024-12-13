import { RestManager } from "../rest/RESTManager";
import {Client} from "../structures/Client";
import {AUTH_LOGIN, BASE_URL} from "../rest/endpoints";

const manager = new RestManager(BASE_URL());

export const authenticateWithCredentials = async (username: string, password: string, site: string, remember = true): Promise<Client> => {
    const { data, cookies } = await manager.post(AUTH_LOGIN(site), {
        txtLogin: username,
        txtMdp: password,
        chkKeepSession: remember ? "1" : "0"
    })

    const regex = /PHPSESSID=([a-zA-Z0-9]+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(cookies.toString())) !== null) {
        matches.push(match[1]);
    }

    return new Client({
        token: matches[matches.length - 1],
        username: remember ? username : null,
        password: remember ? password : null,
    })
}