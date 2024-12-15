export class BookingDay {
    constructor(
        public identifier: string | null,
        public booked: boolean,
        public canBook: boolean,
        public date: Date
    ) {}
}
