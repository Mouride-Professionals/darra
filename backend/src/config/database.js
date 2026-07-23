const mongoose = require('mongoose');
const logger   = require('./logger');

const buildOptions = (uri) => {
  const isAtlas      = uri.startsWith('mongodb+srv://');
  const isReplicaSet = uri.includes('replicaSet=') || uri.includes('rs0');

  return {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS:          45000,
    ...((!isAtlas && !isReplicaSet) && { directConnection: true }),
  };
};

const connect = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      '❌  MONGO_URI manquant dans .env\n' +
      '    Local    → mongodb://127.0.0.1:27017/daara-touba\n' +
      '    Atlas    → mongodb+srv://user:pass@cluster.mongodb.net/daara-touba'
    );
  }

  /* Évite les doublons de listeners sur les hot-reloads */
  if (mongoose.connection.listenerCount('connected') === 0) {
    mongoose.connection.on('connected',    () => logger.info('  MongoDB connecté'));
    mongoose.connection.on('error',   (err) => logger.error('MongoDB erreur', { message: err.message }));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB déconnecté'));
  }

  await mongoose.connect(uri, buildOptions(uri));
};

const disconnect = async () => {
  await mongoose.disconnect();
  logger.info('MongoDB déconnecté proprement');
};

module.exports = { connect, disconnect };
