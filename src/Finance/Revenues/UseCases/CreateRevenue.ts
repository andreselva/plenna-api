import { HttpStatus, Injectable } from "@nestjs/common";
import Revenue from "../Entity/Revenue";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import RevenuesRepository from "../RevenuesRepository";
import InstallmentsCalculator from "src/Finance/InstallmentsServices/InstallmentsCalculator";
import PeriodoDTO from "src/DTOs/PeriodoDTO";
import GetRevenues from "./GetRevenues";

@Injectable()
export default class CreateRevenue {
    constructor(
        private readonly revenueRepository: RevenuesRepository,
        private readonly getRevenuesUseCase: GetRevenues,
    ) { }

    async execute(dto: RevenueDTO, periodo: PeriodoDTO) {
        const entity = Revenue.fromDTO(dto);
        const revenueCreated = await this.revenueRepository.createRevenue(entity);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se o tipo da parcela for P (parcelada) ou F (fixa).
        if (
            revenueCreated
            && (
                (revenueCreated.getTypeOfInstallments() === 'P' && revenueCreated.getInstallments() > 0)
                || revenueCreated.getTypeOfInstallments() === 'F'
            )
        ) {
            const otherInstallments = (
                new InstallmentsCalculator(
                    revenueCreated.getTypeOfInstallments() as 'P' | 'F',
                    revenueCreated.getInstallments(),
                    revenueCreated
                )
            ).getInstallments();

            const revenuesCreated = [] as Revenue[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            revenuesCreated.push(revenueCreated);
            for (let i = 0; i < otherInstallments.length; i++) {
                //Cria as parcelas no banco de dados e as salva em um novo array para retornar pro front.
                revenuesCreated.push(await this.revenueRepository.createRevenue(otherInstallments[i]));
            }

            if (!revenueCreated && !(revenuesCreated.length > 0)) {
                return {
                    message: "Failed to create revenue",
                    statusCode: HttpStatus.BAD_REQUEST,
                    revenues: await this.getRevenuesUseCase.execute(periodo),
                    isSuccess: false,
                }
            }

            return {
                message: "Revenue created successfully",
                stastusCode: HttpStatus.CREATED,
                revenues: await this.getRevenuesUseCase.execute(periodo),
                isSuccess: true,
            }
        }

        if (!revenueCreated) {
            return {
                message: "Failed to create revenue",
                statusCode: HttpStatus.BAD_REQUEST,
                revenues: await this.getRevenuesUseCase.execute(periodo),
                isSuccess: false,
            }
        }

        return {
            message: "Revenue created successfully",
            statusCode: HttpStatus.CREATED,
            revenues: await this.getRevenuesUseCase.execute(periodo),
            isSuccess: true,
        }
    }

}
