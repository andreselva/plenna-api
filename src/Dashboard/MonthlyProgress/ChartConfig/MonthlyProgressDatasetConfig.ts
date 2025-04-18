export default class MonthlyProgressDatasetConfig {
    static toDataSet(config: {
        data: number[],
        label?: string,
        fill?: boolean,
        backgroundColor?: string,
        borderColor?: string,
        tension?: number,
        pointRadius?: number,
        pointHoverRadius?: number
    }) {
        return {
            label: config.label,
            data: config.data,
            fill: config.fill ?? true,
            backgroundColor: config.label === 'Receitas' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            borderColor: config.label === 'Receitas' ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)',
            tension: config.tension ?? 0.4,
            pointRadius: config.pointRadius ?? 4,
            pointHoverRadius: config.pointHoverRadius ?? 6
        };
    }
}
