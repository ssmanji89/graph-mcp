/**
 * Audit logging service for Microsoft Graph MCP Server
 * Implements comprehensive operation logging for security and compliance
 */

import { logger } from '@/services/logger';

/**
 * Audit event types
 */
export enum AuditEventType {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  GRAPH_API_CALL = 'GRAPH_API_CALL',
  MCP_TOOL_EXECUTION = 'MCP_TOOL_EXECUTION',
  RESOURCE_ACCESS = 'RESOURCE_ACCESS',
  ERROR = 'ERROR',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  RATE_LIMIT = 'RATE_LIMIT',
}

/**
 * Audit event severity levels
 */
export enum AuditSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

/**
 * Audit event status
 */
export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  PENDING = 'PENDING',
}

/**
 * Core audit event structure
 */
export interface AuditEvent {
  /** Unique event ID */
  eventId: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event type */
  eventType: AuditEventType;
  /** Event severity */
  severity: AuditSeverity;
  /** Event status */
  status: AuditStatus;
  /** Event description */
  description: string;
  /** User or service identifier */
  actor?: string;
  /** Target resource or operation */
  target?: string;
  /** Additional event details */
  details?: Record<string, unknown>;
  /** Request ID for correlation */
  requestId?: string;
  /** Session ID if applicable */
  sessionId?: string;
  /** Client IP address */
  clientIp?: string;
  /** User agent string */
  userAgent?: string;
}

/**
 * Authentication audit event
 */
export interface AuthenticationAuditEvent extends AuditEvent {
  eventType: AuditEventType.AUTHENTICATION;
  /** Authentication method used */
  authMethod: 'client_credentials' | 'authorization_code' | 'device_code';
  /** Client ID from app registration */
  clientId: string;
  /** Tenant ID */
  tenantId: string;
  /** Token scopes requested */
  scopes: string[];
  /** Authentication result code */
  resultCode?: string;
}

/**
 * Graph API call audit event
 */
export interface GraphApiAuditEvent extends AuditEvent {
  eventType: AuditEventType.GRAPH_API_CALL;
  /** HTTP method */
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** Graph API endpoint */
  endpoint: string;
  /** HTTP status code */
  statusCode: number;
  /** Response time in milliseconds */
  responseTime: number;
  /** Request size in bytes */
  requestSize?: number;
  /** Response size in bytes */
  responseSize?: number;
  /** Graph API request ID */
  graphRequestId?: string;
}

/**
 * MCP tool execution audit event
 */
export interface McpToolAuditEvent extends AuditEvent {
  eventType: AuditEventType.MCP_TOOL_EXECUTION;
  /** Tool name */
  toolName: string;
  /** Tool parameters */
  parameters: Record<string, unknown>;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Result size in bytes */
  resultSize?: number;
}

/**
 * Audit service implementation
 */
export class AuditService {
  private events: AuditEvent[] = [];
  private maxEvents: number;
  private retentionDays: number;

  constructor() {
    this.maxEvents = parseInt(process.env.AUDIT_MAX_EVENTS || '10000', 10);
    this.retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || '90', 10);
    
    logger.info('Audit service initialized', {
      maxEvents: this.maxEvents,
      retentionDays: this.retentionDays,
    });

