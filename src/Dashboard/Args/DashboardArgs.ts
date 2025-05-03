export default class DashboardArgs {
    startDate: string;
    endDate: string;

    constructor(start: string, end: string) {
        this.startDate = start;
        this.endDate = end;
    }
}