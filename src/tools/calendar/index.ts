// Calendar management tools exports
export { createCreateEventTool, executeCreateEvent } from './create-event.js';
export { createListEventsTool, executeListEvents } from './list-events.js';

// Export all calendar tools as an array for easy registration
export const calendarTools = [
  'createCreateEventTool',
  'createListEventsTool'
] as const;

// Export all calendar executors as an object for tool execution mapping
export const calendarExecutors = {
  'create-event': 'executeCreateEvent',
  'list-events': 'executeListEvents'
} as const;