import ActivityLog from '../models/ActivityLog.model.js';

export const logActivity = async (data) => {
  try {
    const {
      user,
      action,
      entityType,
      entityId,
      description,
      actor,
      targetUser = null,
      metadata = {}
    } = data;

    await ActivityLog.create({
      user,
      action,
      entityType,
      entityId,
      description,
      actor,
      targetUser,
      metadata: {
        ...metadata,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error - activity logging should not break the main flow
  }
};

