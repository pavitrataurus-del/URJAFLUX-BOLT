export interface BaseCollaborationEntity {
  id: string; // UUID
  version: number;
  metadata: Record<string, any>;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean; // Soft Delete
  permissionMetadata?: {
    rolesAllowed: string[];
    usersAllowed: string[];
    isPublic: boolean;
  };
}

export type WorkspaceRole = 'ADMIN' | 'PROJECT_MANAGER' | 'ENGINEER' | 'END_USER';

export interface Workspace extends BaseCollaborationEntity {
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  settings: {
    allowExternalMembers: boolean;
    requireApprovalForFiles: boolean;
    defaultRole: WorkspaceRole;
  };
}

export interface WorkspaceMember extends BaseCollaborationEntity {
  workspaceId: string;
  userId: string;
  email: string;
  role: WorkspaceRole;
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}

export interface Team extends BaseCollaborationEntity {
  name: string;
  description: string;
  workspaceId: string;
  memberIds: string[]; // references users
}

export interface Conversation extends BaseCollaborationEntity {
  workspaceId: string;
  title: string;
  type: 'DIRECT' | 'CHANNEL' | 'SYSTEM';
  participants: string[]; // references user IDs
  lastMessageAt: string;
}

export interface DiscussionThread extends BaseCollaborationEntity {
  workspaceId: string;
  title: string;
  status: 'OPEN' | 'RESOLVED' | 'LOCKED';
  resolvedBy?: string;
  resolvedAt?: string;
  lockedBy?: string;
  lockedAt?: string;
  resourceRef?: {
    domain: 'DOMAIN-009' | 'DOMAIN-010' | 'DOMAIN-011' | 'DOMAIN-012' | 'DOMAIN-013' | 'GENERAL';
    resourceId: string; // references specific report ID, CAD object, Vision AI image ID, etc.
    label: string; // display name of the resource (e.g. "Structural Drawing v3")
  };
}

export interface Comment extends BaseCollaborationEntity {
  threadId: string;
  content: string; // Markdown supported rich-text
  attachments: Attachment[];
  reactions: Reaction[];
  mentions: Mention[];
}

export interface Reply extends BaseCollaborationEntity {
  commentId: string;
  content: string;
  mentions: Mention[];
  reactions: Reaction[];
}

export interface Mention {
  id: string; // UUID
  type: 'USER' | 'TEAM' | 'ROLE' | 'CONTEXT';
  targetId: string; // specific user ID, team ID, or role string
  label: string; // e.g. "@ProjectManager" or "@john_doe"
  startIndex: number;
  length: number;
}

export interface Attachment {
  id: string; // UUID
  name: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  userName: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  domain: string; // e.g., 'DOMAIN-009'..'DOMAIN-014'
  type: 'COMMENT' | 'REVIEW' | 'APPROVAL' | 'UPLOAD' | 'WORKFLOW_EVENT' | 'SPATIAL_CHANGE' | 'VISION_REVIEW' | 'REPORT_GENERATION';
  userId: string;
  userName: string;
  description: string;
  resourceId: string;
  resourceType: string;
}

export interface Presence {
  userId: string;
  userName: string;
  role: WorkspaceRole;
  status: 'ONLINE' | 'AWAY' | 'OFFLINE';
  lastSeen: string;
  activeView?: string; // which part of the system they are viewing
  cursorCoordinates?: {
    x: number;
    y: number;
  };
}

export interface SharedSession extends BaseCollaborationEntity {
  workspaceId: string;
  title: string;
  hostId: string;
  activeParticipantIds: string[];
  resourceRef: {
    type: 'CAD_EDIT' | 'VISION_REVIEW' | 'REPORT_COLLABORATION';
    id: string;
  };
}

export interface Annotation extends BaseCollaborationEntity {
  workspaceId: string;
  resourceRef: {
    domain: 'DOMAIN-010' | 'DOMAIN-011' | 'DOMAIN-012' | 'DOMAIN-013';
    resourceId: string;
    resourceType: 'REPORT' | 'FLOOR_PLAN' | 'VISION_IMAGE' | 'CAD_OBJECT' | 'WORKFLOW_STEP' | 'INSPECTION_RESULT';
    label: string;
  };
  geometry?: {
    type: 'POINT' | 'RECTANGLE' | 'POLYGON';
    coordinates: number[][]; // spatial or layout pixels coordinates
  };
  content: string; // feedback text
  resolved: boolean;
}
