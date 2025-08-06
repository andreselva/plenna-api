import { DateTime } from "luxon";
import { Expense } from "src/EntityModels/Expense";
import Revenue from "src/EntityModels/Revenue";

export default class InstallmentsCalculator<T extends Revenue | Expense> {
    private readonly type: 'P' | 'F';
    private quantityInstallments: number;
    private readonly entity: T;

    public readonly otherInstallments: T[] = [];

    constructor(type: 'P' | 'F', quantityInstallments: number, entity: T) {
        this.type = type;
        this.quantityInstallments = quantityInstallments;
        this.entity = entity;
    }

    getInstallments() {
        this.calculate();
        return this.otherInstallments;
    }

    private calculate() {
        if (this.type === 'F') {
            // Contas fixas possuirão, por padrão, 12 parcelas
            this.setQuantityInstallments(12);
        }

        if (this.quantityInstallments > 0) {
            const initialDate = DateTime.fromISO(this.entity.invoiceDueDate);

            // Começar do 1, pois a primeira parcela já foi criada
            for (let i = 1; i < this.quantityInstallments; i++) {
                const newDate = initialDate.plus({ months: i });

                let installment: T;

                if (this.entity instanceof Revenue) {
                    installment = Revenue.fromEntity(this.entity) as T;
                    installment.invoiceDueDate = newDate.toISODate();
                    installment.id = 0;
                    this.otherInstallments.push(installment);
                } else if (this.entity instanceof Expense) {
                    installment = Expense.fromEntity(this.entity) as T;
                    installment.invoiceDueDate = newDate.toISODate();
                    installment.id = 0;
                    this.otherInstallments.push(installment);
                }
            }

        }
    }
    
    private setQuantityInstallments(installments: number) {
        this.quantityInstallments = installments;
    }
}


