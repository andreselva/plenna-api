import { Injectable } from "@nestjs/common";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import RevenuesRepository from "../RevenuesRepository";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import GetRevenues from "./GetRevenues";
import Revenue from "src/EntityModels/Revenue";
import InstallmentsCalculator from "../../InstallmentsServices/InstallmentsCalculator";

@Injectable()
export default class CreateRevenue {
    constructor(
        private readonly revenueRepository: RevenuesRepository,
        private readonly getRevenuesUseCase: GetRevenues,
    ) { }

    async execute(dto: RevenueDTO, periodo: PeriodoDTO) {
        const entity = Revenue.fromDTO(dto);
        const revenueCreated = await this.revenueRepository.saveRevenue(entity);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se o tipo da parcela for P (parcelada) ou F (fixa).
        if (revenueCreated
            && (
                (revenueCreated.typeOfInstallments === 'P' && revenueCreated.installments > 0)
                || revenueCreated.typeOfInstallments === 'F'
            )
        ) {
            const otherInstallments = (new InstallmentsCalculator(
                    revenueCreated.typeOfInstallments as 'P' | 'F',
                    revenueCreated.installments,
                    revenueCreated)
            ).getInstallments();

            const revenuesCreated = [] as Revenue[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            revenuesCreated.push(revenueCreated);
            for (let i = 0; i < otherInstallments.length; i++) {
                otherInstallments[i].sourceAccountId = revenueCreated.id;
                //Cria as parcelas no banco de dados e as salva em um novo array para retornar pro front.
                revenuesCreated.push(await this.revenueRepository.saveRevenue(otherInstallments[i]));
            }

        }
        
        return await this.getRevenuesUseCase.execute(periodo);
    }

}
