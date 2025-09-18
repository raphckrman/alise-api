import { RestManager } from "../rest/RESTManager";
import {
    ACCOUNT_BARCODE,
    ACCOUNT_BOOKINGS,
    ACCOUNT_CONNECTIONS_HISTORY,
    ACCOUNT_FINANCIAL_HISTORY,
    ACCOUNT_INFORMATIONS,
    BASE_URL,
    BOOK_MEAL,
    BOOKING_GET_DETAILS,
    UNBOOK_MEAL,
    UNBOOKING_GET_DETAILS,
    WEEKLY_MENU
} from "../rest/endpoints";
import { Account } from "../structures/Account";
import { BookingDay } from "../structures/BookingDay";
import { DayMenu } from "../structures/DayMenu";
import { ConnectionHistoryEvent, FinancialHistoryEvent } from "../types/account";
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
    let balance: number = 0;

    try {
      balance = parseFloat(findBetween(data, "<b>", " &#128; </b>")[0].replace(",", "."));
    } catch {
      const { data: financialData } = await manager.get<string>(ACCOUNT_FINANCIAL_HISTORY(), {
        Cookie: `PHPSESSID=${token}`
      })

      balance = parseFloat(findBetween(financialData, "<td class='titre_montant'>", " &euro;</td>")[0]);
    }
    
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

export const getFinancialHistory = async (token: string): Promise<Array<FinancialHistoryEvent>> => {
    const { data } = await manager.get<string>(ACCOUNT_FINANCIAL_HISTORY(), {
        Cookie: `PHPSESSID=${token}`
    });

    const rawEventsList = findBetween(
        data,
        "<tr class='detail'>",
        "<tr class='detail'>"
    );
    const result: Array<FinancialHistoryEvent> = rawEventsList.map(item => {
        const [day, month, year] = findBetween(item, "<td class='detail_date'>", "</td>")[0].split("/").map(Number);
        const date = new Date(2000 + year, month - 1, day);
        const label = findBetween(item, "<td class='detail_data'>", "</td>")[0];
        const debit = findBetween(item, "<td class='detail_debit_montant'>", "</td>")[0]?.replace(",", ".") ?? "0.0";
        const credit = findBetween(item, "<td class='detail_credit_montant'>", "</td>")[0]?.replace(",", ".") ?? "0.0";
        const amount = (isNaN(parseFloat(credit)) || credit.trim() === "" ? 0 : parseFloat(credit)) - -(isNaN(parseFloat(debit)) || debit.trim() === "" ? 0 : parseFloat(debit));
        return { label, date, amount };
    });

    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getBookings = async (token: string): Promise<Array<BookingDay>> => {
    const { data } = await manager.get<string>(ACCOUNT_BOOKINGS(), {
        Cookie: `PHPSESSID=${token}`
    });

    const availableBookings = findBetween(data, '<table width="100%" cellpadding=2 cellspacing=0 border=0><tr><td align=center>', '" w');

    return availableBookings.map(item => {
        if (findBetween(item + '"', '<td id="', '"').length === 0) return null;
        const [year, month, day] = findBetween(item + '"', '<td id="', '"')[0].split("-").map(Number);
        const date = new Date(Date.UTC(year, month - 1, day - 1));
        const identifier = findBetween(item, "?date=", ' "')[0];
        const booked = findBetween(item, '<a href="', ' "?date').some(url => url.includes("aliReservationCancel.php"));
        const canBook = identifier ? true : false;
        return new BookingDay(token, identifier ?? null, booked, canBook, date);
    }).filter(item => item !== null);
};

export const updateBook = async (token: string, identifier: string, quantity = 1, cancel = false): Promise<boolean> => {
    await manager.get<string>(cancel ? UNBOOKING_GET_DETAILS(identifier) : BOOKING_GET_DETAILS(identifier), {
        Cookie: `PHPSESSID=${token}`
    });
    console.log(cancel);
    await manager.post<string>(cancel ? UNBOOK_MEAL() : BOOK_MEAL(), cancel ? "ref=cancel&btnOK.x=0&btnOK.y=0&valide_form=1" : "CONS_QUANTITE=" + quantity.toString() + "&restaurant=1&btnOK.x=0&btnOK.y=0&valide_form=1", {
        headers: {
            "Cookie":       `PHPSESSID=${token}`,
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return true;
};

export const getBarcode = async (token: string): Promise<Blob> => {
    const { data } = await manager.get<Blob>(ACCOUNT_BARCODE(), {
        Cookie: `PHPSESSID=${token}`
    });


    return data;
};

export const getWeeklyMenu = async (token: string): Promise<Array<DayMenu>> => {
    const { data } = await manager.get<string>(WEEKLY_MENU(), {
        Cookie: `PHPSESSID=${token}`
    });

    const rawWeekDays = findBetween(data, '<tr class="table_header">', "</tr>")[0];
    const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    const parseDate = (dayString: string): Date => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, dayNumber, monthName, year] = dayString.replaceAll("<br>", " ").trim().split(" ");
        return new Date(Date.UTC(parseInt(year, 10), MONTHS.indexOf(monthName), parseInt(dayNumber, 10)));
    };

    const weekDays = findBetween(rawWeekDays, "<strong>", "</strong>").map(parseDate);

    const menus = findBetween(data, "<tr>", "</tr>");

    const extractMeals = (menuRow: string): Array<Array<string>> =>
        findBetween(menuRow, '<td width="10%" style="text-align: center; padding-top: 1em;">', "</td>")
            .map(dayMeal => dayMeal
                .split(/<br\s*\/?>/i)
                .map(subItem => subItem.replaceAll(/<\/?[^>]+(>|$)/g, "").trim())
                .filter(subItem => subItem.length !== 0)
            );

    const lunchItems = extractMeals(menus[3]);
    const dinnerItems = extractMeals(menus[4]);

    return weekDays.map((day, index) => new DayMenu(day, lunchItems[index] ?? [], dinnerItems[index] ?? []));
};
