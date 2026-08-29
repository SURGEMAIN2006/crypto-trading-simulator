const { spawn } = require('child_process');
const path = require('path');

console.log(`=======================================================`);
console.log(`🚀 STARTING ALL CRYPTO TRADING SIMULATOR MICROSERVICES `);
console.log(`=======================================================`);

const services = [
  { name: 'API Gateway Proxy   ', path: path.join(__dirname, 'gateway', 'index.cjs') },
  { name: 'User & Auth Service ', path: path.join(__dirname, 'services', 'user-service', 'index.cjs') },
  { name: 'Market & Feeds      ', path: path.join(__dirname, 'services', 'market-service', 'index.cjs') },
  { name: 'Order Matching Engine', path: path.join(__dirname, 'services', 'matching-service', 'index.cjs') },
  { name: 'Blockchain Ledger   ', path: path.join(__dirname, 'services', 'transaction-service', 'index.cjs') }
];

const children = [];

services.forEach(svc => {
  console.log(`▶ Starting [${svc.name}]...`);
  const child = spawn(process.execPath, [svc.path], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`❌ [${svc.name}] exited with code ${code}`);
    }
  });

  children.push(child);
});

// Optionally start Vite Frontend if --with-vite argument is passed
if (process.argv.includes('--with-vite')) {
  console.log(`▶ Starting Vite Dev Server...`);
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const viteChild = spawn(npxCmd, ['vite'], { stdio: 'inherit', cwd: __dirname, shell: true });
  children.push(viteChild);
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all microservices...');
  children.forEach(c => c.kill());
  process.exit(0);
});
