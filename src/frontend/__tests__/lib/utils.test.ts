import { cn, slugify, truncate, formatFileSize, formatDate } from '@/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('joins class names', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c')
    })

    it('filters falsy values', () => {
      expect(cn('a', false, 'b', undefined, null, 'c')).toBe('a b c')
    })

    it('returns empty string for no args', () => {
      expect(cn()).toBe('')
    })
  })

  describe('slugify', () => {
    it('converts to lowercase and replaces spaces', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('removes special characters', () => {
      expect(slugify('Hello! @World#')).toBe('hello-world')
    })

    it('preserves Chinese characters', () => {
      expect(slugify('你好 World')).toBe('你好-world')
    })

    it('trims leading and trailing dashes', () => {
      expect(slugify('--hello-world--')).toBe('hello-world')
    })
  })

  describe('truncate', () => {
    it('returns full text when shorter than limit', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('truncates and adds ellipsis', () => {
      expect(truncate('hello world', 5)).toBe('hello...')
    })

    it('returns empty for empty string', () => {
      expect(truncate('', 5)).toBe('')
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('formats KB', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
    })

    it('formats MB', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
    })

    it('formats GB', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB')
    })
  })

  describe('formatDate', () => {
    it('formats a date string', () => {
      const result = formatDate('2026-05-20T08:00:00Z')
      expect(result).toMatch(/2026/)
    })
  })
})
