import { logger } from '../../services/logging-service';
import { AuditEvent, AuditFilter, AuditMetrics } from './audit-types';

export class AuditDashboard {
  private events: AuditEvent[] = [];

  async initialize(): Promise<void> {
    logger.info('Audit dashboard initialized');
  }

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.events.push(auditEvent);
    logger.info('Audit event logged', { eventId: auditEvent.id });
  }

  async getEvents(filter: AuditFilter = {}): Promise<AuditEvent[]> {
    let filtered = this.events;

    if (filter.startDate) {
      filtered = filtered.filter(e => e.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(e => e.timestamp <= filter.endDate!);
    }
    if (filter.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }
    if (filter.action) {
      filtered = filtered.filter(e => e.action === filter.action);
    }
    if (filter.resource) {
      filtered = filtered.filter(e => e.resource === filter.resource);
    }
    if (filter.tenantId) {
      filtered = filtered.filter(e => e.tenantId === filter.tenantId);
    }

    return filtered;
  }

  async getMetrics(filter: AuditFilter = {}): Promise<AuditMetrics> {
    const events = await this.getEvents(filter);
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    
    const actionCounts = new Map<string, number>();
    events.forEach(e => {
      actionCounts.set(e.action, (actionCounts.get(e.action) || 0) + 1);
    });

    const topActions = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: events.length,
      uniqueUsers,
      topActions,
      riskEvents: 0, // TODO: Implement risk detection
      complianceScore: 100 // TODO: Calculate based on compliance requirements
    };
  }
}