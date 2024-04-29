import { Module } from '@nestjs/common';
import { DemoModule } from './demo/demo.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [ApiModule, DemoModule],
})
export class AppModule {}
