import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateResponse, chat, complete, _resetModelIndex, _getCurrentModel } from '../openrouter'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('openrouter', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    _resetModelIndex()
    process.env = {
      ...originalEnv,
      OPENROUTER_API_KEY: 'test-api-key',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('generateResponse', () => {
    it('throws error when API key is missing', async () => {
      delete process.env.OPENROUTER_API_KEY

      await expect(
        generateResponse([{ role: 'user', content: 'hello' }])
      ).rejects.toThrow('OPENROUTER_API_KEY is not configured')
    })

    it('makes successful API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello there!' } }],
        }),
      })

      const result = await generateResponse([{ role: 'user', content: 'hello' }])

      expect(result).toBe('Hello there!')
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      )
    })

    it('uses explicit model when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await generateResponse(
        [{ role: 'user', content: 'hello' }],
        { model: 'custom-model' }
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.model).toBe('custom-model')
    })

    it('respects temperature and maxTokens options', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await generateResponse(
        [{ role: 'user', content: 'hello' }],
        { temperature: 0.5, maxTokens: 500 }
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.temperature).toBe(0.5)
      expect(callBody.max_tokens).toBe(500)
    })

    it('throws error when no choices returned', async () => {
      // Mock all fallback models to return empty choices
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [] }),
      })

      await expect(
        generateResponse([{ role: 'user', content: 'hello' }], { model: 'explicit-model', retries: 1 })
      ).rejects.toThrow('No response from OpenRouter')
    })
  })

  describe('fallback chain', () => {
    it('tries next model on 404 error', async () => {
      // First model returns 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Model not found',
      })

      // Second model succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'success from fallback' } }],
        }),
      })

      const result = await generateResponse([{ role: 'user', content: 'hello' }])

      expect(result).toBe('success from fallback')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('retries with exponential backoff on non-404 errors', async () => {
      // First attempt fails with 500
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Server error',
      })

      // Second attempt succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'success after retry' } }],
        }),
      })

      const result = await generateResponse([{ role: 'user', content: 'hello' }])

      expect(result).toBe('success after retry')
    })

    it('throws error when all models fail', async () => {
      // All calls return 404
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Model not found',
      })

      await expect(
        generateResponse([{ role: 'user', content: 'hello' }])
      ).rejects.toThrow('OpenRouter API error')
    })

    it('uses custom fallback chain from env', async () => {
      process.env.OPENROUTER_FALLBACK_MODELS = 'model-a,model-b'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await generateResponse([{ role: 'user', content: 'hello' }])

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.model).toBe('model-a')
    })

    it('uses preferred model from env as first in chain', async () => {
      process.env.OPENROUTER_MODEL = 'preferred-model'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await generateResponse([{ role: 'user', content: 'hello' }])

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.model).toBe('preferred-model')
    })
  })

  describe('chat helper', () => {
    it('builds messages with system prompt', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await chat('You are a helpful assistant', 'Hello')

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.messages).toHaveLength(2)
      expect(callBody.messages[0]).toEqual({
        role: 'system',
        content: 'You are a helpful assistant',
      })
      expect(callBody.messages[1]).toEqual({
        role: 'user',
        content: 'Hello',
      })
    })

    it('includes conversation history', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'response' } }],
        }),
      })

      await chat(
        'System prompt',
        'New message',
        [
          { role: 'user', content: 'Previous question' },
          { role: 'assistant', content: 'Previous answer' },
        ]
      )

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.messages).toHaveLength(4)
    })
  })

  describe('complete helper', () => {
    it('makes single-turn completion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'completion' } }],
        }),
      })

      const result = await complete('Write a haiku')

      expect(result).toBe('completion')
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(callBody.messages).toHaveLength(1)
      expect(callBody.messages[0].role).toBe('user')
    })
  })

  describe('test helpers', () => {
    it('_resetModelIndex resets to first model', () => {
      _resetModelIndex()
      const model = _getCurrentModel()
      expect(model).toBe('deepseek/deepseek-chat-v3-0324:free')
    })
  })
})
