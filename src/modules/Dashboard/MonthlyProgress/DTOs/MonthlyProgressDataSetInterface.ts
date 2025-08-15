export default interface MonthlyProgressDatasetInterface {
    label?: string;
    data: number[];
    fill: boolean;
    backgroundColor: string;
    borderColor: string;
    tension: number;
    pointRadius: number;
    pointHoverRadius: number;
}