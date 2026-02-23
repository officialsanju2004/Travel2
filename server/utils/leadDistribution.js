const User = require('../models/User');
const Lead = require('../models/Lead');

/**
 * Distribute leads equally among active sales users using round-robin
 * @param {Array} leadIds - Array of lead IDs to distribute
 * @returns {Object} - Distribution result
 */
exports.distributeLeads = async (leadIds) => {
  const activeSalesUsers = await User.find({ role: 'sales', isActive: true }).select('_id');

  if (activeSalesUsers.length === 0) {
    return { success: false, message: 'No active sales users found for distribution' };
  }

  const assignments = [];
  let userIndex = 0;

  for (const leadId of leadIds) {
    const assignedUser = activeSalesUsers[userIndex % activeSalesUsers.length];
    assignments.push({
      updateOne: {
        filter: { _id: leadId },
        update: {
          $set: {
            assignedTo: assignedUser._id,
            assignedAt: new Date()
          }
        }
      }
    });
    userIndex++;
  }

  if (assignments.length > 0) {
    await Lead.bulkWrite(assignments);
  }

  return {
    success: true,
    totalLeads: leadIds.length,
    usersCount: activeSalesUsers.length,
    distribution: activeSalesUsers.map((user, i) => ({
      userId: user._id,
      leadsAssigned: leadIds.filter((_, idx) => idx % activeSalesUsers.length === i).length
    }))
  };
};

/**
 * Get the next user to assign in round-robin order
 */
exports.getNextAssignee = async () => {
  const activeSalesUsers = await User.find({ role: 'sales', isActive: true }).select('_id');

  if (activeSalesUsers.length === 0) return null;

  // Find user with minimum assigned leads
  const userLeadCounts = await Lead.aggregate([
    { $match: { assignedTo: { $ne: null }, isDeleted: false } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  userLeadCounts.forEach(u => { countMap[u._id.toString()] = u.count; });

  let minCount = Infinity;
  let nextUser = activeSalesUsers[0];

  activeSalesUsers.forEach(user => {
    const count = countMap[user._id.toString()] || 0;
    if (count < minCount) {
      minCount = count;
      nextUser = user;
    }
  });

  return nextUser._id;
};
