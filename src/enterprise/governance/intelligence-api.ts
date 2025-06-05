import { Router } from 'express';
import { PermissionIntelligence } from './permission-intelligence';
import { RiskAssessmentService } from './risk-assessment';
import { 
  analyzeUserHandler, 
  getOverPrivilegedHandler, 
  getInsightsHandler, 
  assessRiskHandler 
} from './intelligence-handlers';

/**
 * Permission Intelligence API Router
 */
export class IntelligenceAPIRouter {
  private router: Router;
  private intelligence: PermissionIntelligence;
  private riskAssessment: RiskAssessmentService;

  constructor(intelligence: PermissionIntelligence, riskAssessment: RiskAssessmentService) {
    this.router = Router();
    this.intelligence = intelligence;
    this.riskAssessment = riskAssessment;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/analyze/:userId', (req, res) => 
      analyzeUserHandler(req, res, this.intelligence));
    this.router.get('/over-privileged', (req, res) => 
      getOverPrivilegedHandler(req, res, this.intelligence));
    this.router.get('/insights', (req, res) => 
      getInsightsHandler(req, res, this.intelligence));
    this.router.get('/risk/:userId', (req, res) => 
      assessRiskHandler(req, res, this.riskAssessment));
  }

  getRouter(): Router {
    return this.router;
  }
}