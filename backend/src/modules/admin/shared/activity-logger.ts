import type { Types } from 'mongoose';

import { ActivityLogModel } from '../models/activity-log.model';

export interface LogActivityInput {
  actorId?: Types.ObjectId | string;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  await ActivityLogModel.create({
    actorId: input.actorId,
    actorName: input.actorName,
    actorType: 'admin',
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    title: input.title,
    description: input.description,
    metadata: input.metadata,
    ipAddress: input.ipAddress,
  });
}
