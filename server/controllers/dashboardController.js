const Lead = require('../models/Lead');
const User = require('../models/User');
const Activity = require('../models/Activity');

exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalLeads,
      statusCounts,
      sourceCounts,
      leadsPerAgent,
      recentLeads,
      monthlyTrend,
      upcomingFollowUps
    ] = await Promise.all([
      Lead.countDocuments({ isDeleted: false }),

      Lead.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      Lead.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]),

      Lead.aggregate([
        { $match: { isDeleted: false, assignedTo: { $ne: null } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 }, converted: { $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] } }, revenue: { $sum: '$revenue' } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { count: 1, converted: 1, revenue: 1, 'user.name': 1, 'user.email': 1, 'user.isActive': 1 } },
        { $sort: { count: -1 } }
      ]),

      Lead.find({ isDeleted: false })
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(10),

      Lead.aggregate([
        { $match: { isDeleted: false, createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'Confirmed'] }, 1, 0] } },
            revenue: { $sum: '$revenue' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      Lead.find({
        isDeleted: false,
        followUpDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      })
        .populate('assignedTo', 'name')
        .sort({ followUpDate: 1 })
        .limit(10)
    ]);

    const confirmedLeads = await Lead.countDocuments({ status: 'Confirmed', isDeleted: false });
    const totalRevenue = await Lead.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);

    const conversionRate = totalLeads > 0 ? ((confirmedLeads / totalLeads) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      stats: {
        totalLeads,
        confirmedLeads,
        conversionRate,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        sourceCounts: sourceCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        leadsPerAgent,
        recentLeads,
        monthlyTrend,
        upcomingFollowUps
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSalesDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      myLeads,
      myStatusCounts,
      upcomingFollowUps,
      recentActivity,
      todayFollowUps
    ] = await Promise.all([
      Lead.countDocuments({ assignedTo: userId, isDeleted: false }),

      Lead.aggregate([
        { $match: { assignedTo: userId, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      Lead.find({
        assignedTo: userId,
        isDeleted: false,
        followUpDate: {
          $gte: new Date(),
          $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }).sort({ followUpDate: 1 }).limit(10),

      Activity.find({ user: userId })
        .populate('lead', 'name destination status')
        .sort({ createdAt: -1 })
        .limit(10),

      Lead.find({
        assignedTo: userId,
        isDeleted: false,
        followUpDate: { $gte: today, $lt: tomorrow }
      }).limit(5)
    ]);

    const myConverted = await Lead.countDocuments({ assignedTo: userId, status: 'Confirmed', isDeleted: false });
    const myRevenue = await Lead.aggregate([
      { $match: { assignedTo: userId, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$revenue' } } }
    ]);

    res.json({
      success: true,
      stats: {
        myLeads,
        myConverted,
        myRevenue: myRevenue[0]?.total || 0,
        conversionRate: myLeads > 0 ? ((myConverted / myLeads) * 100).toFixed(1) : 0,
        statusCounts: myStatusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        upcomingFollowUps,
        todayFollowUps,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
