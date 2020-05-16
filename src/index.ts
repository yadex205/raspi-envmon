import { LCD } from './lcd';
import { CCS811 } from './ccs811';
import { delay, getIpAddress, getCpuTemperature } from './utils';

async function main() {
  const lcd = new LCD();
  const ccs811 = new CCS811();

  await ccs811.initialize();
  await lcd.initialize();

  lcd.text(0, 0, String.fromCharCode(0) + 'N/A');
  lcd.text(1, 0, 'ECO' + String.fromCharCode(1) + ':    N/A PPM');
  lcd.text(2, 0, 'TVOC:    N/A PPB');
  lcd.text(3, 0, ' CPU:    N/A  ' + String.fromCharCode(2) + 'C');

  await lcd.draw();

  while(true) {
    const ipAddress = getIpAddress();
    const { eco2, tvoc } = await ccs811.getValues();
    const cpuTemp = await getCpuTemperature();
    lcd.text(0, 1, ipAddress || 'N/A');
    lcd.text(1, 6, eco2.toString().padStart(6, ' '));
    lcd.text(2, 6, tvoc.toString().padStart(6, ' '));
    lcd.text(3, 6, cpuTemp.toString().padStart(6, ' '));
    await lcd.draw();
    await delay(1000);
  }
}

main();
