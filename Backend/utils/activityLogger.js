import ActivityLog from '../models/ActivityLog.model.js';
import crypto from 'crypto';

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

    // Get last log for hash chain
    const lastLog = await ActivityLog.findOne().sort({ createdAt: -1 });
    const previousHash = lastLog && lastLog.currentHash ? lastLog.currentHash : '0';

    const timestampStr = new Date().toISOString();
    const dataToHash = `${action}${timestampStr}${previousHash}`;
    const currentHash = crypto.createHash('sha256').update(dataToHash).digest('hex');

    await ActivityLog.create({
      user,
      action,
      entityType,
      entityId,
      description,
      actor,
      targetUser,
      previousHash,
      currentHash,
      metadata: {
        ...metadata,
        timestamp: timestampStr
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error - activity logging should not break the main flow
  }
};

