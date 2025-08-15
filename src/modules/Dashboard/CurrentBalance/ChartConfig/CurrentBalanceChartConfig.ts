export class CurrentBalanceChartConfig {
    static readonly labels = ['Receitas', 'Despesas'];
    static readonly backgroundColors = ["rgba(76, 175, 80, 0.8)", "rgba(244, 67, 54, 0.8)"];
    static readonly hoverBackgroundColors = ["rgba(76, 175, 80, 1)", "rgba(244, 67, 54, 1)"];
    static readonly borderWidth = 0;
    static readonly hoverOffset = 4;
  
    static getLabels(): string[] {
      return this.labels;
    }
  
    static getBackgroundColors(): string[] {
      return this.backgroundColors;
    }
  
    static getHoverBackgroundColors(): string[] {
      return this.hoverBackgroundColors;
    }
  
    static getBorderWidth(): number {
      return this.borderWidth;
    }
  
    static getHoverOffset(): number {
      return this.hoverOffset;
    }
  }
  