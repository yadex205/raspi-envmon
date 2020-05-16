import { LCD } from './lcd';
import { CCS811 } from './ccs811';
import { Machinist, MetricsItem } from './machinist';
import { delay, getIpAddress, getCpuTemperature, getUnixtime, AverageGetter } from './utils';

const MACHINIST_API_KEY = process.env.MACHINIST_API_KEY;
const MACHINIST_AGENT_ID = process.env.MACHINIST_AGENT_ID;

async function main() {
  if (!MACHINIST_API_KEY || !MACHINIST_AGENT_ID) {
    throw new Error('Machinist: invalid API key or Agent ID');
  }

  const lcd = new LCD();
  const ccs811 = new CCS811();
  const agent = new Machinist({ apiKey: MACHINIST_API_KEY, agentId: MACHINIST_AGENT_ID });

  let counter = 0;
  const eco2AverageGetter = new AverageGetter({ size: 60 });
  const tvocAverageGetter = new AverageGetter({ size: 60 });

  await ccs811.initialize();
  await lcd.initialize();
  await agent.send([{
    name: 'started',
    namespace: 'system',
    data_point: {
      value: 1,
      timestamp: getUnixtime(),
    },
  }]);

  lcd.text(0, 0, String.fromCharCode(0) + 'N/A');
  lcd.text(1, 0, 'ECO' + String.fromCharCode(1) + ':    N/A PPM');
  lcd.text(2, 0, 'TVOC:    N/A PPB');
  lcd.text(3, 0, ' CPU:    N/A  ' + String.fromCharCode(2) + 'C');

  await lcd.draw();

  while(true) {
    const ipAddress = getIpAddress();
    const { eco2, tvoc } = await ccs811.getValues();
    const cpuTemp = await getCpuTemperature();
    if (eco2 <= 8192 && eco2 >= 400) {
      // TODO: Update ccs881.ts to reject invalid value
      eco2AverageGetter.push(eco2);
    }
    if (tvoc <= 1187) {
      // TODO: Update ccs881.ts to reject invalid value
      tvocAverageGetter.push(tvoc);
    }
    lcd.text(0, 1, ipAddress || 'N/A');
    lcd.text(1, 6, eco2.toString().padStart(6, ' '));
    lcd.text(2, 6, tvoc.toString().padStart(6, ' '));
    lcd.text(3, 6, cpuTemp.toString().padStart(6, ' '));
    await lcd.draw();

    counter++;
    if (counter >= 60) {
      const timestamp = getUnixtime();
      agent.send([
        {
          name: 'eco2',
          namespace: 'sensor',
          data_point: {
            value: eco2AverageGetter.getAverage(),
            timestamp,
          },
        },
        {
          name: 'tvoc',
          namespace: 'sensor',
          data_point: {
            value: tvocAverageGetter.getAverage(),
            timestamp,
          },
        }
      ]);
      counter = 0;
    }

    await delay(1000);
  }
}

main();
