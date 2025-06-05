import { RiskFactor } from './intelligence-types';

/**
 * Identify specific risk factors
 */
export function identifyRiskFactors(analysis: any): RiskFactor[] {
  const factors: RiskFactor[] = [];

  if (analysis.riskScore > 0.7) {
    factors.push({
      type: 'high_privilege',
      severity: 'high',
      description: 'User has high-privilege permissions',
      impact: 'Potential for significant system damage if compromised'
    });
  }

  if (analysis.unusedPermissions.length > 5) {
    factors.push({
      type: 'unused_permissions',
      severity: 'medium',
      description: 'User has many unused permissions',
      impact: 'Increased attack surface'
    });
  }

  if (analysis.totalRoles > 5) {
    factors.push({
      type: 'role_sprawl',
      severity: 'medium',
      description: 'User has excessive role assignments',
      impact: 'Complex permission management and potential conflicts'
    });
  }

  return factors;
}

/**
 * Calculate overall risk level
 */
export function calculateOverallRisk(riskFactors: RiskFactor[]): 'low' | 'medium' | 'high' | 'critical' {
  if (riskFactors.some(f => f.severity === 'critical')) return 'critical';
  if (riskFactors.some(f => f.severity === 'high')) return 'high';
  if (riskFactors.some(f => f.severity === 'medium')) return 'medium';
  return 'low';
}