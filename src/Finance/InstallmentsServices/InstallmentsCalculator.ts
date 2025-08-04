import { DateTime } from "luxon";
import Revenue from "../Revenues/Entity/Revenue";
import { Expense } from "../Expenses/Entity/Expense";

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
            const initialDate = DateTime.fromISO(this.entity.getInvoiceDueDate());

            // Começar do 1, pois a primeira parcela já foi criada
            for (let i = 1; i < this.quantityInstallments; i++) {
                const newDate = initialDate.plus({ months: i });

                let installment: T;

                if (this.entity instanceof Revenue) {
                    installment = new Revenue(this.entity) as T;
                    installment.setInvoiceDueDate(newDate.toISODate());
                    installment.setId(0);
                    this.otherInstallments.push(installment);
                } else if (this.entity instanceof Expense) {
                    installment = new Expense(this.entity) as T;
                    installment.setInvoiceDueDate(newDate.toISODate() as string);
                    installment.setId(0)
                    this.otherInstallments.push(installment);
                }
            }

        }
    }
    
    private setQuantityInstallments(installments: number) {
        this.quantityInstallments = installments;
    }
}


