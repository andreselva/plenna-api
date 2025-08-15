import { Injectable } from "@nestjs/common";
import { MonthlyProgressRepository } from "./MonthlyProgressRepository";
import DashboardMonthlyProgressDataset from "./DTOs/DashboardMonthlyProgressDataset";
import MonthlyProgressRowDTO from "./DTOs/MonthlyProgressRowDTO";
import DashboardMonthlyProgressDTO from "./DTOs/DashboardMonthlyProgressDTO";
import DashboardArgs from "../Args/DashboardArgs";

@Injectable()
export class MonthlyProgressServices {
    constructor(
        private readonly repository: MonthlyProgressRepository
    ) { }

    async getMonthlyProgressData(args: DashboardArgs) {
        const { startDate, endDate, labels, labelsForMap } = this.getDatesInfo(args);
        const expenses = await this.repository.getExpensesData(startDate, endDate);
        const revenues = await this.repository.getRevenuesData(startDate, endDate);

        // Formatação dos dados com os labels
        const formattedExpenses = this.formatDataWithLabels(expenses, labelsForMap);
        const formattedRevenues = this.formatDataWithLabels(revenues, labelsForMap);

        // Criando o dataset com os dados formatados
        const datasets = new DashboardMonthlyProgressDataset(formattedExpenses, formattedRevenues);

        // Retornando os dados corretamente
        return new DashboardMonthlyProgressDTO(
            labels,
            datasets.datasets // Acessando diretamente os datasets que contém os dados prontos
        );
    }

    /**
     * A função verifica se todos os meses estão presentes com valores. Se algum mês não existir, 
     * ele será mapeado para a posição correta no array, preenchendo seu valor com 0 para que os 
     * dados do gráfico fiquem corretos.
     * @param data 
     * @param labels 
     * @returns 
     */
    private formatDataWithLabels(data: MonthlyProgressRowDTO[], labels: string[]): number[] {
        const result: number[] = new Array(labels.length).fill(0); // Inicializa com 0 em todos os meses

        // Mapeia os dados recebidos em um mapa para fácil acesso por mês
        const dataMap = new Map<string, number>();
        data.forEach(item => {
            dataMap.set(item.month, item.value);
        });

        // Itera sobre os labels e preenche o array resultante
        labels.forEach((label, index) => {
            if (dataMap.has(label)) {
                result[index] = dataMap.get(label)!; // Adiciona o valor no índice correto
            }
        });
        return result;
    }

    private getDatesInfo(args: DashboardArgs): { startDate: string; endDate: string; labels: string[]; labelsForMap: string[] } {
        const mesesAbreviados = [
            "Jan", "Fev", "Mar", "Abr", "Maio", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez"
        ];

        const labels: string[] = [];
        const labelsForMap: string[] = [];
        const today = new Date(args.endDate);

        // Começa pelo próximo mês
        let month = today.getMonth() + 1;
        let year = today.getFullYear();

        if (month > 11) {
            month = 0;
            year += 1;
        }

        const datas: Date[] = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date(year, month - i, 1); // 1º dia do mês correspondente
            datas.push(date);
            const labelForMap = mesesAbreviados[date.getMonth()];
            const label = `${mesesAbreviados[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
            labels.push(label);
            labelsForMap.push(labelForMap); // Corrigido
        }

        // yyyy-mm-dd
        const formatDate = (date: Date): string => {
            return date.toISOString().slice(0, 10);
        };

        const startDate = formatDate(datas[0]); // primeiro dia do mês mais antigo
        const lastDate = new Date(datas[11].getFullYear(), datas[11].getMonth() + 1, 0); // último dia do último mês
        const endDate = formatDate(lastDate);

        return {
            startDate,
            endDate,
            labels,
            labelsForMap
        };
    }
}