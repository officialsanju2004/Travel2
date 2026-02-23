const Activity = require('../models/Activity');
const Lead = require('../models/Lead');

exports.getActivitiesByLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead || lead.isDeleted) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Sales users can only see activities for their own leads
    if (req.user.role === 'sales' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const activities = await Activity.find({ lead: req.params.leadId })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addActivity = async (req, res) => {
  try {
    const { type, content, followUpDate } = req.body;
    const lead = await Lead.findById(req.params.leadId);

    if (!lead || lead.isDeleted) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Sales users can only add activity to their own leads
    if (req.user.role === 'sales' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const activity = await Activity.create({
      lead: req.params.leadId,
      user: req.user._id,
      type: type || 'note',
      content,
      followUpDate
    });

    // Update lead follow-up date if provided
    if (followUpDate) {
      await Lead.findByIdAndUpdate(req.params.leadId, { followUpDate });
    }

    const populatedActivity = await Activity.findById(activity._id).populate('user', 'name avatar role');
    res.status(201).json({ success: true, activity: populatedActivity, message: 'Activity added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    // Only admin or activity creator can delete
    if (req.user.role !== 'admin' && activity.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Activity deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
