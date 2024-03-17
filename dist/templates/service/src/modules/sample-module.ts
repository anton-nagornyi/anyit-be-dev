import { Module } from '@nestjs/common';
import { SampleService } from "./sample-service";

@Module({
  providers: [SampleService],
})
export class SampleModule {}
