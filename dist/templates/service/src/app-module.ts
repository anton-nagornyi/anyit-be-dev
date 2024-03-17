import { Module } from '@nestjs/common';
import { Config } from './config';
import { SampleModule } from "./modules/sample-module";

@Module({
  imports: [
    SampleModule
  ],
})
export class AppModule {}
