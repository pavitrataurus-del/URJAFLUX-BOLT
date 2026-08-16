/**
 * Minimal DOCX (.docx) plain-text extraction without external ZIP libraries.
 * Reads word/document.xml from the OpenXML ZIP container.
 */

const LOCAL_FILE_HEADER = 0x04034b50;

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

async function inflateRawDeflate(compressed: Uint8Array): Promise<Uint8Array> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error("DOCX decompression is not supported in this browser.");
  }

  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();
  await writer.write(compressed);
  await writer.close();

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.length;
  }
  return output;
}

async function extractZipEntryText(data: Uint8Array, targetName: string): Promise<string | null> {
  let offset = 0;

  while (offset + 30 <= data.length) {
    const signature = readUint32LE(data, offset);
    if (signature !== LOCAL_FILE_HEADER) break;

    const compressionMethod = readUint16LE(data, offset + 8);
    const compressedSize = readUint32LE(data, offset + 18);
    const nameLength = readUint16LE(data, offset + 26);
    const extraLength = readUint16LE(data, offset + 28);

    const nameStart = offset + 30;
    const nameEnd = nameStart + nameLength;
    if (nameEnd > data.length) break;

    const entryName = new TextDecoder().decode(data.subarray(nameStart, nameEnd));
    const dataStart = nameEnd + extraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > data.length) break;

    const compressed = data.subarray(dataStart, dataEnd);
    if (entryName === targetName) {
      if (compressionMethod === 0) {
        return new TextDecoder().decode(compressed);
      }
      if (compressionMethod === 8) {
        const inflated = await inflateRawDeflate(compressed);
        return new TextDecoder().decode(inflated);
      }
      return null;
    }

    offset = dataEnd;
  }

  return null;
}

export function isDocxBuffer(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const bytes = new Uint8Array(buffer.slice(0, 4));
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

export function xmlToPlainText(xml: string): string {
  return xml
    .replace(/<w:tab[^>]*\/>/gi, "\t")
    .replace(/<w:br[^>]*\/>/gi, "\n")
    .replace(/<\/w:p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export async function extractDocxPlainText(buffer: ArrayBuffer): Promise<string> {
  if (!isDocxBuffer(buffer)) {
    throw new Error("Invalid DOCX file — expected a Word OpenXML (.docx) ZIP archive.");
  }

  const xml = await extractZipEntryText(new Uint8Array(buffer), "word/document.xml");
  if (!xml?.trim()) {
    throw new Error("DOCX file does not contain readable word/document.xml text.");
  }

  return xmlToPlainText(xml);
}

export async function readFileArrayBuffer(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ArrayBuffer> {
  if (file.size === 0) {
    throw new Error(`File is empty (0 bytes): ${file.name}. Save the document in Word and upload again.`);
  }

  if (typeof file.arrayBuffer === "function") {
    try {
      const direct = await file.arrayBuffer();
      if (direct.byteLength > 0) {
        onProgress?.(100);
        return direct;
      }
    } catch {
      // fall through to FileReader
    }
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    reader.onload = () => {
      const result = reader.result;
      if (!(result instanceof ArrayBuffer) || result.byteLength === 0) {
        reject(new Error(`Failed to read non-empty bytes for ${file.name}`));
        return;
      }
      onProgress?.(100);
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error(`FileReader failed for ${file.name}`));
    };

    reader.readAsArrayBuffer(file);
  });
}
