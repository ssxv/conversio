import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SocketIOAdapter } from './app/socket-io.adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*'
  });
  app.useWebSocketAdapter(new SocketIOAdapter(app));
  await app.listen(+(configService.get('PORT')));
}
bootstrap();
