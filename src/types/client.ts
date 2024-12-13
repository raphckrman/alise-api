export interface AuthCredentials {
    /** PHPSESSID */
    token: string;
    /** Username used for authentication */
    username: string | null;
    /** Password used for authentication */
    password: string | null;
}