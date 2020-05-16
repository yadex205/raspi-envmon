import { LCD } from './lcd';

const ARROW_UP_DOWN = new Uint8Array([0x00, 0x28, 0x6c, 0x28]);
const SUB_2 = new Uint8Array([0x00, 0xe8, 0xa8, 0xb8]);

async function main() {
  const lcd = new LCD();
  await lcd.initialize();
  lcd.rawData(0, 0, ARROW_UP_DOWN);
  lcd.text(0, 1, '192.168.205.205');
  lcd.text(1, 0, 'CO :       0 PPM');
  lcd.rawData(1, 8, SUB_2);

  await lcd.draw();
}

main();
