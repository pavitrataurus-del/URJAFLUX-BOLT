import { useState, useCallback } from 'react';
import { ParsedDocument } from '../types/document.types';
import { ParsingPipelineResult } from '../types/pipeline.types';
import { documentParserService } from '../services/DocumentParserService';

export function useDocumentParser() {
  const [isParsing, setIsParsing] = useState(false);
  const [lastResult, setLastResult] = useState<ParsingPipelineResult | null>(null);
  const [parsedDocuments, setParsedDocuments] = useState<readonly ParsedDocument[]>(() =>
    documentParserService.getAllParsedDocuments()
  );

  const parseFile = useCallback(
    async (file: File, packageHash: string, extension: string): Promise<ParsingPipelineResult> => {
      setIsParsing(true);
      try {
        const res = await documentParserService.parsePackage(
          file,
          file.name,
          packageHash,
          extension
        );
        setLastResult(res);
        setParsedDocuments(documentParserService.getAllParsedDocuments());
        return res;
      } finally {
        setIsParsing(false);
      }
    },
    []
  );

  return {
    isParsing,
    lastResult,
    parsedDocuments,
    parseFile,
    getParsedDocument: documentParserService.getParsedDocument.bind(documentParserService)
  };
}
