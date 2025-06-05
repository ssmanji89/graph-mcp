import { Router } from 'express';
import { z } from 'zod';
import { AuditCore } from './audit-core';
import { AuditDashboard } from './audit-dashboard';
import { logger } from '../../services/logging-service';
import { AuditEvent, AuditFilter, AuditMetrics } from './audit-types';

// Validation schemas
const AuditFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  tenantId: z.string().optional()
});

/**
 * Audit REST API Router
 */
export class AuditAPIRouter {
  private router: Router;
  private auditCore: AuditCore;
  private auditDashboard: AuditDashboard;

  constructor(auditCore: AuditCore, auditDashboard: AuditDashboard) {
    this.router = Router();
    this.auditCore = auditCore;
    this.auditDashboard = auditDashboard;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Event endpoints
    this.router.get('/events', this.getEvents.bind(this));
    this.router.post('/events', this.createEvent.bind(this));
    this.router.get('/events/:eventId', this.getEvent.bind(this));

    // Metrics endpoints
    this.router.get('/metrics', this.getMetrics.bind(this));
    this.router.get('/metrics/summary', this.getMetricsSummary.bind(this));

    // Dashboard endpoints
    this.router.get('/dashboard/config', this.getDashboardConfig.bind(this));
    this.router.put('/dashboard/config', this.updateDashboardConfig.bind(this));

    // Analytics endpoints
    this.router.get('/analytics/trends', this.getTrends.bind(this));
    this.router.get('/analytics/risk', this.getRiskAssessment.bind(this));
  }  /**
   * Get audit events with filtering
   */
  private async getEvents(req: any, res: any): Promise<void> {
    try {
      const validation = AuditFilterSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid filter parameters',
          details: validation.error.issues
        });
      }

      const filter: AuditFilter = {
        ...validation.data,
        startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
        endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined
      };

      const events = await this.auditDashboard.getEvents(filter);
      
      logger.info('Retrieved audit events', { count: events.length, filter });
      res.json({
        success: true,
        data: events,
        meta: {
          total: events.length,
          filter,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Failed to retrieve audit events', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit events'
      });
    }
  }

  /**
   * Get audit metrics
   */
  private async getMetrics(req: any, res: any): Promise<void> {
    try {
      const validation = AuditFilterSchema.safeParse(req.query);
      const filter: AuditFilter = validation.success ? {
        ...validation.data,
        startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
        endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined
      } : {};

      const metrics = await this.auditDashboard.getMetrics(filter);
      
      logger.info('Retrieved audit metrics', { metrics });
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.error('Failed to retrieve audit metrics', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve audit metrics'
      });
    }
  }

  getRouter(): Router {
    return this.router;
  }
}