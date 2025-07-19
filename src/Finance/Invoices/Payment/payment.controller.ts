import { Body, Controller, Post } from "@nestjs/common";
import PaymentService from "./payment.service";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";

@Controller('payment')
export default class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) { }

    @Post()
    async registerPayment(@Body() paymentData: PaymentInicialDataDTO) {
        if (paymentData && Object.keys(paymentData).length > 0) {
            return this.paymentService.registerPayment(paymentData);
        }   
    }
}