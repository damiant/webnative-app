import { describe, it, expect } from 'vitest';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  describe('isValidUrl', () => {
    it('should validate apple.co as a valid URL', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('apple.com');
      expect(result).toBe(true);
    });

    it('should validate apple.co with https protocol', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('https://apple.com');
      expect(result).toBe(true);
    });

    it('should validate apple.co with http protocol', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('http://apple.com');
      expect(result).toBe(true);
    });

    it('should validate localhost', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('localhost');
      expect(result).toBe(true);
    });

    it('should validate localhost with port', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('localhost:8080');
      expect(result).toBe(true);
    });

    it('should validate IP addresses', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('192.168.1.1');
      expect(result).toBe(true);
    });

    it('should validate IP addresses with port', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('192.168.1.1:3000');
      expect(result).toBe(true);
    });

    it('should validate full URLs with paths', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('https://example.com/path/to/page');
      expect(result).toBe(true);
    });

    it('should validate URLs with query strings', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('https://example.com?param=value');
      expect(result).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('not a url');
      expect(result).toBe(false);
    });

    it('should reject empty strings', () => {
      const service = new HistoryService();
      const result = service.isValidUrl('');
      expect(result).toBe(false);
    });
  });
});
