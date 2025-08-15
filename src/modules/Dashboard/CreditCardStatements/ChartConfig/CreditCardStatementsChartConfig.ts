export default class CreditCardStatementsChartConfig {
    static readonly backgroundColor = [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 205, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
    ];

    static readonly borderColor = [
        'rgb(255, 99, 132)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
    ];

    static readonly borderWidth = 1;
    static readonly borderRadius = 5;

    static getBackgroundColor() {
        return this.backgroundColor;
    }

    static getBorderColor() {
        return this.borderColor;
    }

    static getBorderWidth() {
        return this.borderWidth;
    }

    static getBorderRadius() {
        return this.borderRadius;
    }
}