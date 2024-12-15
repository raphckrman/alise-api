import { updateBook } from "../routes/account";

export class BookingDay {
    private token: string;
    identifier: string | null;
    booked: boolean;
    canBook: boolean;
    date?: Date;

    constructor(
        token: string,
        identifier: string | null,
        booked: boolean,
        canBook: boolean,
        date?: Date
    ) {
        if (!token) throw new Error("Token is required.");
        if (!(date instanceof Date)) throw new Error("Invalid date provided.");

        this.token = token;
        this.identifier = identifier ?? null;
        this.booked = booked;
        this.canBook = canBook;
        this.date = date;
    }

    /**
     * Books or unbooks the current day.
     * @param quantity - The number of bookings to update (default is 1).
     * @returns {Promise<BookingDay>} - A new instance of BookingDay with updated booking state.
     */
    async book(quantity = 1): Promise<BookingDay> {
        // Validate the booking conditions
        if (!this.identifier) {
            throw new Error("Cannot book this day: missing identifier.");
        }

        if (!this.canBook) {
            throw new Error("Booking is not allowed for this day.");
        }

        if (quantity <= 0) {
            throw new Error("Quantity must be greater than zero.");
        }

        await updateBook(this.token, this.identifier, quantity, this.booked);
        this.booked = !this.booked;
        return this;
    }
}
