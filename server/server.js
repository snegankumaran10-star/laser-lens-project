import express from 'express';
import dotenv from 'dotenv';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';

dotenv.config();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const app = express();
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || 'localhost';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const mimeType = String(file.mimetype || '').toLowerCase();
    const isPdfMime = mimeType === 'application/pdf';
    const isPdfExtension = file.originalname?.toLowerCase().endsWith('.pdf');

    if (!isPdfMime && !isPdfExtension) {
      return cb(new Error('Only PDF files are supported.'));
    }

    cb(null, true);
  },
});

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const extractMatch = (text, pattern) => {
  const match = text.match(pattern);
  return match ? normalizeText(match[1]) : null;
};

const CURRENCY_AMOUNT = '((?:MYR|RM)\\s*\\d+(?:,\\d{3})*(?:\\.\\d{1,2})?)';

const extractMoneyValue = (text, term) => {
  if (term === 'monthlyRent') {
    return extractMatch(
      text,
      new RegExp(`\\bmonthly\\s+rent\\s*(?:(?:is|of)\\s*)?[:\\-]?\\s*${CURRENCY_AMOUNT}\\b`, 'i'),
    ) ?? extractMatch(
      text,
      new RegExp(`\\boccupancy\\s+charges\\s+are\\s+${CURRENCY_AMOUNT}\\s+per\\s+month\\b`, 'i'),
    );
  }

  return extractMatch(
    text,
    new RegExp(`\\b(?:security|tenancy)\\s+deposit\\s*(?:(?:of|is)\\s*)?[:\\-]?\\s*${CURRENCY_AMOUNT}\\b`, 'i'),
  );
};

const extractDurationValue = (text, term) => {
  if (term === 'lockInPeriod') {
    return extractMatch(
      text,
      /\b(?:lock[-\s]?in\s+period|minimum\s+occupancy\s+commitment)\s*(?:is|:|-)\s*(\d+\s*(?:days?|months?|years?))\b/i,
    );
  }

  return extractMatch(
    text,
    /\bnotice\s+period\b[^.!?]{0,80}?\b(\d+\s*days?)\b/i,
  ) ?? extractMatch(
    text,
    /\b(\d+\s*days?)['’]?\s+written\s+notice\b/i,
  );
};

const extractCandidateTerms = (text) => {
  const normalizedText = normalizeText(text);

  return {
    monthlyRent: extractMoneyValue(normalizedText, 'monthlyRent'),
    securityDeposit: extractMoneyValue(normalizedText, 'securityDeposit'),
    lockInPeriod: extractDurationValue(normalizedText, 'lockInPeriod'),
    noticePeriod: extractDurationValue(normalizedText, 'noticePeriod'),
  };
};

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'lease-lens-server',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/extract', (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file exceeds the 5 MB size limit.'
        : 'Only PDF files are supported.';

      return res.status(400).json({ error: message });
    }

    next();
  });
}, async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile || !uploadedFile.buffer) {
    return res.status(400).json({ error: 'No PDF file was uploaded.' });
  }

  if (uploadedFile.size > MAX_FILE_SIZE) {
    return res.status(400).json({ error: 'Uploaded file exceeds the 5 MB size limit.' });
  }

  const pdfHeader = uploadedFile.buffer.subarray(0, 5).toString('ascii');

  if (!pdfHeader.startsWith('%PDF-')) {
    return res.status(400).json({ error: 'Invalid PDF file. Please upload a valid text-based PDF.' });
  }

  let parsedPdf;

  try {
    const parser = new PDFParse({ data: uploadedFile.buffer });
    parsedPdf = await parser.getText();
    parser.destroy?.();
  } catch (error) {
    return res.status(400).json({
      error: 'Unable to read this PDF. Please upload a text-based PDF only.',
    });
  }

  const extractedText = normalizeText(parsedPdf?.text ?? '');

  if (!extractedText || extractedText.length < 20) {
    return res.status(400).json({
      error: 'Only text-based PDFs are supported. This file does not contain extractable text.',
    });
  }

  const candidateTerms = extractCandidateTerms(extractedText);

  return res.json({
    extractedText,
    candidateTerms,
  });
});

export { app };

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}
