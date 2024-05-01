import { Module } from '@nestjs/common';
import { DemoModule } from './demo/demo.module';
import { ApiModule } from './api/api.module';
// import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ApiModule,
    // DemoModule,
    // ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000, // 1 minute
    //     limit: 10, // 10 requests
    //   },
    // ]),
  ],
})
export class AppModule {}
