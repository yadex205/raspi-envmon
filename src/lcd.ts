import * as i2c from 'i2c-bus';

const COMMAND            = 0x00;
const DATA               = 0x40;
const SETCONTRAST        = 0x81;
const DISPLAYALLONRESUME = 0xA4;
const DISPLAYALLON       = 0xA5;
const NORMALDISPLAY      = 0xA6;
const INVERTDISPLAY      = 0xA7;
const DISPLAYOFF         = 0xAE;
const DISPLAYON          = 0xAF;
const SETDISPLAYOFFSET   = 0xD3;
const SETCOMPINS         = 0xDA;
const SETVCOMDESELECT    = 0xDB;
const SETDISPLAYCLOCKDIV = 0xD5;
const SETPRECHARGE       = 0xD9;
const SETMULTIPLEX       = 0xA8;
const SETLOWCOLUMN       = 0x00;
const SETHIGHCOLUMN      = 0x10;
const SETSTARTLINE       = 0x40;
const MEMORYMODE         = 0x20;
const COMSCANINC         = 0xC0;
const COMSCANDEC         = 0xC8;
const SEGREMAP           = 0xA0;
const CHARGEPUMP         = 0x8D;
const EXTERNALVCC        = 0x01;
const SWITCHCAPVCC       = 0x02;

const FONTS = new Uint8Array([
  0x00, 0x28, 0x6c, 0x28, // caret up down
  0x00, 0b11101000, 0b10101000, 0b10111000, // small 2
  0x00, 0b00001110, 0b00001010, 0b00001110, // degree symbol
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, // SPC
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0xc0, 0xc0, 0x00, // .
  0x00, 0xe0, 0x38, 0x0e, // /
  0x00, 0xfe, 0x82, 0xfe, // 0
  0x00, 0x00, 0x04, 0xfe, // 1
  0x00, 0xf2, 0x92, 0x9e, // 2
  0x00, 0x92, 0x92, 0xfe, // 3
  0x00, 0x1e, 0x10, 0xfe, // 4
  0x00, 0x9e, 0x92, 0xf2, // 5
  0x00, 0xfe, 0x90, 0xf0, // 6
  0x00, 0x02, 0x02, 0xfe, // 7
  0x00, 0xfe, 0x92, 0xfe, // 8
  0x00, 0x1e, 0x12, 0xfe, // 9
  0x00, 0x00, 0x44, 0x00, // :
  0x00, 0x00, 0xc4, 0x00, // ;
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0b11111100, 0b00100010, 0b11111100, // A
  0x00, 0b11111100, 0b10010010, 0b11101110, // B
  0x00, 0xfc, 0x82, 0x82, // C
  0x00, 0xfe, 0x82, 0xfc, // D
  0x00, 0b11111100, 0b10010010, 0b10010010, // E
  0x00, 0xfc, 0x0a, 0x0a, // F
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0xfe, 0x10, 0xfe, // H
  0x00, 0x82, 0xfe, 0x82, // I
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0xfe, 0x04, 0xfe, // M
  0x00, 0xfe, 0x04, 0xf8, // N
  0x00, 0xfc, 0x82, 0xfe, // O
  0x00, 0b11111100, 0b00010010, 0b00001110, // P
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0xfc, 0x0a, 0xf6, // R
  0x00, 0x86, 0x8a, 0xf2, // S
  0x00, 0x02, 0xfe, 0x02, // T
  0x00, 0b11111110, 0b10000000, 0b11111110, // U
  0x00, 0b01111110, 0b10000000, 0b01111110, // V
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
  0x00, 0x00, 0x00, 0x00, //
]);

export class LCD {
  private readonly address = 0x3d;
  private buffer = new Uint8Array(384);

  constructor() {
    this.buffer.fill(0x00);
  }

  public async initialize() {
    const msg = Buffer.from([
      COMMAND, DISPLAYOFF,
      COMMAND, SETDISPLAYCLOCKDIV, 0x80,
      COMMAND, SETMULTIPLEX, 0x2f,
      COMMAND, SETDISPLAYOFFSET, 0x0,
      COMMAND, SETSTARTLINE | 0x0,
      COMMAND, CHARGEPUMP, 0x14,
      COMMAND, NORMALDISPLAY,
      COMMAND, DISPLAYALLONRESUME,
      COMMAND, SEGREMAP | 0x0,
      COMMAND, COMSCANINC,
      COMMAND, SETCOMPINS, 0x12,
      COMMAND, SETCONTRAST, 0x8f,
      COMMAND, SETPRECHARGE, 0xf1,
      COMMAND, SETVCOMDESELECT, 0x40,
      COMMAND, DISPLAYON,
    ]);

    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, msg.length, msg);
    await conn.close();
  }

  public text(row: number, col: number, str: string) {
    for (let index = 0; index < str.length; index++) {
      const fontIndex = str.charCodeAt(index);
      for (let pos = 0; pos < 4; pos++) {
        this.buffer[row * 0x40 + (col + index) * 4 + pos] = FONTS[fontIndex * 4 + pos];
      }
    }
  }

  public rawData(row: number, col: number, data: Uint8Array) {
    for (let pos = 0; pos < data.length; pos++) {
      this.buffer[row * 0x40 + col + pos] = data[pos];
    }
  }

  public async drawRow(row: number) {
    const chunk = this.buffer.slice(row * 0x40, (row + 1) * 0x40);

    await this.setCursor(row, 0);
    await this.sendData(chunk);
  }

  public async draw() {
    for (let row = 0; row < 6; row++) {
      await this.drawRow(row);
    }
  }

  private async sendData(buffer: Uint8Array) {
    const msg = Buffer.from([DATA, ...buffer]);
    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, msg.length, msg);
    await conn.close();
  }

  private async setCursor(row: number, col: number) {
    const msg = Buffer.from([
      COMMAND, 0xb0 | row,
      COMMAND, (0x10 | (col >> 4)) + 0x02,
      COMMAND, 0x0f & col,
    ]);

    const conn = await i2c.openPromisified(1);
    await conn.i2cWrite(this.address, msg.length, msg);
  }
}
