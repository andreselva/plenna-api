import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "../payment.repository";
import PaymentInicialDataDTO from "../DTOs/PaymentInicialDataDTO";
import Payment from "src/EntityModels/Payment";

@Injectable()
export default class PaymentRegister {
    constructor(
        private readonly paymentRepository: PaymentRepository
    ) { }


}