import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Logger, Param, Post } from "@nestjs/common";
import PaymentService from "./payment.service";
import PaymentInicialDataDTO from "./DTOs/PaymentInicialDataDTO";
import { PaymentType } from "./Types/payment.type";
import ReversePaymentDataDTO from "./DTOs/ReversePaymentDataDTO";

@Controller('payment')
export default class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(
        private readonly paymentService: PaymentService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async registerPayment(@Body() paymentData: PaymentInicialDataDTO) {
        if (paymentData && Object.keys(paymentData).length > 0) {
            return this.paymentService.registerPayment(paymentData);
        }
    }

    @Get('/:entityType/:entityId')
    @HttpCode(HttpStatus.OK)
    async getPaymentsData(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
        if (entityType && entityId) {
            if (!Object.values(PaymentType).includes(entityType as PaymentType)) {
                return this.logger.error("Invalid payment type");
            }
            return await this.paymentService.getPaymentsData(entityType as PaymentType, entityId);
        }
    }

    @Delete('/reverse')
    @HttpCode(HttpStatus.OK)
    async deletePayment(@Body() dto: ReversePaymentDataDTO) {
        return await this.paymentService.deletePayment(dto);
    }
}