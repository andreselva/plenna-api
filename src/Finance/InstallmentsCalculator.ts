import { Expense } from "./Expenses/Entity/Expense";
import Revenue from "./Revenues/Entity/Revenue";

export default class InstallmentsCalculator<T extends Revenue | Expense> {
    private readonly type: 'P' | 'F';
    private quantityInstallments: number;
    private readonly entity: T;
    
    public readonly otherInstallments: T[] = [];

    constructor(type: 'P' | 'F', quantityInstallments:number, entity: T) {
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
            //Contas fixas possuirão, por padrão, 12 parcelas
            this.setQuantityInstallments(12);
        }

        if (this.quantityInstallments > 0) {
            const initialDate = new Date(this.entity.getInvoiceDueDate());

            //Começar do 1, pois a primeira parcela já foi criada
            for (let i = 1; i < this.quantityInstallments; i++) {
                const newDate = new Date(initialDate);
                newDate.setMonth(newDate.getMonth() + i);

                let installment: T;

                if (this.entity instanceof Revenue) {
                    installment = new Revenue(
                        this.entity.getName(),
                        this.entity.getDescription(),
                        this.entity.getValue(),
                        newDate.toISOString().split('T')[0],
                        this.entity.getIdCategory(),
                        0,//Id é zero ao gerar a parcela
                        0,//A parcela não pode ter parcelas
                        this.entity.getTypeOfInstallments(),
                        this.entity.getId()//Salvamos o id da conta de origem
                    ) as T;
                } else {
                    installment = new Expense(
                        this.entity.getName(),
                        this.entity.getDescription(),
                        this.entity.getValue(),
                        newDate.toISOString().split('T')[0],
                        this.entity.getIdCategory(),
                        this.entity.getIdCreditCard()
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
