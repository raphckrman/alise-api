/** REST/Endpoints */
export const BASE_URL = () => "https://webparent.paiementdp.com";

export const AUTH_LOGIN = (site: string) => "aliAuthentification.php?site=" + site;
export const ACCOUNT_INFORMATIONS = () => "aliInformations.php";
export const ACCOUNT_CONNECTIONS_HISTORY = () => "aliConsultLog.php";
export const ACCOUNT_CONSUMPTIONS_HISTORY = () => "aliCalendrier.php"
export const ACCOUNT_FINANCIAL_HISTORY = () => "aliOperationsFin.php"
export const ACCOUNT_BOOKINGS = () => "aliReservation.php"
export const BOOKING_GET_DETAILS = (identifier: string) => "aliReservationDetail.php?date=" + identifier
export const BOOK_MEAL = () => "aliReservationDetail.php"
export const UNBOOKING_GET_DETAILS = (identifier: string) => "aliReservationCancel.php?date=" + identifier
export const UNBOOK_MEAL = () => "aliReservationCancel.php"