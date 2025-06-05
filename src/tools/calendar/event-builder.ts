export function buildEventPayload(params: any): any {
  const eventData: any = {
    subject: params.subject,
    start: {
      dateTime: params.start,
      timeZone: params.timeZone || 'UTC'
    },
    end: {
      dateTime: params.end,
      timeZone: params.timeZone || 'UTC'
    }
  };

  if (params.body) {
    eventData.body = {
      contentType: 'text',
      content: params.body
    };
  }

  if (params.location) {
    eventData.location = {
      displayName: params.location
    };
  }

  if (params.attendees?.length) {
    eventData.attendees = params.attendees.map((email: string) => ({
      emailAddress: { address: email, name: email },
      type: 'required'
    }));
  }

  if (params.isAllDay) {
    eventData.isAllDay = params.isAllDay;
  }

  if (params.importance) {
    eventData.importance = params.importance;
  }

  return eventData;
}