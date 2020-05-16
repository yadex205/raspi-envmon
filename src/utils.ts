import fs from 'fs';
import { networkInterfaces } from 'os';
import { promisify } from 'util';

export async function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), ms);
  });
}

export function getIpAddress() {
  for (const addresses of Object.values(networkInterfaces())) {
    if (!addresses) {
      continue;
    }

    for (const address of addresses) {
      if (address.family === 'IPv4' && address.internal === false) {
        return address.address;
      }
    }
  }

  return undefined;
}

export async function getCpuTemperature() {
  const path = '/sys/class/thermal/thermal_zone0/temp';
  const readFile = promisify(fs.readFile).bind(fs);
  const result = await readFile(path);
  return parseInt(result.toString()) / 1000;
}
