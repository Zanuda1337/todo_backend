import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from './pipes/validation.pipe';
import { SocketIoAdapter } from './adapters/socket-io-adapter';

const start = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, always: true, forbidNonWhitelisted: true }),
    );
    app.useWebSocketAdapter(new SocketIoAdapter(app))
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Explore the API')
      .setDescription('This is an API for Todo List')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header',
          description: 'Enter your access token',
        },
        'access_token',
      )
      .addCookieAuth(
        'cookie-auth',
        { type: 'http', in: 'Header', scheme: 'Bearer' },
        'refresh_token',
      )
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('/api/docs', app, document);

    await app.listen(PORT, () => `Server started on port ${PORT}`);
  } catch (e) {
    console.log(e);
  }
};

start();
