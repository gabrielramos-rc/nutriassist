import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase mocking is complex due to chainable API
// These tests focus on the behavior that can be tested with simpler mocking

// Create mock query builder that returns chainable methods
const createChainableMock = (finalData: unknown = null, finalError: unknown = null) => {
  const chainable: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "eq", "neq", "gte", "lte", "order", "limit"];

  methods.forEach((method) => {
    chainable[method] = vi.fn(() => chainable);
  });

  chainable.single = vi.fn().mockResolvedValue({ data: finalData, error: finalError });

  return chainable;
};

const { mockFrom } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return { mockFrom };
});

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}));

import {
  createAppointment,
  cancelAppointment,
  getNextAppointment,
  getAppointment,
  rescheduleAppointment,
  listAppointments,
  getTodayAppointmentCount,
  getTodayAppointments,
  updateAppointmentStatus,
  updateAppointmentNotes,
} from "../appointments";

const mockNutritionistId = "11111111-1111-1111-1111-111111111111";
const mockPatientId = "22222222-2222-2222-2222-222222222222";

const mockAppointment = {
  id: "apt-123",
  nutritionist_id: mockNutritionistId,
  patient_id: mockPatientId,
  starts_at: "2025-01-15T09:00:00Z",
  ends_at: "2025-01-15T10:00:00Z",
  status: "scheduled",
  notes: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("appointments service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAppointment", () => {
    it("fails when slot is already booked", async () => {
      // First query finds existing appointment
      const checkQuery = createChainableMock({ id: "existing-apt" });
      mockFrom.mockReturnValueOnce(checkQuery);

      const result = await createAppointment(
        mockNutritionistId,
        "patient-1",
        "2025-01-15T09:00:00Z",
        60
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("já foi reservado");
    });

    it("creates appointment successfully when slot is free", async () => {
      // First query: no existing appointment
      const checkQuery = createChainableMock(null);
      mockFrom.mockReturnValueOnce(checkQuery);

      // Second query: insert returns new appointment
      const insertQuery = createChainableMock(mockAppointment);
      mockFrom.mockReturnValueOnce(insertQuery);

      const result = await createAppointment(
        mockNutritionistId,
        mockPatientId,
        "2025-01-15T09:00:00Z",
        60
      );

      expect(result.success).toBe(true);
      expect(result.appointment).toEqual(mockAppointment);
    });

    it("handles insert errors", async () => {
      const checkQuery = createChainableMock(null);
      mockFrom.mockReturnValueOnce(checkQuery);

      const insertQuery = createChainableMock(null, { message: "Insert failed" });
      mockFrom.mockReturnValueOnce(insertQuery);

      const result = await createAppointment(
        mockNutritionistId,
        mockPatientId,
        "2025-01-15T09:00:00Z",
        60
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Insert failed");
    });
  });

  describe("cancelAppointment", () => {
    it("cancels appointment successfully", async () => {
      const updateQuery = createChainableMock(null, null);
      updateQuery.eq = vi.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValueOnce(updateQuery);

      const result = await cancelAppointment("apt-123");

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith("appointments");
    });

    it("handles cancellation errors", async () => {
      const updateQuery = createChainableMock(null, null);
      updateQuery.eq = vi.fn().mockReturnValue({ error: { message: "Not found" } });
      mockFrom.mockReturnValueOnce(updateQuery);

      const result = await cancelAppointment("apt-123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Not found");
    });
  });

  describe("getNextAppointment", () => {
    it("returns next scheduled appointment", async () => {
      const query = createChainableMock(mockAppointment);
      mockFrom.mockReturnValueOnce(query);

      const result = await getNextAppointment(mockPatientId, mockNutritionistId);

      expect(result).toEqual(mockAppointment);
      expect(mockFrom).toHaveBeenCalledWith("appointments");
    });

    it("returns null when no upcoming appointment", async () => {
      const query = createChainableMock(null);
      mockFrom.mockReturnValueOnce(query);

      const result = await getNextAppointment(mockPatientId, mockNutritionistId);

      expect(result).toBeNull();
    });
  });

  describe("getAppointment", () => {
    it("returns appointment by ID", async () => {
      const query = createChainableMock(mockAppointment);
      mockFrom.mockReturnValueOnce(query);

      const result = await getAppointment("apt-123");

      expect(result).toEqual(mockAppointment);
    });

    it("returns null when not found", async () => {
      const query = createChainableMock(null);
      mockFrom.mockReturnValueOnce(query);

      const result = await getAppointment("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("rescheduleAppointment", () => {
    it("reschedules successfully when new slot is available", async () => {
      // First: getAppointment returns existing
      const getQuery = createChainableMock(mockAppointment);
      mockFrom.mockReturnValueOnce(getQuery);

      // Second: check for conflicts returns null
      const conflictQuery = createChainableMock(null);
      mockFrom.mockReturnValueOnce(conflictQuery);

      // Third: update returns updated appointment
      const updatedAppointment = { ...mockAppointment, starts_at: "2025-01-16T10:00:00Z" };
      const updateQuery = createChainableMock(updatedAppointment);
      mockFrom.mockReturnValueOnce(updateQuery);

      const result = await rescheduleAppointment("apt-123", "2025-01-16T10:00:00Z", 60);

      expect(result.success).toBe(true);
      expect(result.appointment?.starts_at).toBe("2025-01-16T10:00:00Z");
    });

    it("fails when appointment not found", async () => {
      const getQuery = createChainableMock(null);
      mockFrom.mockReturnValueOnce(getQuery);

      const result = await rescheduleAppointment("nonexistent", "2025-01-16T10:00:00Z", 60);

      expect(result.success).toBe(false);
      expect(result.error).toContain("não encontrada");
    });

    it("fails when new slot is already booked", async () => {
      const getQuery = createChainableMock(mockAppointment);
      mockFrom.mockReturnValueOnce(getQuery);

      const conflictQuery = createChainableMock({ id: "other-apt" });
      mockFrom.mockReturnValueOnce(conflictQuery);

      const result = await rescheduleAppointment("apt-123", "2025-01-16T10:00:00Z", 60);

      expect(result.success).toBe(false);
      expect(result.error).toContain("já foi reservado");
    });
  });

  describe("listAppointments", () => {
    it("returns appointments for nutritionist", async () => {
      const query = createChainableMock(null);
      query.order = vi.fn().mockResolvedValue({ data: [mockAppointment] });
      mockFrom.mockReturnValueOnce(query);

      const result = await listAppointments(mockNutritionistId);

      expect(result).toEqual([mockAppointment]);
    });

    it("returns empty array when no appointments", async () => {
      const query = createChainableMock(null);
      query.order = vi.fn().mockResolvedValue({ data: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await listAppointments(mockNutritionistId);

      expect(result).toEqual([]);
    });
  });

  describe("getTodayAppointmentCount", () => {
    it("returns count of today appointments", async () => {
      const query = createChainableMock(null);
      query.lte = vi.fn().mockResolvedValue({ count: 3, error: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await getTodayAppointmentCount(mockNutritionistId);

      expect(result).toBe(3);
    });

    it("returns 0 on error", async () => {
      const query = createChainableMock(null);
      query.lte = vi.fn().mockResolvedValue({ count: null, error: { message: "Error" } });
      mockFrom.mockReturnValueOnce(query);

      const result = await getTodayAppointmentCount(mockNutritionistId);

      expect(result).toBe(0);
    });
  });

  describe("getTodayAppointments", () => {
    it("returns today appointments", async () => {
      const query = createChainableMock(null);
      query.order = vi.fn().mockResolvedValue({ data: [mockAppointment], error: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await getTodayAppointments(mockNutritionistId);

      expect(result).toEqual([mockAppointment]);
    });

    it("returns empty array on error", async () => {
      const query = createChainableMock(null);
      query.order = vi.fn().mockResolvedValue({ data: null, error: { message: "Error" } });
      mockFrom.mockReturnValueOnce(query);

      const result = await getTodayAppointments(mockNutritionistId);

      expect(result).toEqual([]);
    });
  });

  describe("updateAppointmentStatus", () => {
    it("updates status successfully", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await updateAppointmentStatus("apt-123", "completed");

      expect(result.success).toBe(true);
    });

    it("handles errors", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: { message: "Update failed" } });
      mockFrom.mockReturnValueOnce(query);

      const result = await updateAppointmentStatus("apt-123", "completed");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });

  describe("updateAppointmentNotes", () => {
    it("updates notes successfully", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await updateAppointmentNotes("apt-123", "Patient feedback");

      expect(result.success).toBe(true);
    });

    it("handles errors", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: { message: "Update failed" } });
      mockFrom.mockReturnValueOnce(query);

      const result = await updateAppointmentNotes("apt-123", "Notes");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Update failed");
    });
  });
});
