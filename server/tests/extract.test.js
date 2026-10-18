import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import PDFDocument from 'pdfkit';

import { app } from '../server.js';

const buildPdf = (text) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.text(text, 72, 72);
    doc.end();
  });
};

const startTestServer = async () => {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { server, port };
};

const callExtract = async (port, fileBuffer, fileName, mimeType = 'application/pdf') => {
  const form = new FormData();
  form.append('file', new Blob([fileBuffer], { type: mimeType }), fileName);

  const response = await fetch(`http://127.0.0.1:${port}/api/extract`, {
    method: 'POST',
    body: form,
  });

  return {
    status: response.status,
    body: await response.json(),
  };
};

test('valid text-based PDF returns candidate terms', async () => {
  const { server, port } = await startTestServer();
  const pdfBuffer = await buildPdf('Monthly Rent: RM 2,500.00. Security Deposit: RM 5,000.00. Lock in period: 12 months. Notice period: 30 days.');

  const result = await callExtract(port, pdfBuffer, 'valid.pdf', 'application/pdf');

  assert.equal(result.status, 200);
  assert.equal(result.body.candidateTerms.monthlyRent, 'RM 2,500.00');
  assert.equal(result.body.candidateTerms.securityDeposit, 'RM 5,000.00');
  assert.equal(result.body.candidateTerms.lockInPeriod, '12 months');
  assert.equal(result.body.candidateTerms.noticePeriod, '30 days');
  assert.match(result.body.extractedText, /Monthly Rent/i);

  server.close();
});

test('lock-in period is detected when phrased as "The lock-in period is 12 months"', async () => {
  const { server, port } = await startTestServer();
  const pdfBuffer = await buildPdf('The lock-in period is 12 months from the tenancy commencement date. Monthly Rent: RM 2,500.00. Security Deposit: RM 5,000.00. Notice period: 30 days.');

  const result = await callExtract(port, pdfBuffer, 'lockin.pdf', 'application/pdf');

  assert.equal(result.status, 200);
  assert.equal(result.body.candidateTerms.lockInPeriod, '12 months');
  assert.equal(result.body.candidateTerms.monthlyRent, 'RM 2,500.00');
  assert.equal(result.body.candidateTerms.securityDeposit, 'RM 5,000.00');
  assert.equal(result.body.candidateTerms.noticePeriod, '30 days');

  server.close();
});

test('first sample PDF returns its exact candidate terms', async () => {
  const { server, port } = await startTestServer();
  const pdfBuffer = await readFile(new URL('../../test_documents/lease_lens_sample_lease.pdf', import.meta.url));

  const result = await callExtract(port, pdfBuffer, 'lease_lens_sample_lease.pdf');

  assert.equal(result.status, 200);
  assert.deepEqual(result.body.candidateTerms, {
    monthlyRent: 'RM 2,500.00',
    securityDeposit: 'RM 5,000.00',
    lockInPeriod: '12 months',
    noticePeriod: '30 days',
  });

  server.close();
});

test('second sample PDF returns its exact candidate terms', async () => {
  const { server, port } = await startTestServer();
  const pdfBuffer = await readFile(new URL('../../test_documents/lease_lens_sample_lease_2.pdf', import.meta.url));

  const result = await callExtract(port, pdfBuffer, 'lease_lens_sample_lease_2.pdf');

  assert.equal(result.status, 200);
  assert.deepEqual(result.body.candidateTerms, {
    monthlyRent: 'MYR 1,850',
    securityDeposit: 'MYR 3,700',
    lockInPeriod: '6 months',
    noticePeriod: '45 days',
  });

  server.close();
});

test('unrelated numbers and currency amounts do not become candidate terms', async () => {
  const { server, port } = await startTestServer();
  const pdfBuffer = await buildPdf('Rental Premises: Unit 8B, Section 6. Tenancy starts on 15 December 2026 and payment is due on the third calendar day. Utility charge: MYR 300.');

  const result = await callExtract(port, pdfBuffer, 'unrelated-values.pdf');

  assert.equal(result.status, 200);
  assert.deepEqual(result.body.candidateTerms, {
    monthlyRent: null,
    securityDeposit: null,
    lockInPeriod: null,
    noticePeriod: null,
  });

  server.close();
});

test('non-PDF upload is rejected', async () => {
  const { server, port } = await startTestServer();

  const result = await callExtract(port, Buffer.from('not a pdf'), 'notes.txt', 'text/plain');

  assert.equal(result.status, 400);
  assert.match(String(result.body.error), /PDF/i);

  server.close();
});

test('file over 5 MB is rejected', async () => {
  const { server, port } = await startTestServer();
  const largeBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 'A');

  const result = await callExtract(port, largeBuffer, 'large.pdf', 'application/pdf');

  assert.equal(result.status, 400);
  assert.match(String(result.body.error), /5 MB|too large|size/i);

  server.close();
});

test('empty or unreadable PDF is rejected', async () => {
  const { server, port } = await startTestServer();

  const result = await callExtract(port, Buffer.from('not a valid pdf'), 'empty.pdf', 'application/pdf');

  assert.equal(result.status, 400);
  assert.match(String(result.body.error), /text-based PDF|unreadable|invalid/i);

  server.close();
});

test('image-only PDF is rejected', async () => {
  const { server, port } = await startTestServer();
  const buffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 72 72] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length 3 >>\nstream\n\x00\x00\x00\nendstream\nendobj\n5 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000062 00000 n \n0000000123 00000 n \n0000000245 00000 n \n0000000567 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n640\n%%EOF');

  const result = await callExtract(port, buffer, 'image-only.pdf', 'application/pdf');

  assert.equal(result.status, 400);
  assert.match(String(result.body.error), /text-based PDF|extractable text/i);

  server.close();
});
