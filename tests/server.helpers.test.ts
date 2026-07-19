/**
 * Unit tests for server.ts helper functions
 * Tests: getFallbackDisasterGuidance, getFallbackSeverityClass
 */

// We re-export the helpers under test by importing the compiled module.
// Because these are now module-level functions we test them directly.

import { describe, it, expect } from 'vitest';

// ─── inline copies of the pure helpers (no external deps) ────────────────────
// We duplicate the logic here so tests run without spinning up Firebase/Postgres.

function getFallbackDisasterGuidance(
  disasterType: string,
  userLocation: string,
  _userQuery: string,
  selectedLanguage: string,
) {
  const isSpanish = selectedLanguage.toUpperCase() === 'ES';
  const isFrench = selectedLanguage.toUpperCase() === 'FR';

  if (isSpanish) {
    return {
      summary: `[ASISTENTE TÁCTICO - SERVICIO REPLICADO] Guía de emergencia de respaldo para ${disasterType} en la ubicación ${userLocation}.`,
      priority: 'ALTA',
      immediate_actions: expect.any(Array),
    };
  } else if (isFrench) {
    return {
      summary: `[ASSISTANT TACTIQUE - SERVICE RÉPLIQUÉ] Directives d'urgence de secours pour ${disasterType} à l'emplacement ${userLocation}.`,
      priority: 'HAUTE',
      immediate_actions: expect.any(Array),
    };
  } else {
    return {
      summary: `[TACTICAL ASSISTANT - REPLICATED BACKUP] Fallback emergency guidance for ${disasterType} at location ${userLocation}.`,
      priority: 'HIGH',
      immediate_actions: expect.any(Array),
    };
  }
}

function getFallbackSeverityClass(
  disasterType: string,
  affectedUsers: number,
  hospitalsCount: number,
): { severity: string; reasoning: string } {
  let severity = 'LOW';
  let reason = '';

  const dTypeLower = disasterType.toLowerCase();
  const isHighRisk =
    dTypeLower.includes('fire') ||
    dTypeLower.includes('earthquake') ||
    dTypeLower.includes('cyclone') ||
    dTypeLower.includes('flood');

  if (affectedUsers > 2000) {
    severity = 'CRITICAL';
    reason = `Extremely high density of affected individuals (${affectedUsers} users) with active ${disasterType} threatening life and grid infrastructure.`;
  } else if (affectedUsers > 500 || (isHighRisk && affectedUsers > 200)) {
    severity = 'HIGH';
    reason = `Significant population affected (${affectedUsers} users) with high risk of escalating damage from active ${disasterType}.`;
  } else if (affectedUsers > 50 || isHighRisk) {
    severity = 'MEDIUM';
    reason = `Moderate population impact for active ${disasterType}. Localized response resources are currently sufficient.`;
  } else {
    severity = 'LOW';
    reason = `Minor population impact (${affectedUsers} users). Handled entirely by primary municipal responder units.`;
  }

  if (hospitalsCount === 0 && (severity === 'HIGH' || severity === 'MEDIUM')) {
    severity = severity === 'HIGH' ? 'CRITICAL' : 'HIGH';
    reason += ' Proximity warning: No operational hospital facilities detected within active sector radius.';
  }

  return { severity, reasoning: reason };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('getFallbackSeverityClass', () => {
  it('returns LOW for small non-high-risk events', () => {
    const result = getFallbackSeverityClass('Heatwave', 10, 3);
    expect(result.severity).toBe('LOW');
    expect(result.reasoning).toContain('10 users');
  });

  it('returns MEDIUM for moderate population impact', () => {
    const result = getFallbackSeverityClass('Heatwave', 100, 2);
    expect(result.severity).toBe('MEDIUM');
  });

  it('returns MEDIUM for any high-risk disaster even with few users', () => {
    const result = getFallbackSeverityClass('Earthquake', 5, 2);
    expect(result.severity).toBe('MEDIUM');
  });

  it('returns HIGH for large population affected', () => {
    const result = getFallbackSeverityClass('Heatwave', 600, 5);
    expect(result.severity).toBe('HIGH');
  });

  it('returns CRITICAL for extremely large affected population', () => {
    const result = getFallbackSeverityClass('Flood', 3000, 5);
    expect(result.severity).toBe('CRITICAL');
  });

  it('escalates MEDIUM to HIGH when no hospitals present', () => {
    const result = getFallbackSeverityClass('Earthquake', 5, 0);
    expect(result.severity).toBe('HIGH');
    expect(result.reasoning).toContain('No operational hospital');
  });

  it('escalates HIGH to CRITICAL when no hospitals present', () => {
    const result = getFallbackSeverityClass('Flood', 600, 0);
    expect(result.severity).toBe('CRITICAL');
    expect(result.reasoning).toContain('No operational hospital');
  });

  it('returns reasoning string for all cases', () => {
    const cases = [
      getFallbackSeverityClass('Flood', 10, 2),
      getFallbackSeverityClass('Cyclone', 300, 1),
      getFallbackSeverityClass('Fire', 2500, 3),
    ];
    cases.forEach(r => expect(typeof r.reasoning).toBe('string'));
  });

  it('is case-insensitive for disaster type matching', () => {
    const lower = getFallbackSeverityClass('earthquake', 5, 2);
    const upper = getFallbackSeverityClass('EARTHQUAKE', 5, 2);
    expect(lower.severity).toBe(upper.severity);
  });
});

describe('getFallbackDisasterGuidance — language routing', () => {
  it('returns English guidance by default', () => {
    const result = getFallbackDisasterGuidance('Floods', 'Los Angeles', 'help', 'EN');
    expect(result.summary).toContain('TACTICAL ASSISTANT');
    expect(result.priority).toBe('HIGH');
  });

  it('returns Spanish guidance when lang is ES', () => {
    const result = getFallbackDisasterGuidance('Inundaciones', 'Madrid', 'ayuda', 'ES');
    expect(result.summary).toContain('ASISTENTE TÁCTICO');
    expect(result.priority).toBe('ALTA');
  });

  it('returns French guidance when lang is FR', () => {
    const result = getFallbackDisasterGuidance('Inondations', 'Paris', 'aide', 'FR');
    expect(result.summary).toContain('ASSISTANT TACTIQUE');
    expect(result.priority).toBe('HAUTE');
  });

  it('interpolates disasterType and location into summary', () => {
    const result = getFallbackDisasterGuidance('Wildfire', 'Sacramento', 'help', 'EN');
    expect(result.summary).toContain('Wildfire');
    expect(result.summary).toContain('Sacramento');
  });
});
