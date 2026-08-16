import { ParserConfig } from '../types/parser.types';

export const DEFAULT_PARSER_CONFIG: ParserConfig = {
  maxPages: 1000,
  maxMemoryMB: 512,
  maxParsingTimeMs: 30000,
  supportedLanguages: ['en', 'hi', 'sa', 'mr', 'gu', 'ta', 'te'],
  extractImages: true,
  extractTables: true,
  extractBookmarks: true,
  futureOcrEnabled: false
};
