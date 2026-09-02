/**
 * Minimal, dependency-free XLSX writer.
 *
 * We only ever *write* workbooks here, so instead of pulling in SheetJS (which carries an
 * unpatched high-severity advisory on the npm registry) we emit the small subset of the
 * OOXML package an invoice needs: one worksheet, inline strings, a handful of styles.
 * The result is a real .xlsx (ZIP/OOXML) that Excel, LibreOffice and Google Sheets open.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosTimestamp(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

/** STORE-only ZIP archive: no compression, so no deflate implementation to maintain. */
function zipArchive(entries) {
  const encoder = new TextEncoder();
  const { time, day } = dosTimestamp();
  const parts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);

    const local = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true); // names are UTF-8
    lv.setUint16(8, 0, true); // stored
    lv.setUint16(10, time, true);
    lv.setUint16(12, day, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, time, true);
    cv.setUint16(14, day, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);

    parts.push(local, data);
    centralParts.push(central);
    offset += local.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const total = offset + centralSize + end.length;
  const out = new Uint8Array(total);
  let cursor = 0;
  for (const part of [...parts, ...centralParts, end]) {
    out.set(part, cursor);
    cursor += part.length;
  }
  return out;
}

function escapeXml(value) {
  return String(value ?? '')
    // Strip control characters that OOXML forbids outright.
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function columnLabel(index) {
  let label = '';
  let n = index;
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0"/></numFmts>
<fonts count="6">
<font><sz val="11"/><name val="Vazirmatn"/><family val="2"/></font>
<font><b/><sz val="16"/><color rgb="FF123F34"/><name val="Vazirmatn"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Vazirmatn"/><family val="2"/></font>
<font><b/><sz val="11"/><color rgb="FF172A26"/><name val="Vazirmatn"/><family val="2"/></font>
<font><sz val="10"/><color rgb="FF6C7B77"/><name val="Vazirmatn"/><family val="2"/></font>
<font><b/><sz val="13"/><color rgb="FF123F34"/><name val="Vazirmatn"/><family val="2"/></font>
</fonts>
<fills count="5">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF123F34"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFEDF6F2"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFF2F5F4"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border>
<left style="thin"><color rgb="FFC9D8D2"/></left>
<right style="thin"><color rgb="FFC9D8D2"/></right>
<top style="thin"><color rgb="FFC9D8D2"/></top>
<bottom style="thin"><color rgb="FFC9D8D2"/></bottom>
<diagonal/>
</border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="13">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="164" fontId="3" fillId="3" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
<xf numFmtId="164" fontId="2" fillId="2" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf>
<xf numFmtId="0" fontId="5" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="center"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

/** Style indexes matching cellXfs above — keeps the row builders readable. */
export const S = {
  plain: 0,
  title: 1,
  subtitle: 2,
  tableHead: 3,
  text: 4,
  center: 5,
  money: 6,
  metaLabel: 7,
  totalLabel: 8,
  totalValue: 9,
  grandLabel: 10,
  grandValue: 11,
  section: 12,
};

function cellXml(ref, cell) {
  if (cell === null || cell === undefined || cell.value === '' || cell.value === null || cell.value === undefined) {
    return cell?.style ? `<c r="${ref}" s="${cell.style}"/>` : '';
  }
  const style = cell.style ? ` s="${cell.style}"` : '';
  if (typeof cell.value === 'number' && Number.isFinite(cell.value)) {
    return `<c r="${ref}"${style}><v>${cell.value}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr"${style}><is><t xml:space="preserve">${escapeXml(cell.value)}</t></is></c>`;
}

/**
 * @param {object} options
 * @param {number[]} options.columnWidths
 * @param {Array<Array<{value: string|number, style?: number, span?: number}>>} options.rows
 * @param {string[]} [options.merges] e.g. ['A1:G1']
 * @param {number[]} [options.rowHeights] height in points per row index
 */
export function worksheetXml({ columnWidths, rows, merges = [], rowHeights = [] }) {
  const cols = columnWidths
    .map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`)
    .join('');

  const sheetRows = rows.map((cells, rowIndex) => {
    const cellsXml = [];
    let columnIndex = 0;
    for (const cell of cells) {
      const span = cell?.span || 1;
      cellsXml.push(cellXml(`${columnLabel(columnIndex)}${rowIndex + 1}`, cell));
      // Keep merged partners present-but-styled so borders render across the whole range.
      for (let step = 1; step < span; step += 1) {
        cellsXml.push(cellXml(`${columnLabel(columnIndex + step)}${rowIndex + 1}`, { value: '', style: cell?.style }));
      }
      columnIndex += span;
    }
    const height = rowHeights[rowIndex];
    const attrs = height ? ` ht="${height}" customHeight="1"` : '';
    return `<row r="${rowIndex + 1}"${attrs}>${cellsXml.join('')}</row>`;
  }).join('');

  const mergeXml = merges.length
    ? `<mergeCells count="${merges.length}">${merges.map((ref) => `<mergeCell ref="${ref}"/>`).join('')}</mergeCells>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetViews><sheetView rightToLeft="1" workbookViewId="0"><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>
<sheetFormatPr defaultRowHeight="18"/>
<cols>${cols}</cols>
<sheetData>${sheetRows}</sheetData>
${mergeXml}
</worksheet>`;
}

/**
 * Build an .xlsx Blob for a single-sheet workbook.
 * @param {{ sheetName?: string, columnWidths: number[], rows: Array, merges?: string[], rowHeights?: number[] }} options
 */
export function buildWorkbook({ sheetName = 'فاکتور', columnWidths, rows, merges, rowHeights }) {
  const safeName = String(sheetName).replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Sheet1';
  const encoder = new TextEncoder();
  const xml = (text) => encoder.encode(text);

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="${escapeXml(safeName)}" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const sheet = worksheetXml({ columnWidths, rows, merges, rowHeights });

  const bytes = zipArchive([
    { name: '[Content_Types].xml', data: xml(contentTypes) },
    { name: '_rels/.rels', data: xml(rootRels) },
    { name: 'xl/workbook.xml', data: xml(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: xml(workbookRels) },
    { name: 'xl/styles.xml', data: xml(STYLES_XML) },
    { name: 'xl/worksheets/sheet1.xml', data: xml(sheet) },
  ]);

  return new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
