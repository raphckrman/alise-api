export interface ConnectionHistoryEvent {
    label: string;
    date: Date;
}

export interface ConsumptionHistoryEvent {
    label: string;
    type: string;
    date: Date;
    quantity: number;
    amount: number;
}
