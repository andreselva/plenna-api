import { Injectable } from "@nestjs/common";
import Revenue from "../Entity/Revenue";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import RevenuesRepository from "../RevenuesRepository";
import { RevenueResponseDTO } from "../DTOs/RevenueResponseDTO";
import InstallmentsCalculator from "src/Finance/InstallmentsServices/InstallmentsCalculator";

@Injectable()
export default class CreateRevenue {
    constructor(
        private readonly revenueRepository: RevenuesRepository
    ) { }

    async execute(dto: RevenueDTO) {
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

            //Mapeia para retornar pro front
            return revenuesCreated.map(revenue => new RevenueResponseDTO(
                revenue.getId(),
                revenue.getName(),
                revenue.getDescription(),
                revenue.getValue(),
                revenue.getInvoiceDueDate(),
                revenue.getIdCategory(),
                revenue.getInstallments(),
                revenue.getTypeOfInstallments(),
                revenue.getSourceAccountId(),
                revenue.getHasInstallments()
            ));
        }

        //Se não houver parcelas, retorna diretamente a conta criada
        return new RevenueResponseDTO(
            revenueCreated.getId(),
            revenueCreated.getName(),
            revenueCreated.getDescription(),
            revenueCreated.getValue(),
            revenueCreated.getInvoiceDueDate(),
            revenueCreated.getIdCategory(),
            revenueCreated.getInstallments(),
            revenueCreated.getTypeOfInstallments(),
            revenueCreated.getSourceAccountId(),
            revenueCreated.getHasInstallments()
        )
    }

}
