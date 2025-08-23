export default class CreditCardStatementsChartConfig {
    static readonly backgroundColor = [
        'rgba(153, 102, 255, 1)',   
        'rgba(255, 159, 64, 1)',    
        'rgba(54, 162, 235, 1)',   
        'rgba(255, 205, 86, 1)',    
        'rgba(75, 192, 192, 1)'
    ];

    static readonly borderColor = [
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(54, 162, 235)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)'
    ];

    static readonly borderWidth = 1;
    static readonly borderRadius = 0;

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