import { Router } from 'express';
import { ComplianceCore } from './compliance-core';
import { generateComplianceReportHandler, getModulesHandler, getOverviewHandler } from './compliance-handlers';

/**
 * Compliance REST API Router
 */
export class ComplianceAPIRouter {
  private router: Router;
  private complianceCore: ComplianceCore;

  constructor(complianceCore: ComplianceCore) {
    this.router = Router();
    this.complianceCore = complianceCore;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/modules', (req, res) => getModulesHandler(req, res));
    this.router.post('/reports/generate', (req, res) => 
      generateComplianceReportHandler(req, res, this.complianceCore));
    this.router.get('/status/overview', (req, res) => getOverviewHandler(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}