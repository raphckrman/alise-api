export class Account {
    constructor(
        public establishment: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public phoneNumber: string,
        public faxNumber: string,
        public address: string,
        public balance: number,
        public estimatedAt: Date
    ) {}
}
