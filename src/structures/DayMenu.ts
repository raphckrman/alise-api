export class DayMenu {
    date: Date;
    lunch: Array<string>;
    dinner: Array<string>;

    constructor(
        date: Date,
        lunch: Array<string>,
        dinner: Array<string>
    ) {
        this.date = date;
        this.lunch = lunch;
        this.dinner = dinner;
    }
}
