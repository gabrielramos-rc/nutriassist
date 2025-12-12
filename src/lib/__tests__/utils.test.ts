import { describe, it, expect } from "vitest";
import {
  cn,
  formatDate,
  formatDateTime,
  formatTime,
  formatWeekday,
  formatShortDate,
  isValidEmail,
  isValidPhone,
  formatPhone,
  truncate,
  capitalize,
} from "../utils";

describe("utils", () => {
  describe("cn (class name merger)", () => {
    it("merges class names", () => {
      const result = cn("px-4", "py-2");
      expect(result).toBe("px-4 py-2");
    });

    it("handles conditional classes", () => {
      const result = cn("base", true && "active", false && "hidden");
      expect(result).toBe("base active");
    });

    it("merges tailwind classes correctly", () => {
      const result = cn("px-4", "px-6");
      expect(result).toBe("px-6"); // tailwind-merge keeps the last
    });

    it("handles arrays and objects", () => {
      const result = cn(["px-4"], { "py-2": true, "py-4": false });
      expect(result).toBe("px-4 py-2");
    });
  });

  describe("formatDate", () => {
    it("formats ISO string to Brazilian date", () => {
      const result = formatDate("2025-01-15T10:30:00Z");
      expect(result).toBe("15/01/2025");
    });

    it("formats Date object", () => {
      const result = formatDate(new Date(2025, 0, 15)); // Jan 15, 2025
      expect(result).toBe("15/01/2025");
    });

    it("returns empty string for invalid date", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("");
    });
  });

  describe("formatDateTime", () => {
    it("formats ISO string to Brazilian datetime", () => {
      const result = formatDateTime("2025-01-15T10:30:00");
      expect(result).toBe("15/01/2025 às 10:30");
    });

    it("returns empty string for invalid date", () => {
      const result = formatDateTime("invalid");
      expect(result).toBe("");
    });
  });

  describe("formatTime", () => {
    it("formats time from ISO string", () => {
      const result = formatTime("2025-01-15T14:30:00");
      expect(result).toBe("14:30");
    });

    it("returns empty string for invalid date", () => {
      const result = formatTime("invalid");
      expect(result).toBe("");
    });
  });

  describe("formatWeekday", () => {
    it("formats weekday in Portuguese", () => {
      // January 15, 2025 is a Wednesday
      const result = formatWeekday("2025-01-15T10:00:00");
      expect(result).toBe("quarta-feira");
    });

    it("returns empty string for invalid date", () => {
      const result = formatWeekday("invalid");
      expect(result).toBe("");
    });
  });

  describe("formatShortDate", () => {
    it("formats short date in Portuguese", () => {
      const result = formatShortDate("2025-01-15T14:30:00");
      expect(result).toContain("15/01");
      expect(result).toContain("14:30");
    });

    it("returns empty string for invalid date", () => {
      const result = formatShortDate("invalid");
      expect(result).toBe("");
    });
  });

  describe("isValidEmail", () => {
    it("returns true for valid emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co")).toBe(true);
      expect(isValidEmail("user+tag@domain.com")).toBe(true);
    });

    it("returns false for invalid emails", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user @domain.com")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("returns true for valid Brazilian phones", () => {
      expect(isValidPhone("11999999999")).toBe(true); // 11 digits (mobile)
      expect(isValidPhone("1133334444")).toBe(true); // 10 digits (landline)
      expect(isValidPhone("(11) 99999-9999")).toBe(true); // Formatted
    });

    it("returns false for invalid phones", () => {
      expect(isValidPhone("")).toBe(false);
      expect(isValidPhone("123")).toBe(false);
      expect(isValidPhone("123456789012")).toBe(false); // Too long
    });
  });

  describe("formatPhone", () => {
    it("formats 11-digit mobile phone", () => {
      const result = formatPhone("11999999999");
      expect(result).toBe("(11) 99999-9999");
    });

    it("formats 10-digit landline phone", () => {
      const result = formatPhone("1133334444");
      expect(result).toBe("(11) 3333-4444");
    });

    it("handles already formatted phone", () => {
      const result = formatPhone("(11) 99999-9999");
      expect(result).toBe("(11) 99999-9999");
    });

    it("returns original for invalid length", () => {
      const result = formatPhone("123");
      expect(result).toBe("123");
    });
  });

  describe("truncate", () => {
    it("truncates long strings", () => {
      const result = truncate("This is a very long string", 15);
      expect(result).toBe("This is a ve...");
      expect(result.length).toBe(15);
    });

    it("does not truncate short strings", () => {
      const result = truncate("Short", 10);
      expect(result).toBe("Short");
    });

    it("handles exact length", () => {
      const result = truncate("Exact", 5);
      expect(result).toBe("Exact");
    });
  });

  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("lowercases rest of string", () => {
      expect(capitalize("hELLO")).toBe("Hello");
    });

    it("handles empty string", () => {
      expect(capitalize("")).toBe("");
    });

    it("handles single character", () => {
      expect(capitalize("a")).toBe("A");
    });
  });
});
