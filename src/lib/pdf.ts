import { PDFParse } from "pdf-parse";

export interface PDFExtractionResult {
  text: string;
  numPages: number;
  info?: {
    title?: string;
    author?: string;
    creationDate?: string;
  };
}

/**
 * Extract text content from a PDF buffer
 * @param pdfBuffer - The PDF file as a Buffer
 * @returns Extracted text and metadata
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<PDFExtractionResult> {
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();

    await parser.destroy();

    return {
      text: textResult.text.trim(),
      numPages: textResult.total,
      info: {
        title: infoResult.info?.Title as string | undefined,
        author: infoResult.info?.Author as string | undefined,
        creationDate: infoResult.info?.CreationDate as string | undefined,
      },
    };
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Validate that a file is a valid PDF
 * @param buffer - File buffer to validate
 * @returns true if the file starts with PDF magic bytes
 */
export function isValidPDF(buffer: Buffer): boolean {
  // PDF files start with "%PDF-"
  const pdfMagicBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
  return buffer.subarray(0, 5).equals(pdfMagicBytes);
}

/**
 * Clean extracted text for better Q&A processing
 * Removes excessive whitespace and normalizes line breaks
 */
export function cleanExtractedText(text: string): string {
  return (
    text
      // Replace multiple spaces with single space
      .replace(/[ \t]+/g, " ")
      // Replace multiple newlines with double newline (paragraph break)
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace from each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Remove any remaining leading/trailing whitespace
      .trim()
  );
}
