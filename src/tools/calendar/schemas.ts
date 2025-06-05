import { z } from 'zod';

export const CreateEventSchema = z.object({
  subject: z.string().describe('Event subject'),
  body: z.string().optional().describe('Event body/description'),
  start: z.string().describe('Start time (ISO 8601 format)'),
  end: z.string().describe('End time (ISO 8601 format)'),
  timeZone: z.string().optional().describe('Time zone (e.g., "Pacific Standard Time")'),
  location: z.string().optional().describe('Event location'),
  attendees: z.array(z.string()).optional().describe('Attendee email addresses'),
  isAllDay: z.boolean().optional().describe('All-day event flag'),
  importance: z.enum(['low', 'normal', 'high']).optional().describe('Event importance')
});

export const ListEventsSchema = z.object({
  userId: z.string().optional().describe('User ID (defaults to current user)'),
  calendarId: z.string().optional().describe('Calendar ID (defaults to primary calendar)'),
  startTime: z.string().optional().describe('Start time filter (ISO 8601)'),
  endTime: z.string().optional().describe('End time filter (ISO 8601)'),
  filter: z.string().optional().describe('OData filter expression'),
  top: z.number().min(1).max(999).optional().describe('Number of events to return'),
  orderby: z.string().optional().describe('OData orderBy expression'),
  select: z.string().optional().describe('Comma-separated list of properties to select')
});

export const ManageCalendarSchema = z.object({
  userId: z.string().optional().describe('User ID (defaults to current user)'),
  operation: z.enum(['list', 'create', 'get', 'update', 'delete']).describe('Operation to perform'),
  calendarId: z.string().optional().describe('Calendar ID for get/update/delete operations'),
  name: z.string().optional().describe('Calendar name for create/update'),
  color: z.string().optional().describe('Calendar color for create/update')
});