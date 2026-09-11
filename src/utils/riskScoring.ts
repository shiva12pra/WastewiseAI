// ==========================================
// WasteWiseAI — Risk Score Calculator
// ==========================================

import { Bin } from '../types';

/**
 * Computes a risk score (0–100) for a bin.
 *
 * Factors (simulation):
 *  - Current fill level (weight: 0.30)
 *  - Predicted fill at 6h (weight: 0.25)
 *  - Fill rate (weight: 0.20)
 *  - Urgency — time to threshold (weight: 0.15)
 *  - Area priority (weight: 0.10)
 */
export function calculateRiskScore(bin: Bin, fillRateMultiplier = 1): number {
  const adjustedRate = bin.fillRate * fillRateMultiplier;
  const adjustedPredicted6h = Math.min(100, bin.fillLevel + adjustedRate * 6);

  // Current fill (0-100 → 0-30)
  const fillScore = (bin.fillLevel / 100) * 30;

  // Predicted fill at 6h (0-100 → 0-25)
  const predScore = (adjustedPredicted6h / 100) * 25;

  // Fill rate (0–6%/hr mapped to 0–20)
  const rateScore = Math.min(1, adjustedRate / 6) * 20;

  // Time to threshold — smaller = more urgent (0-15)
  const timeToThreshold = bin.fillLevel >= bin.criticalThreshold
    ? 0
    : (bin.criticalThreshold - bin.fillLevel) / Math.max(adjustedRate, 0.1);
  const urgencyScore = Math.max(0, 15 - (timeToThreshold / 24) * 15);

  // Area priority (1-5 → 2-10)
  const areaScore = (bin.areaPriority / 5) * 10;

  return Math.round(Math.min(100, fillScore + predScore + rateScore + urgencyScore + areaScore));
}

export function getPriority(riskScore: number): 'critical' | 'high' | 'medium' | 'normal' {
  if (riskScore >= 80) return 'critical';
  if (riskScore >= 60) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'normal';
}

export function getTimeToThreshold(bin: Bin, fillRateMultiplier = 1): number {
  const adjustedRate = bin.fillRate * fillRateMultiplier;
  if (bin.fillLevel >= bin.criticalThreshold) return 0;
  if (adjustedRate <= 0) return 999;
  return parseFloat(((bin.criticalThreshold - bin.fillLevel) / adjustedRate).toFixed(1));
}

export function generatePredictionData(bin: Bin, fillRateMultiplier = 1) {
  const adjustedRate = bin.fillRate * fillRateMultiplier;
  const points = [];
  for (let h = 0; h <= 24; h += 2) {
    const predicted = Math.min(100, bin.fillLevel + adjustedRate * h);
    points.push({
      hour: h,
      label: h === 0 ? 'Now' : `${h}h`,
      fill: h === 0 ? bin.fillLevel : predicted,
      predicted: predicted,
      threshold: bin.criticalThreshold,
    });
  }
  return points;
}

export function getExplanation(bin: Bin, fillRateMultiplier = 1): string[] {
  const reasons: string[] = [];
  const adjustedRate = bin.fillRate * fillRateMultiplier;
  const timeToThreshold = getTimeToThreshold(bin, fillRateMultiplier);

  if (bin.fillLevel >= 85) {
    reasons.push(`Current fill is critically high at ${bin.fillLevel}%`);
  } else if (bin.fillLevel >= 70) {
    reasons.push(`Current fill level is elevated at ${bin.fillLevel}%`);
  }

  if (adjustedRate >= 3) {
    reasons.push(`Filling rate is high at +${adjustedRate.toFixed(1)}%/hr`);
  } else if (adjustedRate >= 2) {
    reasons.push(`Filling rate is moderate at +${adjustedRate.toFixed(1)}%/hr`);
  }

  if (timeToThreshold <= 2 && timeToThreshold > 0) {
    reasons.push(`Predicted to reach overflow within ${timeToThreshold} hours`);
  } else if (timeToThreshold === 0) {
    reasons.push('Already above critical threshold — immediate attention needed');
  }

  if (bin.areaPriority >= 4) {
    reasons.push(`Located in a high-demand ${bin.zoneType} area`);
  }

  const predicted6h = Math.min(100, bin.fillLevel + adjustedRate * 6);
  if (predicted6h >= 90) {
    reasons.push(`Predicted to reach ${Math.round(predicted6h)}% in 6 hours`);
  }

  if (reasons.length === 0) {
    reasons.push('Standard monitoring — no immediate risk detected');
  }

  return reasons;
}

export function applyScenarioToBins(
  bins: Bin[],
  fillRateMultiplier: number
): Bin[] {
  return bins.map(bin => {
    const adjustedRate = bin.fillRate * fillRateMultiplier;
    const newRiskScore = calculateRiskScore(bin, fillRateMultiplier);
    const newPriority = getPriority(newRiskScore);
    return {
      ...bin,
      fillRate: parseFloat(adjustedRate.toFixed(1)),
      predictedFill6h: Math.min(100, Math.round(bin.fillLevel + adjustedRate * 6)),
      predictedFill12h: Math.min(100, Math.round(bin.fillLevel + adjustedRate * 12)),
      predictedFill24h: Math.min(100, Math.round(bin.fillLevel + adjustedRate * 24)),
      riskScore: newRiskScore,
      priority: newPriority,
    };
  });
}
