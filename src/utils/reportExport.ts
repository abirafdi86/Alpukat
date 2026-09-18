export type ReportExportFormat = 'csv' | 'excel' | 'pdf'
export type ReportRow = Record<string, string | number>

export function exportReport(format: ReportExportFormat, rows: ReportRow[], filename: string) {
  if (format === 'csv') {
    downloadBlob(new Blob([`\ufeff${toCsv(rows)}`], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`)
    return
  }
  if (format === 'excel') {
    downloadBlob(new Blob([toSpreadsheetXml(rows)], { type: 'application/vnd.ms-excel' }), `${filename}.xls`)
    return
  }
  throw new Error('PDF export adapter is not configured yet.')
}

function toCsv(rows: ReportRow[]) {
  const headers = Object.keys(rows[0] || {})
  return [headers, ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')))].map((row) => row.join(',')).join('\n')
}

function toSpreadsheetXml(rows: ReportRow[]) {
  const headers = Object.keys(rows[0] || {})
  const headerCells = headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join('')
  const bodyRows = rows.map((row) => `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(String(row[header] ?? ''))}</Data></Cell>`).join('')}</Row>`).join('')
  return `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Report"><Table><Row>${headerCells}</Row>${bodyRows}</Table></Worksheet></Workbook>`
}

function escapeXml(value: string) { return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character) }
function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url) }
