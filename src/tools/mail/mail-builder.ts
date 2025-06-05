export function buildMailPayload(params: any): any {
  const message: any = {
    subject: params.subject,
    body: {
      contentType: params.bodyType || 'Text',
      content: params.body
    },
    toRecipients: params.toRecipients.map((email: string) => ({
      emailAddress: { address: email }
    }))
  };

  if (params.ccRecipients?.length) {
    message.ccRecipients = params.ccRecipients.map((email: string) => ({
      emailAddress: { address: email }
    }));
  }

  if (params.bccRecipients?.length) {
    message.bccRecipients = params.bccRecipients.map((email: string) => ({
      emailAddress: { address: email }
    }));
  }

  if (params.importance) {
    message.importance = params.importance;
  }

  return {
    message,
    saveToSentItems: params.saveToSentItems ?? true
  };
}