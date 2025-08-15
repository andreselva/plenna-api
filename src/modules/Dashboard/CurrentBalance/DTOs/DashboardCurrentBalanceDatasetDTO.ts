export class DashboardCurrentBalanceDatasetDTO {
    data: number[];
    backgroundColor: string[];
    hoverBackgroundColor: string[];
    borderWidth: number;
    hoverOffset: number;

    constructor(data: number[], backgroundColor: string[], hoverBackgroundColor: string[], borderWidth: number, hoverOffset: number) {
        this.data = data;
        this.backgroundColor = backgroundColor;
        this.hoverBackgroundColor = hoverBackgroundColor;
        this.borderWidth = borderWidth;
        this.hoverOffset = hoverOffset;
    }
}