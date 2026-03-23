import CreditCardsController from "./credit-cards.controller";
import CreditCardsRepository from "./credit-cards.repository";
import CreditCardsService from "./credit-cards.service";
import { Module } from "@nestjs/common";

@Module({
    providers: [CreditCardsService, CreditCardsRepository],
    controllers: [CreditCardsController],
    exports: []

})
export class CreditCardsModule { }
