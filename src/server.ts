import app from './app';

// Start the server (for local development)
const startServer = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0',
    });
    app.log.info(
      `🚀 Server running on http://localhost:${process.env.PORT || 3000}`,
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Run the server locally
startServer();
