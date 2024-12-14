/** REST/Endpoints */
export const BASE_URL = () => "https://webparent.paiementdp.com";

export const AUTH_LOGIN = (site: string) => "aliAuthentification.php?site=" + site;
export const ACCOUNT_INFORMATIONS = () => "aliInformations.php";
export const ACCOUNT_CONNECTIONS_HISTORY = () => "aliConsultLog.php";
export const ACCOUNT_CONSUMPTIONS_HISTORY = () => "aliCalendrier.php"
export const ACCOUNT_FINANCIAL_HISTORY = () => "aliOperationsFin.php"