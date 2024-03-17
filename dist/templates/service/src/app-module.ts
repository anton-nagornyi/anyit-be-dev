import { Module } from '@nestjs/common';
import { SampleModule } from './modules/sample-module';

@Module({
  imports: [SampleModule],
})
export class AppModule {}
