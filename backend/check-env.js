#!/usr/bin/env node
/**
 * Vérifie que le .env est correctement configuré avant de lancer le seed.
 * Usage :  node check-env.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const REQUIRED = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
const WEAK_SECRETS = [
  'change_me', 'secret', 'password', 'xxxx', 'yyyy',
];

let ok = true;

console.log('\n🔍 Vérification de la configuration .env\n');

/* 1. Variables requises */
for (const key of REQUIRED) {
  if (!process.env[key]) {
    console.error(`  ❌  ${key} — MANQUANT`);
    ok = false;
  } else {
    console.log(`    ${key} — présent`);
  }
}

/* 2. Secrets trop faibles */
for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET']) {
  const val = process.env[key] || '';
  if (WEAK_SECRETS.some(w => val.toLowerCase().includes(w))) {
    console.warn(`  ⚠   ${key} — semble être la valeur d'exemple, changez-la en production`);
  }
  if (val.length < 32) {
    console.error(`  ❌  ${key} — trop court (${val.length} chars, minimum 32)`);
    ok = false;
  }
}

if (!ok) {
  console.error('\n❌  Corrigez les erreurs ci-dessus dans votre fichier .env\n');
  process.exit(1);
}

/* 3. Test de connexion MongoDB */
console.log(`\n🔌 Test de connexion MongoDB : ${process.env.MONGO_URI}\n`);

const uri  = process.env.MONGO_URI;
const isAtlas = uri.startsWith('mongodb+srv://');
const isRS    = uri.includes('replicaSet=') || uri.includes('rs0');

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 6000,
    ...(!isAtlas && !isRS && { directConnection: true }),
  })
  .then(() => {
    console.log('    Connexion MongoDB réussie\n');
    console.log('🚀 Tout est bon — vous pouvez lancer :  npm run seed\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('  ❌  Connexion échouée :', err.message);
    console.error('\n💡 Solutions courantes :');
    console.error('   • MongoDB local non démarré  →  brew services start mongodb-community');
    console.error('                                    (ou : sudo systemctl start mongod)');
    console.error('   • Mauvais host/port          →  vérifier MONGO_URI dans .env');
    console.error('   • Atlas : IP non autorisée   →  ajouter votre IP dans Network Access');
    console.error('   • Atlas : mauvais mot de passe ou username\n');
    process.exit(1);
  });
