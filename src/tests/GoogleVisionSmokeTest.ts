import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { GoogleVisionAdapter } from '../core/ocr/providers/google/GoogleVisionAdapter';
import { GoogleVisionError } from '../core/ocr/providers/google/GoogleVisionError';
import { OCRResult } from '../core/ocr/models/OCRResult';

/**
 * Google Vision End-to-End Smoke Test
 *
 * Runs OCR pipeline against sample documents in test-data/ (JPG, PNG, PDF)
 * using the production GoogleVisionAdapter and reports execution results or errors.
 */
export async function runGoogleVisionSmokeTest(): Promise<void> {
  console.log('=========================================================');
  console.log('        GOOGLE VISION OCR END-TO-END SMOKE TEST         ');
  console.log('=========================================================\n');

  const testDataDir = path.resolve(process.cwd(), 'test-data');

  if (!fs.existsSync(testDataDir)) {
    console.error(`[Smoke Test Error] Test data directory not found at: ${testDataDir}`);
    return;
  }

  const supportedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const files = fs.readdirSync(testDataDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return supportedExtensions.includes(ext);
  });

  if (files.length === 0) {
    console.warn(`[Smoke Test Warning] No test documents (.jpg, .jpeg, .png, .pdf) found in: ${testDataDir}`);
    return;
  }

  console.log(`Found ${files.length} test document(s) in ${testDataDir}:\n- ${files.join('\n- ')}\n`);

  const adapter = new GoogleVisionAdapter();

  for (const file of files) {
    const filePath = path.join(testDataDir, file);
    const ext = path.extname(file).toLowerCase();
    const fileType = ext === '.pdf' ? 'PDF' : ext === '.png' ? 'PNG' : 'JPG';

    console.log(`---------------------------------------------------------`);
    console.log(`Executing Smoke Test for: ${file}`);
    console.log(`---------------------------------------------------------`);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const startTime = Date.now();

      const ocrResult: OCRResult = await adapter.processDocument(fileBuffer, {
        documentId: `test_${file}_${Date.now()}`,
        title: file
      });

      const processingTime = ocrResult.processingTimeMs || (Date.now() - startTime);
      const document = ocrResult.document;
      const totalPages = document.totalPages;

      const totalWords = document.pages.reduce((acc, page) => acc + page.words.length, 0);
      const overallConfidenceScore = document.overallConfidence ? document.overallConfidence.score : 0;
      const overallConfidenceFormatted = `${(overallConfidenceScore * 100).toFixed(2)}%`;

      // Extract full text preview across lines/words
      const fullText = document.pages
        .map(p => {
          if (p.lines.length > 0) {
            return p.lines.map(l => l.text).join('\n');
          }
          return p.words.map(w => w.text).join(' ');
        })
        .filter(t => t.trim().length > 0)
        .join('\n\n');

      const textPreview = fullText.length > 0
        ? fullText.substring(0, 1000)
        : '[No text extracted]';

      console.log(`✓ Provider Name            : ${ocrResult.provider}`);
      console.log(`✓ Input File               : ${filePath}`);
      console.log(`✓ File Type                : ${fileType}`);
      console.log(`✓ Processing Time          : ${processingTime} ms`);
      console.log(`✓ Total Pages              : ${totalPages}`);
      console.log(`✓ Total Words              : ${totalWords}`);
      console.log(`✓ Overall Confidence       : ${overallConfidenceFormatted}`);
      console.log(`✓ Extracted Text Preview   :\n--- BEGIN PREVIEW (First 1000 chars) ---`);
      console.log(textPreview);
      console.log(`--- END PREVIEW ---\n`);

      if (ocrResult.status === 'FAILED') {
        console.error(`✖ Document Processing Status: FAILED`);
        if (ocrResult.errors && ocrResult.errors.length > 0) {
          console.error(`  Errors:`);
          ocrResult.errors.forEach(err => console.error(`   - ${err}`));
        }
      }
    } catch (error: unknown) {
      console.error(`\n✖ OCR Execution Failed for ${file}:`);
      if (error instanceof GoogleVisionError) {
        console.error(`  [GoogleVisionError]`);
        console.error(`  - Message        : ${error.message}`);
        console.error(`  - Error Code     : ${error.code}`);
        if (error.originalError) {
          console.error(`  - Original Error : ${error.originalError.message}`);
          if (error.originalError.stack) {
            console.error(`  - Stack Trace    :\n${error.originalError.stack}`);
          }
        }
      } else if (error instanceof Error) {
        console.error(`  [Error] ${error.message}`);
        if (error.stack) {
          console.error(`  - Stack Trace :\n${error.stack}`);
        }
      } else {
        console.error(`  [Unknown Exception]`, error);
      }
      console.log(`\n`);
    }
  }

  console.log('=========================================================');
  console.log('             SMOKE TEST EXECUTION COMPLETE              ');
  console.log('=========================================================\n');
}

// Execute directly if run via CLI / tsx
if (import.meta.url.endsWith(path.basename(process.argv[1] || ''))) {
  runGoogleVisionSmokeTest().catch(err => {
    console.error('Fatal Smoke Test Error:', err);
    process.exit(1);
  });
}
