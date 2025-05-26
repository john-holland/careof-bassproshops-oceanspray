import { Pact } from '@pact-foundation/pact';
import path from 'path';

export const provider = new Pact({
  consumer: 'data-service',
  provider: 'fishery-service',
  port: 3001,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'info',
  spec: 2,
});

export const setupPact = async () => {
  await provider.setup();
};

export const finalizePact = async () => {
  await provider.finalize();
}; 