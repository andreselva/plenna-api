import { Controller, Get } from "@nestjs/common";
import { Public } from "src/common/decorators/public.decorator";

@Controller('healthcheck')
export class HealthCheckController {
    @Public()
    @Get()
    check() {
        return { isSuccess: true, message: 'OK' };
    }
}