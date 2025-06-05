import { z } from 'zod';

export const ComplianceReportRequestSchema = z.object({
  moduleId: z.string(),
  format: z.enum(['json', 'pdf', 'csv']).optional().default('json'),
  includeRecommendations: z.boolean().optional().default(true),
  includeEvidence: z.boolean().optional().default(false)
});

export const ComplianceModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  requirementCount: z.number()
});

export const ComplianceOverviewSchema = z.object({
  compliant: z.number(),
  nonCompliant: z.number(), 
  partial: z.number(),
  total: z.number(),
  lastUpdated: z.string()
});

export type ComplianceReportRequest = z.infer<typeof ComplianceReportRequestSchema>;
export type ComplianceModuleInfo = z.infer<typeof ComplianceModuleSchema>;
export type ComplianceOverview = z.infer<typeof ComplianceOverviewSchema>;