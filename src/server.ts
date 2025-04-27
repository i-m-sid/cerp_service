import app from './app';

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000; // Read PORT from env
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server is running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
