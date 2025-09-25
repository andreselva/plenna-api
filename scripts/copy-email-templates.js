const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'src', 'modules', 'email', 'mailer', 'templates');

if (!fs.existsSync(srcDir)) {
  console.error(`Diretório de templates não encontrado: ${srcDir}`);
  process.exit(1);
}

const destinations = process.argv.slice(2);

if (destinations.length === 0) {
  console.error('Uso: node scripts/copy-email-templates.js <destino> [destino...]');
  process.exit(1);
}

destinations.forEach((destination) => {
  const absoluteDestination = path.resolve(process.cwd(), destination);
  const parentDir = path.dirname(absoluteDestination);

  fs.mkdirSync(parentDir, { recursive: true });
  fs.rmSync(absoluteDestination, { recursive: true, force: true });
  fs.cpSync(srcDir, absoluteDestination, { recursive: true });

  console.log(`Templates copiados para: ${absoluteDestination}`);
});
