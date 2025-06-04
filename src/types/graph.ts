/**
 * Microsoft Graph API type definitions
 */

/**
 * Graph API user object
 */
export interface GraphUser {
  /** Unique identifier for the user */
  id: string;
  /** User's display name */
  displayName: string;
  /** User's principal name (email) */
  userPrincipalName: string;
  /** Given name */
  givenName?: string;
  /** Surname */
  surname?: string;
  /** Job title */
  jobTitle?: string;
  /** Department */
  department?: string;
  /** Office location */
  officeLocation?: string;
  /** Account enabled status */
  accountEnabled?: boolean;
}

/**
 * Graph API group object
 */
export interface GraphGroup {
  /** Unique identifier for the group */
  id: string;
  /** Group display name */
  displayName: string;
  /** Group description */
  description?: string;
  /** Group mail address */
  mail?: string;
  /** Group type */
  groupTypes?: string[];
  /** Security enabled */
  securityEnabled?: boolean;
  /** Mail enabled */
  mailEnabled?: boolean;
}

/**
 * Graph API paginated response
 */
export interface GraphPagedResponse<T> {
  /** Response value array */
  value: T[];
  /** Next link for pagination */
  '@odata.nextLink'?: string;
  /** Count of items */
  '@odata.count'?: number;
}

/**
 * Graph API query parameters
 */
export interface GraphQueryParams {
  /** Select specific properties */
  $select?: string;
  /** Filter results */
  $filter?: string;
  /** Order results */
  $orderby?: string;
  /** Expand related entities */
  $expand?: string;
  /** Top N results */
  $top?: number;
  /** Skip N results */
  $skip?: number;
  /** Include count */
  $count?: boolean;
} 