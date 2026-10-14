import { inflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { createExcelWorkbook } from './excel-export.js';

describe('createExcelWorkbook', () => {
  it('creates an Excel workbook containing escaped Unicode cell values', () => {
    const workbook = createExcelWorkbook(
      [['Ism', 'Savol'], ['Ali & Vali', 'Kelajakda <qaysi kasb>?']],
      '9-sinf',
    );

    expect(workbook.readUInt32LE(0)).toBe(0x04034b50);
    expect(workbook.readUInt32LE(workbook.length - 22)).toBe(0x06054b50);

    let offset = 0;
    let worksheet = '';
    while (workbook.readUInt32LE(offset) === 0x04034b50) {
      const compressedSize = workbook.readUInt32LE(offset + 18);
      const nameLength = workbook.readUInt16LE(offset + 26);
      const extraLength = workbook.readUInt16LE(offset + 28);
      const nameStart = offset + 30;
      const name = workbook.toString('utf8', nameStart, nameStart + nameLength);
      const contentStart = nameStart + nameLength + extraLength;
      if (name === 'xl/worksheets/sheet1.xml') {
        worksheet = inflateRawSync(
          workbook.subarray(contentStart, contentStart + compressedSize),
        ).toString('utf8');
        break;
      }
      offset = contentStart + compressedSize;
    }

    expect(worksheet).toContain('Ali &amp; Vali');
    expect(worksheet).toContain('Kelajakda &lt;qaysi kasb&gt;?');
  });
});
