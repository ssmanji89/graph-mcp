import { logger } from '../../services/logging-service';
import { AuditEvent, AuditFilter } from './audit-types';

export class AuditCore {
  private events: AuditEvent[] = [];

  async initialize(): Promise<void> {
    logger.info('Audit core initialized');
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

    return filtered;
  }

  async getTotalEvents(): Promise<number> {
    return this.events.length;
  }

  async getUniqueUsers(): Promise<number> {
    return new Set(this.events.map(e => e.userId)).size;
  }
}