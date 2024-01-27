import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SocketIOAdapter } from './app/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*'
  });
  app.useWebSocketAdapter(new SocketIOAdapter(app));
  await app.listen(process.env.PORT);
}
bootstrap();
