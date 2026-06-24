import { ActivityLogModel } from '../models/activity-log.model';
import { mapActivityType } from './response-mappers';

export async function getEntityActivities(entityType: string, entityId: string, limit = 20) {
  const logs = await ActivityLogModel.find({ entityType, entityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return logs.map((log) => ({
    id: log._id.toString(),
    title: log.title,
    description: log.description ?? '',
    timestamp: log.createdAt.toISOString(),
    type: mapActivityType(log.entityType),
    action: log.action,
    actorName: log.actorName,
  }));
}