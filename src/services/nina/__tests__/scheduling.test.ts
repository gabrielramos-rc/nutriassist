import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Nutritionist, Patient, AppointmentSlot } from '@/types'

// Create hoisted mock functions (available at module evaluation time)
const {
  mockGetAvailableSlots,
  mockGetNextAppointment,
  mockCreateAppointment,
  mockCancelAppointment,
  mockClassifySubIntent,
} = vi.hoisted(() => ({
  mockGetAvailableSlots: vi.fn(),
  mockGetNextAppointment: vi.fn(),
  mockCreateAppointment: vi.fn(),
  mockCancelAppointment: vi.fn(),
  mockClassifySubIntent: vi.fn(),
}))

// Mock dependencies before imports
vi.mock('@/services/appointments', () => ({
  getAvailableSlots: mockGetAvailableSlots,
  getNextAppointment: mockGetNextAppointment,
  createAppointment: mockCreateAppointment,
  cancelAppointment: mockCancelAppointment,
}))

vi.mock('./intents', () => ({
  classifySchedulingSubIntent: mockClassifySubIntent,
}))

vi.mock('@/lib/openrouter', () => ({
  complete: vi.fn().mockResolvedValue('off_topic'),
}))

import { handleScheduling, processSlotSelection, processCancellation } from '../scheduling'

