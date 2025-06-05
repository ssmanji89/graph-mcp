import { RiskFactor } from './intelligence-types';

/**
 * Generate mitigation strategies
 */
export function generateMitigationStrategies(riskFactors: RiskFactor[]): string[] {
  const strategies: string[] = [];
  
  riskFactors.forEach(factor => {
    switch (factor.type) {
      case 'high_privilege':
        strategies.push('Review and reduce high-privilege permissions');
        break;
      case 'unused_permissions':
        strategies.push('Remove unused permissions');
        break;
      case 'role_sprawl':
        strategies.push('Consolidate role assignments');
        break;
      case 'permission_conflict':
        strategies.push('Resolve conflicting permissions');
        break;
      default:
        strategies.push('Review user access patterns');
    }
  });

  // Remove duplicates
  return [...new Set(strategies)];
}