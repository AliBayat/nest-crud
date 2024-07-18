import { Transport, ClientsModuleOptions } from '@nestjs/microservices';

const defaultUser = process.env.RABBITMQ_USER || 'guest';
const defaultPass = process.env.RABBITMQ_PASSWORD || 'guest';
const defaultPort = process.env.RABBITMQ_PORT || '5672';
const defaultHost = process.env.RABBITMQ_HOST || 'rabbitmq';

export const rabbitMQConfig: ClientsModuleOptions = [
  {
    name: 'RABBITMQ_SERVICE',
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${defaultUser}:${defaultPass}@${defaultHost}:${defaultPort}`,
      ],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  },
];
