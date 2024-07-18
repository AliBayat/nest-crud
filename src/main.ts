import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import helmet from 'helmet';
import * as compression from 'compression';

const PORT = parseInt(process.env.PORT, 10) || 4000;
const RABBITMQ_URL = 'amqp://guest:guest@rabbitmq:5672';
const QUEUE_NAME = 'notifications_queue';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupGlobalMiddleware(app);
  setupMicroservice(app);
  await startApp(app);
}

function setupGlobalMiddleware(app) {
  app.enableCors({ origin: '*' });
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({ type: VersioningType.URI });
  app.use(helmet());
  app.use(compression());
  app.useGlobalFilters(new AllExceptionsFilter());
}

function setupMicroservice(app) {
  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL],
      queue: QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  };

  app.connectMicroservice(microserviceOptions);
}

async function startApp(app) {
  await app.startAllMicroservices();
  await app.listen(PORT, () => {
    console.log(`🚀 Application running at port ${PORT}`);
  });
}

bootstrap();