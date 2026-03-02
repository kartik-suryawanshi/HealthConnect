import ActivityLog from '../models/ActivityLog.model.js';

// @desc    Get activity logs
// @route   GET /api/activity-logs
// @access  Private
export const getActivityLogs = async (req, res) => {
  try {
    const { action, entityType, limit = 50 } = req.query;
    const query = { user: req.user._id };

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    const logs = await ActivityLog.find(query)
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching activity logs'
    });
  }
};

// @desc    Get activity log for specific entity
// @route   GET /api/activity-logs/entity/:entityType/:entityId
// @access  Private
export const getEntityActivityLogs = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await ActivityLog.find({
      entityType,
      entityId,
      user: req.user._id
    })
      .populate('targetUser', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get entity activity logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching entity activity logs'
    });
  }
};

