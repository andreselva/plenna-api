import { Expense } from "./Expenses/Entity/Expense";
import Revenue from "./Revenues/Entity/Revenue";
import { DateTime } from "luxon";

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
                    installment = new Revenue(
                        this.entity.getName(),
                        this.entity.getDescription(),
                        this.entity.getValue(),
                        newDate.toISODate() as string, 
                        this.entity.getIdCategory(),
                        0, // A parcela não pode ter parcelas
                        this.entity.getTypeOfInstallments(),
                        this.entity.getId(),// Salvamos o id da conta de origem
                        this.entity.getHasInstallments(),
                        0 // Id é zero ao gerar a parcela
                    ) as T;
                } else {
                    installment = new Expense(
                        this.entity.getName(),
                        this.entity.getDescription(),
                        this.entity.getValue(),
                        newDate.toISODate() as string,
                        this.entity.getIdCategory(),
                        this.entity.getIdCreditCard(),
                        0, // A parcela não pode ter parcelas
                        this.entity.getTypeOfInstallments(),
                        this.entity.getId(), // Salvamos o id da conta de origem
                        this.entity.getHasInstallments(),
                        0 // Id é zero ao gerar a parcela
                    ) as T;
                }

                this.otherInstallments.push(installment);
            }
        }
    }

    setQuantityInstallments(installments: number) {
        this.quantityInstallments = installments;
    }
}
