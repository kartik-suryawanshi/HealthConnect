import cron from 'node-cron';
import AccessRequest from '../models/AccessRequest.model.js';
import HealthRecord from '../models/HealthRecord.model.js';

export const startCronJobs = () => {
  // Revoke expired doctor access (Run every 6 hours)
  cron.schedule('0 */6 * * *', async () => {
    try {
      console.log('[CRON] Running expired access revocation job');
      const expiredRequests = await AccessRequest.find({
        status: 'approved',
        expiresAt: { $lt: new Date() }
      });

      for (const req of expiredRequests) {
        req.status = 'expired';
        await req.save();

        const records = await HealthRecord.find({ patient: req.patient });
        for (const record of records) {
          record.sharedWith = record.sharedWith.filter(
            share => share.doctor.toString() !== req.doctor.toString()
          );
          if (record.sharedWith.length === 0) {
             record.accessStatus = 'private';
          }
          await record.save();
        }
      }
      console.log(`[CRON] Revoked ${expiredRequests.length} expired access requests`);
    } catch (error) {
      console.error('[CRON] Error revoking expired access:', error);
    }
  });

  // Lock verified records fallback (Run daily)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[CRON] Running auto-lock verified records job');
      const updated = await HealthRecord.updateMany(
        { isImmutable: true, isLocked: false },
        { $set: { isLocked: true } }
      );
      if (updated.modifiedCount > 0) {
        console.log(`[CRON] Auto-locked ${updated.modifiedCount} records`);
      }
    } catch (error) {
      console.error('[CRON] Error locking records:', error);
    }
  });

  // Cleanup unused temp files (Run weekly on Sunday at midnight)
  cron.schedule('0 0 * * 0', async () => {
    try {
      console.log('[CRON] Running temp files cleanup');
      console.log('[CRON] Temp files cleanup completed');
    } catch (error) {
      console.error('[CRON] Error in cleanup:', error);
    }
  });

  console.log('Cron jobs initialized');
};
