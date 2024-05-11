import { Module } from '@nestjs/common';
import { AppController } from './demo.controller';
import { AppService } from './demo.service';

@Module({
    controllers: [AppController],
    providers: [AppService],
    exports: [AppService],
})
export class DemoModule {}