const mockNutritionist: Nutritionist = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Dra. Ana',
  email: 'ana@test.com',
  phone: '11999999999',
  business_hours: {},
  appointment_duration: 60,
  faq_responses: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockPatient: Patient = {
  id: '22222222-2222-2222-2222-222222222222',
  nutritionist_id: mockNutritionist.id,
  name: 'João Silva',
  email: 'joao@test.com',
  phone: '11888888888',
  diet_extracted_text: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockSlots: AppointmentSlot[] = [
  { startsAt: '2025-01-15T09:00:00Z', endsAt: '2025-01-15T10:00:00Z', formatted: 'qua 15/01 às 09:00' },
  { startsAt: '2025-01-15T10:00:00Z', endsAt: '2025-01-15T11:00:00Z', formatted: 'qua 15/01 às 10:00' },
  { startsAt: '2025-01-16T09:00:00Z', endsAt: '2025-01-16T10:00:00Z', formatted: 'qui 16/01 às 09:00' },
]

describe('handleScheduling', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('book sub-intent', () => {
    beforeEach(() => {
      mockClassifySubIntent.mockResolvedValue('book')
    })

    it('returns available slots when booking', async () => {
      mockGetAvailableSlots.mockResolvedValue(mockSlots)

      const result = await handleScheduling('Quero agendar', mockNutritionist, mockPatient)

      expect(result.intent).toBe('scheduling')
      expect(result.subIntent).toBe('book')
      expect(result.content).toContain('horários disponíveis')
      expect(result.metadata?.availableSlots).toHaveLength(3)
    })

    it('triggers handoff when no slots available', async () => {
      mockGetAvailableSlots.mockResolvedValue([])

      const result = await handleScheduling('Quero agendar', mockNutritionist, mockPatient)

      expect(result.intent).toBe('scheduling')
      expect(result.content).toContain('não encontrei horários')
      expect(result.metadata?.requiresHandoff).toBe(true)
      expect(result.metadata?.handoffReason).toBe('no_available_slots')
    })
  })

  describe('check_availability sub-intent', () => {
    beforeEach(() => {
      mockClassifySubIntent.mockResolvedValue('check_availability')
    })

    it('returns available slots', async () => {
      mockGetAvailableSlots.mockResolvedValue(mockSlots)

      const result = await handleScheduling('Quais horários disponíveis?', mockNutritionist, mockPatient)

      expect(result.intent).toBe('scheduling')
      expect(result.subIntent).toBe('check_availability')
      expect(result.content).toContain('horários disponíveis')
    })

    it('returns empty message when no slots', async () => {
      mockGetAvailableSlots.mockResolvedValue([])

      const result = await handleScheduling('Quais horários?', mockNutritionist, mockPatient)

      expect(result.content).toContain('não encontrei horários disponíveis')
    })
  })

  describe('reschedule sub-intent', () => {
    beforeEach(() => {
      mockClassifySubIntent.mockResolvedValue('reschedule')
    })

    it('requires patient identification', async () => {
      const result = await handleScheduling('Quero remarcar', mockNutritionist, null)

      expect(result.content).toContain('preciso identificar você')
      expect(result.metadata?.requiresHandoff).toBe(true)
      expect(result.metadata?.handoffReason).toBe('patient_not_identified')
    })

    it('returns no appointment found when patient has none', async () => {
      mockGetNextAppointment.mockResolvedValue(null)

      const result = await handleScheduling('Quero remarcar', mockNutritionist, mockPatient)

      expect(result.content).toContain('Não encontrei nenhuma consulta')
    })

    it('shows current appointment and available slots', async () => {
      mockGetNextAppointment.mockResolvedValue({
        id: 'apt-123',
        nutritionist_id: mockNutritionist.id,
        patient_id: mockPatient.id,
        starts_at: '2025-01-20T09:00:00Z',
        ends_at: '2025-01-20T10:00:00Z',
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      mockGetAvailableSlots.mockResolvedValue(mockSlots)

      const result = await handleScheduling('Quero remarcar', mockNutritionist, mockPatient)

      expect(result.content).toContain('atual está marcada')
      expect(result.content).toContain('remarcar')
      expect(result.metadata?.currentAppointmentId).toBe('apt-123')
      expect(result.metadata?.availableSlots).toHaveLength(3)
    })
  })

  describe('cancel sub-intent', () => {
    beforeEach(() => {
      mockClassifySubIntent.mockResolvedValue('cancel')
    })

    it('requires patient identification', async () => {
      const result = await handleScheduling('Quero cancelar', mockNutritionist, null)

      expect(result.content).toContain('preciso identificar você')
      expect(result.metadata?.requiresHandoff).toBe(true)
    })

    it('returns no appointment found when patient has none', async () => {
      mockGetNextAppointment.mockResolvedValue(null)

      const result = await handleScheduling('Quero cancelar', mockNutritionist, mockPatient)

      expect(result.content).toContain('Não encontrei nenhuma consulta')
    })

    it('asks for cancellation confirmation', async () => {
      mockGetNextAppointment.mockResolvedValue({
        id: 'apt-123',
        nutritionist_id: mockNutritionist.id,
        patient_id: mockPatient.id,
        starts_at: '2025-01-20T09:00:00Z',
        ends_at: '2025-01-20T10:00:00Z',
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      const result = await handleScheduling('Quero cancelar', mockNutritionist, mockPatient)

      expect(result.content).toContain('certeza que deseja cancelar')
      expect(result.content).toContain('"sim"')
      expect(result.metadata?.currentAppointmentId).toBe('apt-123')
    })
  })
})

describe('processSlotSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates appointment for valid selection', async () => {
    mockCreateAppointment.mockResolvedValue({
      success: true,
      appointment: {
        id: 'apt-new',
        nutritionist_id: mockNutritionist.id,
        patient_id: mockPatient.id,
        starts_at: mockSlots[0].startsAt,
        ends_at: mockSlots[0].endsAt,
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    })

    const result = await processSlotSelection('1', mockSlots, mockNutritionist, mockPatient)

    expect(mockCreateAppointment).toHaveBeenCalledWith(
      mockNutritionist.id,
      mockPatient.id,
      mockSlots[0].startsAt,
      60
    )
    expect(result.content).toContain('agendada')
  })

  it('returns error for invalid selection (NaN)', async () => {
    const result = await processSlotSelection('abc', mockSlots, mockNutritionist, mockPatient)

    expect(result.content).toContain('Não entendi sua escolha')
    expect(result.metadata?.availableSlots).toEqual(mockSlots)
  })

  it('returns error for out of range selection', async () => {
    const result = await processSlotSelection('99', mockSlots, mockNutritionist, mockPatient)

    expect(result.content).toContain('Não entendi sua escolha')
    expect(result.content).toContain('1-3')
  })

  it('returns error for zero selection', async () => {
    const result = await processSlotSelection('0', mockSlots, mockNutritionist, mockPatient)

    expect(result.content).toContain('Não entendi sua escolha')
  })

  it('handles booking failure', async () => {
    mockCreateAppointment.mockResolvedValue({
      success: false,
      error: 'Este horário já foi reservado',
    })

    const result = await processSlotSelection('1', mockSlots, mockNutritionist, mockPatient)

    expect(result.content).toContain('Este horário já foi reservado')
    expect(result.content).toContain('escolha outro horário')
    // Should remove the failed slot from available slots
    expect(result.metadata?.availableSlots).toHaveLength(2)
  })
})

describe('processCancellation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('cancels appointment successfully', async () => {
    mockCancelAppointment.mockResolvedValue({ success: true })

    const result = await processCancellation('apt-123')

    expect(mockCancelAppointment).toHaveBeenCalledWith('apt-123')
    expect(result.content).toContain('cancelada')
    expect(result.subIntent).toBe('cancel')
  })

  it('handles cancellation failure', async () => {
    mockCancelAppointment.mockResolvedValue({
      success: false,
      error: 'Consulta não encontrada',
    })

    const result = await processCancellation('apt-123')

    expect(result.content).toContain('Não consegui cancelar')
    expect(result.content).toContain('Consulta não encontrada')
  })
})
