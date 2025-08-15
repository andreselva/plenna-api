export class DashboardExpenseByCategoryDatasetDTO {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
    borderRadius: number;

    constructor(
        label: string,
        data: number[],
        backgroundColor: string[],
        borderColor: string[],
        borderWidth: number,
        borderRadius: number
    ) {
        this.label = label;
        this.data = data;
        this.backgroundColor = backgroundColor;
        this.borderColor = borderColor;
        this.borderWidth = borderWidth;
        this.borderRadius = borderRadius;
    }
}