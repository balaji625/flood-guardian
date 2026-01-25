import { FloodRiskData, RiskLevel } from '@/types/flood';

// Weights for flood risk calculation (must sum to 1)
const WEIGHTS = {
  rainfall: 0.45,
  elevation: 0.30,
  historical: 0.25,
};

// Thresholds
const RAINFALL_THRESHOLDS = {
  light: 10, // mm/hr
  moderate: 25,
  heavy: 50,
  extreme: 100,
};

const ELEVATION_THRESHOLDS = {
  veryLow: 5, // meters above sea level
  low: 15,
  moderate: 30,
  high: 50,
};

/**
 * Calculate flood risk score based on multiple factors
 * @param rainfall - Current rainfall in mm/hr
 * @param elevation - Elevation in meters above sea level
 * @param historicalProbability - Historical flood probability (0-1)
 * @returns FloodRiskData object with score and breakdown
 */
export function calculateFloodRisk(
  rainfall: number,
  elevation: number,
  historicalProbability: number
): FloodRiskData {
  // Rainfall contribution (0-100)
  let rainfallScore = 0;
  if (rainfall >= RAINFALL_THRESHOLDS.extreme) {
    rainfallScore = 100;
  } else if (rainfall >= RAINFALL_THRESHOLDS.heavy) {
    rainfallScore = 70 + (30 * (rainfall - RAINFALL_THRESHOLDS.heavy) / (RAINFALL_THRESHOLDS.extreme - RAINFALL_THRESHOLDS.heavy));
  } else if (rainfall >= RAINFALL_THRESHOLDS.moderate) {
    rainfallScore = 40 + (30 * (rainfall - RAINFALL_THRESHOLDS.moderate) / (RAINFALL_THRESHOLDS.heavy - RAINFALL_THRESHOLDS.moderate));
  } else if (rainfall >= RAINFALL_THRESHOLDS.light) {
    rainfallScore = 10 + (30 * (rainfall - RAINFALL_THRESHOLDS.light) / (RAINFALL_THRESHOLDS.moderate - RAINFALL_THRESHOLDS.light));
  } else {
    rainfallScore = rainfall / RAINFALL_THRESHOLDS.light * 10;
  }

  // Elevation contribution (0-100) - lower elevation = higher risk
  let elevationScore = 0;
  if (elevation <= ELEVATION_THRESHOLDS.veryLow) {
    elevationScore = 100;
  } else if (elevation <= ELEVATION_THRESHOLDS.low) {
    elevationScore = 70 + (30 * (ELEVATION_THRESHOLDS.low - elevation) / (ELEVATION_THRESHOLDS.low - ELEVATION_THRESHOLDS.veryLow));
  } else if (elevation <= ELEVATION_THRESHOLDS.moderate) {
    elevationScore = 40 + (30 * (ELEVATION_THRESHOLDS.moderate - elevation) / (ELEVATION_THRESHOLDS.moderate - ELEVATION_THRESHOLDS.low));
  } else if (elevation <= ELEVATION_THRESHOLDS.high) {
    elevationScore = 10 + (30 * (ELEVATION_THRESHOLDS.high - elevation) / (ELEVATION_THRESHOLDS.high - ELEVATION_THRESHOLDS.moderate));
  } else {
    elevationScore = Math.max(0, 10 - (elevation - ELEVATION_THRESHOLDS.high) / 10);
  }

  // Historical contribution (0-100)
  const historicalScore = historicalProbability * 100;

  // Weighted final score
  const rainfallContribution = rainfallScore * WEIGHTS.rainfall;
  const elevationContribution = elevationScore * WEIGHTS.elevation;
  const historicalContribution = historicalScore * WEIGHTS.historical;

  const totalScore = Math.round(rainfallContribution + elevationContribution + historicalContribution);

  // Determine risk level
  let level: RiskLevel;
  if (totalScore >= 71) {
    level = 'high';
  } else if (totalScore >= 31) {
    level = 'medium';
  } else {
    level = 'low';
  }

  // Override to critical if extreme conditions
  if (totalScore >= 85 || rainfall >= RAINFALL_THRESHOLDS.extreme) {
    level = 'critical';
  }

  return {
    score: totalScore,
    level,
    rainfallContribution: Math.round(rainfallContribution),
    elevationContribution: Math.round(elevationContribution),
    historicalContribution: Math.round(historicalContribution),
    rainfall,
    elevation,
    historicalProbability,
  };
}

/**
 * Get risk level color
 */
export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'hsl(142, 75%, 40%)';
    case 'medium':
      return 'hsl(38, 95%, 50%)';
    case 'high':
      return 'hsl(0, 85%, 55%)';
    case 'critical':
      return 'hsl(0, 90%, 35%)';
    default:
      return 'hsl(215, 20%, 55%)';
  }
}

/**
 * Get risk level label
 */
export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'LOW RISK';
    case 'medium':
      return 'MEDIUM RISK';
    case 'high':
      return 'HIGH RISK';
    case 'critical':
      return 'CRITICAL';
    default:
      return 'UNKNOWN';
  }
}

/**
 * Get safety instructions based on risk level
 */
export function getSafetyInstructions(level: RiskLevel): string[] {
  switch (level) {
    case 'low':
      return [
        'Stay informed about weather updates',
        'Keep emergency supplies ready',
        'Know your evacuation routes',
      ];
    case 'medium':
      return [
        'Avoid low-lying areas',
        'Keep emergency kit accessible',
        'Stay away from drainage channels',
        'Monitor local news for updates',
        'Charge your mobile devices',
      ];
    case 'high':
      return [
        'MOVE TO HIGHER GROUND immediately if in low-lying area',
        'Do not attempt to cross flooded roads',
        'Keep emergency contacts handy',
        'Prepare for possible evacuation',
        'Secure important documents',
        'Stock food and drinking water',
      ];
    case 'critical':
      return [
        '⚠️ EVACUATE IMMEDIATELY to designated shelter',
        'Call emergency services if trapped',
        'Do not enter flood water under any circumstances',
        'Help elderly and disabled neighbors',
        'Turn off electricity and gas if safe',
        'Take only essential items',
      ];
    default:
      return ['Stay alert and monitor updates'];
  }
}
