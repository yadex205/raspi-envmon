import * as i2c from 'i2c-bus';
import { delay } from './utils';

const STATUS          = 0x00;
const MEAS_MODE       = 0x01;
const ALG_RESULT_DATA = 0x02;
const RAW_DATA        = 0x03;
const ENV_DATA        = 0x05;
const THRESHOLDS      = 0x10;
const BASELINE        = 0x11;
const HW_ID           = 0x20;
const HW_VERSION      = 0x21;
const FW_BOOT_VERSION = 0x23;
const FW_APP_VERSION  = 0x24;
const ERROR_ID        = 0xE0;
const APP_START       = 0xF4;
const SW_RESET        = 0xFF;

interface CCS811Status {
  error: boolean;
  dataReady: boolean;
  appValid: boolean;
  fwMode: 'boot' | 'application';
}

interface CCS811Values {
  eco2: number;
  tvoc: number;
}

export class CCS811 {
  private readonly address = 0x5b;

  public async initialize() {
    if (await this.getHardwareId() !== 0x81) {
      throw new Error('CCS811: Invalid Hardware ID');
    };

    await this.resetSensor();
    await delay(10);
    if ((await this.getStatus()).error) {
      throw new Error('CCS811: Failed to reset sensor');
    }
    await this.start();
    await delay(10);

    await this.setDriveMode(1);
    if ((await this.getStatus()).error) {
      throw new Error('CCS811: Failed to set drive mode');
    }
  }

  public async getValues(): Promise<CCS811Values> {
    const rawResult = Buffer.alloc(8);
    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, 1, Buffer.from([ALG_RESULT_DATA]));
    await conn.i2cRead(this.address, 8, rawResult);
    await conn.close();

    return {
      eco2: (rawResult[0] << 8) | rawResult[1],
      tvoc: (rawResult[2] << 8) | rawResult[3],
    };
  }

  private async getHardwareId() {
    const result = Buffer.alloc(1);
    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, 1, Buffer.from([HW_ID]))
    await conn.i2cRead(this.address, 1, result);
    await conn.close();
    return result[0];
  }

  private async resetSensor() {
    const msg = Buffer.from([ SW_RESET, 0x11, 0xe5, 0x72, 0x8a ]);
    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, msg.length, msg);
  }

  private async start() {
    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, 1, Buffer.from([APP_START]));
    await conn.close();
  }

  private async getStatus(): Promise<CCS811Status> {
    const rawResult = Buffer.alloc(1);
    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, 1, Buffer.from([STATUS]));
    await conn.i2cRead(this.address, 1, rawResult);
    await conn.close();

    const result = rawResult[0];

    return {
      error: (result & 1) > 0,
      dataReady: (result & 1 << 3) > 0,
      appValid: (result & 1 << 4) > 0,
      fwMode: (result & 1 << 7) > 0 ? 'application' : 'boot',
    };
  }

  private async setDriveMode(mode: number) {
    if (mode > 4) {
      mode = 4;
    }
    const result = Buffer.alloc(1);

    const conn1 = await i2c.openPromisified(1);
    await conn1.i2cWrite(this.address, 1, Buffer.from([MEAS_MODE]));
    await conn1.i2cRead(this.address, 1, result);
    await conn1.close();

    const nextMode = (result[0] & ~(0b00000111 << 4)) | (mode << 4);

    const conn2 = await i2c.openPromisified(1);
    await conn2.i2cWrite(this.address, 2, Buffer.from([MEAS_MODE, nextMode]));
    await conn2.close();
  }
}
