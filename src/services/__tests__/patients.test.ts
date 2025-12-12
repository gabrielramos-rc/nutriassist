import { describe, it, expect, vi, beforeEach } from "vitest";

// Create mock query builder that returns chainable methods
const createChainableMock = (finalData: unknown = null, finalError: unknown = null) => {
  const chainable: Record<string, unknown> = {};
  const methods = ["select", "insert", "update", "delete", "eq", "or", "order", "limit"];

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
  getPatient,
  getPatientByPhone,
  getPatientByEmail,
  getNutritionist,
  updateNutritionist,
  getPatientDietText,
  updatePatientDiet,
  getPatientsByNutritionist,
  createPatient,
  getPatientCount,
  updatePatient,
  deletePatient,
} from "../patients";

const mockPatient = {
  id: "patient-123",
  nutritionist_id: "nutri-123",
  name: "Test Patient",
  email: "patient@test.com",
  phone: "11999999999",
  diet_pdf_url: null,
  diet_extracted_text: "Sample diet text",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockNutritionist = {
  id: "nutri-123",
  name: "Test Nutritionist",
  email: "nutri@test.com",
  phone: "11888888888",
  business_hours: {},
  appointment_duration: 60,
  faq_responses: {},
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

describe("patients service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPatient", () => {
    it("returns patient when found", async () => {
      const query = createChainableMock(mockPatient);
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatient("patient-123");

      expect(result).toEqual(mockPatient);
      expect(mockFrom).toHaveBeenCalledWith("patients");
    });

    it("returns null when not found", async () => {
      const query = createChainableMock(null);
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatient("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getPatientByPhone", () => {
    it("returns patient when found by phone", async () => {
      const query = createChainableMock(mockPatient);
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientByPhone("(11) 99999-9999", "nutri-123");

      expect(result).toEqual(mockPatient);
      expect(mockFrom).toHaveBeenCalledWith("patients");
    });

    it("normalizes phone number before search", async () => {
      const query = createChainableMock(mockPatient);
      mockFrom.mockReturnValueOnce(query);

      await getPatientByPhone("(11) 99999-9999", "nutri-123");

      // Verify .or was called (handles normalized phone)
      expect(query.or).toHaveBeenCalled();
    });
  });

  describe("getPatientByEmail", () => {
    it("returns patient when found by email", async () => {
      const query = createChainableMock(mockPatient);
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientByEmail("patient@test.com", "nutri-123");

      expect(result).toEqual(mockPatient);
    });
  });

  describe("getNutritionist", () => {
    it("returns nutritionist when found", async () => {
      const query = createChainableMock(mockNutritionist);
      mockFrom.mockReturnValueOnce(query);

      const result = await getNutritionist("nutri-123");

      expect(result).toEqual(mockNutritionist);
      expect(mockFrom).toHaveBeenCalledWith("nutritionists");
    });

    it("returns null when not found", async () => {
      const query = createChainableMock(null);
      mockFrom.mockReturnValueOnce(query);

      const result = await getNutritionist("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("updateNutritionist", () => {
    it("updates and returns nutritionist", async () => {
      const updatedData = { ...mockNutritionist, name: "Updated Name" };
      const query = createChainableMock(updatedData);
      mockFrom.mockReturnValueOnce(query);

      const result = await updateNutritionist("nutri-123", { name: "Updated Name" });

      expect(result).toEqual(updatedData);
      expect(query.update).toHaveBeenCalled();
    });

    it("throws error on failure", async () => {
      const query = createChainableMock(null, { message: "Update failed" });
      mockFrom.mockReturnValueOnce(query);

      await expect(updateNutritionist("nutri-123", { name: "Test" })).rejects.toThrow(
        "Failed to update nutritionist"
      );
    });
  });

  describe("getPatientDietText", () => {
    it("returns diet text when present", async () => {
      const query = createChainableMock({ diet_extracted_text: "Sample diet" });
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientDietText("patient-123");

      expect(result).toBe("Sample diet");
    });

    it("returns null when no diet text", async () => {
      const query = createChainableMock({ diet_extracted_text: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientDietText("patient-123");

      expect(result).toBeNull();
    });
  });

  describe("updatePatientDiet", () => {
    it("updates diet successfully", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValueOnce(query);

      await expect(
        updatePatientDiet("patient-123", "https://storage.com/diet.pdf", "Diet text content")
      ).resolves.toBeUndefined();

      expect(query.update).toHaveBeenCalled();
    });

    it("throws error on failure", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: { message: "Update failed" } });
      mockFrom.mockReturnValueOnce(query);

      await expect(
        updatePatientDiet("patient-123", "https://storage.com/diet.pdf", "Diet text")
      ).rejects.toThrow("Failed to update patient diet");
    });
  });

  describe("getPatientsByNutritionist", () => {
    it("returns array of patients", async () => {
      const query = createChainableMock(null);
      query.order = vi.fn().mockResolvedValue({ data: [mockPatient], error: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientsByNutritionist("nutri-123");

      expect(result).toEqual([mockPatient]);
    });

    it("returns empty array on error", async () => {
      const query = createChainableMock(null);
      query.order = vi.fn().mockResolvedValue({ data: null, error: { message: "Error" } });
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientsByNutritionist("nutri-123");

      expect(result).toEqual([]);
    });
  });

  describe("createPatient", () => {
    it("creates and returns new patient", async () => {
      const query = createChainableMock(mockPatient);
      mockFrom.mockReturnValueOnce(query);

      const result = await createPatient("nutri-123", "Test Patient", "patient@test.com");

      expect(result).toEqual(mockPatient);
      expect(query.insert).toHaveBeenCalled();
    });

    it("throws error on failure", async () => {
      const query = createChainableMock(null, { message: "Insert failed" });
      mockFrom.mockReturnValueOnce(query);

      await expect(createPatient("nutri-123", "Test")).rejects.toThrow("Failed to create patient");
    });
  });

  describe("getPatientCount", () => {
    it("returns patient count", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockResolvedValue({ count: 5, error: null });
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientCount("nutri-123");

      expect(result).toBe(5);
    });

    it("returns 0 on error", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockResolvedValue({ count: null, error: { message: "Error" } });
      mockFrom.mockReturnValueOnce(query);

      const result = await getPatientCount("nutri-123");

      expect(result).toBe(0);
    });
  });

  describe("updatePatient", () => {
    it("updates and returns patient", async () => {
      const updatedPatient = { ...mockPatient, name: "Updated Name" };
      const query = createChainableMock(updatedPatient);
      mockFrom.mockReturnValueOnce(query);

      const result = await updatePatient("patient-123", { name: "Updated Name" });

      expect(result).toEqual(updatedPatient);
    });

    it("throws error on failure", async () => {
      const query = createChainableMock(null, { message: "Update failed" });
      mockFrom.mockReturnValueOnce(query);

      await expect(updatePatient("patient-123", { name: "Test" })).rejects.toThrow(
        "Failed to update patient"
      );
    });
  });

  describe("deletePatient", () => {
    it("deletes patient successfully", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: null });
      mockFrom.mockReturnValueOnce(query);

      await expect(deletePatient("patient-123")).resolves.toBeUndefined();

      expect(query.delete).toHaveBeenCalled();
    });

    it("throws error on failure", async () => {
      const query = createChainableMock(null);
      query.eq = vi.fn().mockReturnValue({ error: { message: "Delete failed" } });
      mockFrom.mockReturnValueOnce(query);

      await expect(deletePatient("patient-123")).rejects.toThrow("Failed to delete patient");
    });
  });
});
