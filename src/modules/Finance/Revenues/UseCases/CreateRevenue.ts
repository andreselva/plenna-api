import { Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import RevenuesRepository from "../RevenuesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import GetRevenues from "./GetRevenues";
import Revenue from "src/EntityModels/Revenue";
import InstallmentsCalculator from "../../InstallmentsServices/InstallmentsCalculator";
import { FinancialEventsService } from "../../core/financial-events/financial-events.service";
import { FinancialEventsEnum } from "src/enum/financial-events.enum";
import { PaymentType } from "../../Payment/Types/payment.type";

@Injectable()
export default class CreateRevenue {
    constructor(
        private readonly revenueRepository: RevenuesRepository,
        private readonly getRevenuesUseCase: GetRevenues,
        private readonly financialEvents: FinancialEventsService,
    ) { }

    async execute(dto: RevenueDTO, periodo: PeriodoDTO) {
        const entity = Revenue.fromDTO(dto);
        const revenueCreated = await this.revenueRepository.saveRevenue(entity);
        await this.registerRevenueRecognized(revenueCreated);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se o tipo da parcela for P (parcelada) ou F (fixa).
        if (revenueCreated
            && (
                (revenueCreated.typeOfInstallments === 'P' && revenueCreated.installments > 0)
                || revenueCreated.typeOfInstallments === 'F'
            )
        ) {
            const otherInstallments = (new InstallmentsCalculator(
                    revenueCreated.typeOfInstallments,
                    revenueCreated.installments,
                    revenueCreated)
            ).getInstallments();

            const revenuesCreated = [] as Revenue[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            revenuesCreated.push(revenueCreated);
            for (let i = 0; i < otherInstallments.length; i++) {
                otherInstallments[i].sourceAccountId = revenueCreated.id;
                const installment = await this.revenueRepository.saveRevenue(otherInstallments[i]);
                await this.registerRevenueRecognized(installment);
                revenuesCreated.push(installment);
            }

        }
        
        return await this.getRevenuesUseCase.execute(periodo);
    }

    private async registerRevenueRecognized(revenue: Revenue): Promise<void> {
        if (!revenue?.id || !revenue.idBankAccount || revenue.idBankAccount <= 0) {
            return;
        }
        await this.financialEvents.register({
            accountId: revenue.idBankAccount,
            type: FinancialEventsEnum.REVENUE_RECOGNIZED,
            amount: revenue.value,
            referenceType: PaymentType.REVENUE,
            referenceId: revenue.id,
        });
    }
}
