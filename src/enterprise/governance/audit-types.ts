export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  tenantId?: string;
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  tenantId?: string;
}

export interface AuditMetrics {
  totalEvents: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  riskEvents: number;
  complianceScore: number;
}

export interface AuditDashboardConfig {
  refreshInterval: number;
  retentionDays: number;
  alertThresholds: {
    riskEvents: number;
    failedLogins: number;
    dataAccess: number;
  };
  enableRealTime: boolean;
}