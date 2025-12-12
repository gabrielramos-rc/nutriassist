import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Nutritionist, BusinessHours } from '@/types'

// Supabase mocking is complex due to chainable API
// These tests focus on the behavior that can be tested with simpler mocking

// Create mock query builder that returns chainable methods
const createChainableMock = (finalData: unknown = null, finalError: unknown = null) => {
  const chainable: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'eq', 'neq', 'gte', 'lte', 'order', 'limit']

  methods.forEach(method => {
    chainable[method] = vi.fn(() => chainable)
  })

  chainable.single = vi.fn().mockResolvedValue({ data: finalData, error: finalError })

  return chainable
}

const { mockFrom } = vi.hoisted(() => {
  const mockFrom = vi.fn()
  return { mockFrom }
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import { createAppointment, cancelAppointment } from '../appointments'

const mockNutritionistId = '11111111-1111-1111-1111-111111111111'

describe('appointments service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAppointment', () => {
    it('fails when slot is already booked', async () => {
      // First query finds existing appointment
      const checkQuery = createChainableMock({ id: 'existing-apt' })
      mockFrom.mockReturnValueOnce(checkQuery)

      const result = await createAppointment(
        mockNutritionistId,
        'patient-1',
        '2025-01-15T09:00:00Z',
        60
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('já foi reservado')
    })
  })

  describe('cancelAppointment', () => {
    it('cancels appointment successfully', async () => {
      const updateQuery = createChainableMock(null, null)
      // Override eq to return final result immediately
      updateQuery.eq = vi.fn().mockReturnValue({ error: null })
      mockFrom.mockReturnValueOnce(updateQuery)

      const result = await cancelAppointment('apt-123')

      expect(result.success).toBe(true)
      expect(mockFrom).toHaveBeenCalledWith('appointments')
    })

    it('handles cancellation errors', async () => {
      const updateQuery = createChainableMock(null, null)
      updateQuery.eq = vi.fn().mockReturnValue({ error: { message: 'Not found' } })
      mockFrom.mockReturnValueOnce(updateQuery)

      const result = await cancelAppointment('apt-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Not found')
    })
  })
})

