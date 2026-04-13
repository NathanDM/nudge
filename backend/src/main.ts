import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET)
    throw new Error('JWT_SECRET environment variable is required in production');
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:5173'];
  app.enableCors({ origin: corsOrigin, credentials: true });
  await app.listen(3000);
  console.log('Backend running on http://localhost:3000');
}
bootstrap();
