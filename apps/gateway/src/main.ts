import { Logger } from '@nestjs/common';

import { AppFactory, setupProcessHandlers } from './app';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Create and configure application
    const app = await AppFactory.create();

    // Start server
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

// Setup global process error handlers
setupProcessHandlers();

// Start the application
bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('❌ Failed to start application:', error);

  process.exit(1);
});
