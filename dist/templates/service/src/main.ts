import { NestFactory } from '@nestjs/core';
import { AppModule } from './app-module';
import { Config } from './config';

declare const module: any;

async function bootstrap() {
  if (!process.env.SERVICE_NAME) {
    throw new Error('SERVICE_NAME is not set');
  }

  const app = await NestFactory.create(AppModule, {
    snapshot: Config.app.environment !== 'production',
    abortOnError: false,
  });

  await app.listen(Config.app.port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown');
  console.error(err);
});

bootstrap();
