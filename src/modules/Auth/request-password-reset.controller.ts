import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import RequestResetPasswordDTO from "./DTOs/request-reset-password.dto";
import { AuthRateLimitGuard } from "src/common/guards/auth-rate-limit.guard";
import ResetPasswordService from "./reset-password.service";
import { Public } from "src/common/decorators/public.decorator";

@Controller('reset-password')
export default class RequestPasswordResetController {
    constructor(
        private readonly service: ResetPasswordService
    ) {}
    
    @Public()
    @Post('/request')
    @UseGuards(AuthRateLimitGuard)
    async requestReset(@Body() dto: RequestResetPasswordDTO) {
        return await this.service.process(dto)
    }

}