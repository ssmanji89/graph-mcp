/**
 * Health Monitoring System
 */

import { logger } from './logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, ServiceHealth>;
  timestamp: string;
}

export interface ServiceHealth {
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

export class HealthMonitor {
  private services: Map<string, () => Promise<ServiceHealth>> = new Map();
  private lastHealthCheck: HealthStatus | null = null;

  constructor() {
    this.registerDefaultServices();
  }

  private registerDefaultServices(): void {
    this.services.set('authentication', this.checkAuthentication.bind(this));
    this.services.set('graphClient', this.checkGraphClient.bind(this));
    this.services.set('cache', this.checkCache.bind(this));
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const services: Record<string, ServiceHealth> = {};
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [name, checkFunction] of this.services) {
      try {
        services[name] = await checkFunction();
        if (services[name].status === 'down') {
          overallStatus = 'unhealthy';
        } else if (services[name].status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        services[name] = {
          status: 'down',
          lastCheck: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        overallStatus = 'unhealthy';
      }
    }

    this.lastHealthCheck = {
      status: overallStatus,
      services,
      timestamp: new Date().toISOString()
    };

    return this.lastHealthCheck;
  }