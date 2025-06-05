import { GraphClient } from '../../graph/graph-client.js';
import { AuditService } from '../../services/audit-service.js';
import { SendMailSchema } from './schemas.js';
import { buildMailPayload } from './mail-builder.js';

const auditService = AuditService.getInstance();

export async function executeSendMailImpl(graphClient: GraphClient, args: unknown): Promise<any> {
  const startTime = Date.now();
  
  try {
    const params = SendMailSchema.parse(args);
    const mailPayload = buildMailPayload(params);
    
    await graphClient.api('/me/sendMail').post(mailPayload);
    
    auditService.logEvent({
      operation: 'send-mail', resource: 'mail/sendMail', parameters: { 
        subject: params.subject, 
        recipientCount: params.toRecipients.length,
        hasCc: !!params.ccRecipients?.length,
        hasBcc: !!params.bccRecipients?.length
      },
      success: true, responseTime: Date.now() - startTime
    });
    
    return { 
      success: true, 
      message: 'Email sent successfully', 
      responseTime: Date.now() - startTime 
    };
  } catch (error) {
    auditService.logEvent({
      operation: 'send-mail', resource: 'mail/sendMail', parameters: args, success: false,
      error: error instanceof Error ? error.message : 'Unknown error', responseTime: Date.now() - startTime
    });
    throw error;
  }
}