import { BadRequestError } from '../../../utils/src/errors';

function buildPdfBuffer(title: string, subtitle: string): Buffer {
  const safeTitle = title.replace(/[()\\]/g, '');
  const safeSubtitle = subtitle.replace(/[()\\]/g, '');
  const content = `BT /F1 18 Tf 72 720 Td (${safeTitle}) Tj 0 -28 Td /F1 12 Tf (${safeSubtitle}) Tj ET`;
  const contentLength = content.length;

  const pdf = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length ${contentLength}>>stream
${content}
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000264 00000 n 
0000000400 00000 n 
trailer<</Size 6/Root 1 0 R>>
startxref
477
%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

const DOC_LABELS: Record<string, string> = {
  'business-reg': 'Business Registration',
  gst: 'GST Certificate',
  pan: 'PAN Card',
  bank: 'Bank Statement',
  rc: 'Vehicle RC Copy',
  insurance: 'Insurance Certificate',
  dl: 'Driving License',
  aadhaar: 'Aadhaar Card',
  police: 'Police Verification',
  medical: 'Medical Fitness Certificate',
};

export const adminDocumentsService = {
  getVendorDocument(vendorId: string, docKey: string) {
    if (!docKey) throw new BadRequestError('Document key is required');
    const label = DOC_LABELS[docKey] ?? docKey.replace(/-/g, ' ');
    return {
      filename: `${label.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      buffer: buildPdfBuffer(label, `Vendor ${vendorId}`),
    };
  },

  getDriverDocument(driverId: string, docKey: string) {
    if (!docKey) throw new BadRequestError('Document key is required');
    const label = DOC_LABELS[docKey] ?? docKey.replace(/-/g, ' ');
    return {
      filename: `${label.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      buffer: buildPdfBuffer(label, `Driver ${driverId}`),
    };
  },
};
