import { Injectable } from "@nestjs/common";
import Revenue from "../Entity/Revenue";
import { RevenueDTO } from "../DTOs/RevenueDTO";
import RevenuesRepository from "../RevenuesRepository";
import InstallmentsCalculator from "src/Finance/InstallmentsCalculator";
import { RevenueResponseDTO } from "../DTOs/RevenueResponseDTO";

@Injectable()
export default class CreateRevenue {
    constructor(
        private readonly revenueRepository: RevenuesRepository
    ) { }

    async execute(revenue: RevenueDTO) {
        const entity = Revenue.fromDTO(revenue);
        const revenueCreated = await this.revenueRepository.createRevenue(entity);

        //Só entra nesse if se houver uma quantidade de parcelas informadas e se o tipo da parcela for P (parcelada) ou F (fixa).
        if (
            revenueCreated
            && revenueCreated.getInstallments() > 0
            && (revenueCreated.getTypeOfInstallments() === 'P' || revenueCreated.getTypeOfInstallments() === 'F')
        ) {
            const otherInstallments = (
                new InstallmentsCalculator(
                    revenueCreated.getTypeOfInstallments() as 'P' | 'F',
                    revenueCreated.getInstallments(),
                    revenueCreated)
            ).getInstallments();

            const revenuesCreated = [] as Revenue[];
            //Adicionar a primeira conta gerada para retornar pro front mapeado posteriormente.
            revenuesCreated.push(revenueCreated);

            for (let i = 0; i < otherInstallments.length; i++) {
                //Cria as parcelas no banco de dados e as salva em um novo array para retornar pro front.
                revenuesCreated.push(await this.revenueRepository.createRevenue(otherInstallments[i]));
            }

            const revenues = [] as RevenueResponseDTO[];
            revenuesCreated.forEach(installment => {
                revenues.push(new RevenueResponseDTO(
                    installment.getId(),
                    installment.getName(),
                    installment.getDescription(),
                    installment.getValue(),
                    installment.getInvoiceDueDate(),
                    installment.getIdCategory(),
                ))
            });

            return revenues;
        }

        //Se não houver parcelas, retorna diretamente a conta gerada
        return new RevenueResponseDTO(
            revenueCreated.getId(),
            revenueCreated.getName(),
            revenueCreated.getDescription(),
            revenueCreated.getValue(),
            revenueCreated.getInvoiceDueDate(),
            revenueCreated.getIdCategory()
        )
    }

}