    // Setup periodic cleanup
    this.setupPeriodicCleanup();
  }

  /**
   * Log authentication event
   */
  async logAuthentication(event: Omit<AuthenticationAuditEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const auditEvent: AuthenticationAuditEvent = {
      ...event,
      eventId: this.generateEventId(),
      timestamp: new Date(),
    };

    await this.logEvent(auditEvent);
  }

  /**
   * Log Graph API call event
   */
  async logGraphApiCall(event: Omit<GraphApiAuditEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const auditEvent: GraphApiAuditEvent = {
      ...event,
      eventId: this.generateEventId(),
      timestamp: new Date(),
    };

    await this.logEvent(auditEvent);
  }

  /**
   * Log MCP tool execution event
   */
  async logMcpToolExecution(event: Omit<McpToolAuditEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const auditEvent: McpToolAuditEvent = {
      ...event,
      eventId: this.generateEventId(),
      timestamp: new Date(),
    };

    await this.logEvent(auditEvent);
  }

  /**
   * Log resource access event
   */
  async logResourceAccess(
    resource: string,
    status: AuditStatus,
    details?: Record<string, unknown>
  ): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date(),
      eventType: AuditEventType.RESOURCE_ACCESS,
      severity: status === AuditStatus.SUCCESS ? AuditSeverity.INFO : AuditSeverity.WARNING,
      status,
      description: `Resource access: ${resource}`,
      target: resource,
      details,
    };

    await this.logEvent(auditEvent);
  }

  /**
   * Log error event
   */
  async logError(
    error: Error,
    context?: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date(),
      eventType: AuditEventType.ERROR,
      severity: AuditSeverity.ERROR,
      status: AuditStatus.FAILURE,
      description: `Error: ${error.message}`,
      target: context,
      details: {
        stack: error.stack,
        name: error.name,
        ...details,
      },
    };

    await this.logEvent(auditEvent);
  }

  /**
   * Log rate limiting event
   */
  async logRateLimit(
    endpoint: string,
    retryAfter?: number,
    details?: Record<string, unknown>
  ): Promise<void> {
    const auditEvent: AuditEvent = {
      eventId: this.generateEventId(),
      timestamp: new Date(),
      eventType: AuditEventType.RATE_LIMIT,
      severity: AuditSeverity.WARNING,
      status: AuditStatus.FAILURE,
      description: `Rate limit exceeded for endpoint: ${endpoint}`,
      target: endpoint,
      details: {
        retryAfter,
        ...details,
      },
    };

    await this.logEvent(auditEvent);
  }

  /**
   * Log generic audit event
   */
  async logEvent(event: AuditEvent): Promise<void> {
    try {
      // Store in memory (in production, would store in database)
      this.events.push(event);
      
      // Enforce size limit
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
      }

      // Log to structured logger
      logger.info('Audit event', {
        audit: true,
        eventId: event.eventId,
        eventType: event.eventType,
        severity: event.severity,
        status: event.status,
        description: event.description,
        actor: event.actor,
        target: event.target,
        requestId: event.requestId,
        sessionId: event.sessionId,
        details: event.details,
      });

      // Log critical events with higher visibility
      if (event.severity === AuditSeverity.CRITICAL) {
        logger.error('Critical audit event', { event });
      }
    } catch (error) {
      logger.error('Failed to log audit event:', error);
    }
  }

  /**
   * Query audit events
   */
  queryEvents(filter?: {
    eventType?: AuditEventType;
    severity?: AuditSeverity;
    status?: AuditStatus;
    actor?: string;
    target?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): AuditEvent[] {
    let filteredEvents = this.events;

    if (filter) {
      filteredEvents = this.events.filter(event => {
        if (filter.eventType && event.eventType !== filter.eventType) return false;
        if (filter.severity && event.severity !== filter.severity) return false;
        if (filter.status && event.status !== filter.status) return false;
        if (filter.actor && event.actor !== filter.actor) return false;
        if (filter.target && event.target !== filter.target) return false;
        if (filter.startTime && event.timestamp < filter.startTime) return false;
        if (filter.endTime && event.timestamp > filter.endTime) return false;
        return true;
      });
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filter?.limit) {
      filteredEvents = filteredEvents.slice(0, filter.limit);
    }

    return filteredEvents;
  }

  /**
   * Get audit statistics
   */
  getStats(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    eventsByStatus: Record<string, number>;
    oldestEvent?: Date;
    newestEvent?: Date;
  } {
    const eventsByType: Record<string, number> = {};
    const eventsBySeverity: Record<string, number> = {};
    const eventsByStatus: Record<string, number> = {};

    let oldestEvent: Date | undefined;
    let newestEvent: Date | undefined;

    for (const event of this.events) {
      // Count by type
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      
      // Count by severity
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      
      // Count by status
      eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;

      // Track date range
      if (!oldestEvent || event.timestamp < oldestEvent) {
        oldestEvent = event.timestamp;
      }
      if (!newestEvent || event.timestamp > newestEvent) {
        newestEvent = event.timestamp;
      }
    }

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      eventsByStatus,
      oldestEvent,
      newestEvent,
    };
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup periodic cleanup of old events
   */
  private setupPeriodicCleanup(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60 * 60 * 1000);
  }

  /**
   * Cleanup events older than retention period
   */
  private cleanupOldEvents(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

    const initialCount = this.events.length;
    this.events = this.events.filter(event => event.timestamp >= cutoffDate);
    const cleanedCount = initialCount - this.events.length;

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} old audit events older than ${this.retentionDays} days`);
    }
  }

  /**
   * Export audit events for external storage
   */
  exportEvents(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = [
        'eventId', 'timestamp', 'eventType', 'severity', 'status',
        'description', 'actor', 'target', 'requestId'
      ];
      
      const csvRows = [
        headers.join(','),
        ...this.events.map(event => [
          event.eventId,
          event.timestamp.toISOString(),
          event.eventType,
          event.severity,
          event.status,
          `"${event.description.replace(/"/g, '""')}"`,
          event.actor || '',
          event.target || '',
          event.requestId || ''
        ].join(','))
      ];

      return csvRows.join('\n');
    }

    return JSON.stringify(this.events, null, 2);
  }
} 