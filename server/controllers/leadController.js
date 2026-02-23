const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { distributeLeads, getNextAssignee } = require('../utils/leadDistribution');

// Get all leads (admin) or assigned leads (sales)
exports.publicLeadCreate = async (req, res) => {
  try {
    const {
      name, phone, email, destination,
      travelDate, budget, numberOfTravelers, source,
      secret // ek secret key taaki koi bhi spam na kare
    } = req.body;

    // Simple security check
    if (secret !== process.env.PUBLIC_FORM_SECRET) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!name || !phone || !destination) {
      return res.status(400).json({ success: false, message: 'Name, phone aur destination zaroori hai' });
    }

    const leadData = {
      name, phone, email, destination,
      travelDate, source: source || 'Website',
      budget: parseFloat(budget) || 0,
      numberOfTravelers: parseInt(numberOfTravelers) || 1,
      status: 'New'
    };

    // Auto assign to agent with least leads
    const nextAssignee = await getNextAssignee();
    if (nextAssignee) {
      leadData.assignedTo = nextAssignee;
      leadData.assignedAt = new Date();
    }

    const lead = await Lead.create(leadData);

    await Activity.create({
      lead: lead._id,
      user: leadData.assignedTo || null, // system action
      type: 'system',
      content: `Lead created via Google Form (source: ${leadData.source})`
    });

    res.status(201).json({
      success: true,
      message: 'Lead successfully created',
      leadId: lead._id
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getLeads = async (req, res) => {
  try {
    const { status, source, assignedTo, search, priority, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { isDeleted: false };

    // Sales users can only see their own leads
    if (req.user.role === 'sales') {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email avatar')
        .populate('assignedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Lead.countDocuments(filter)
    ]);

    res.json({
      success: true,
      leads,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single lead
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email phone avatar')
      .populate('assignedBy', 'name');

    if (!lead || lead.isDeleted) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Sales users can only view their own leads
    if (req.user.role === 'sales' && lead.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const activities = await Activity.find({ lead: req.params.id })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 });

    res.json({ success: true, lead, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create single lead
exports.createLead = async (req, res) => {
  try {
    const leadData = { ...req.body };

    // Auto-assign if not specified
    if (!leadData.assignedTo) {
      const nextAssignee = await getNextAssignee();
      if (nextAssignee) {
        leadData.assignedTo = nextAssignee;
        leadData.assignedBy = req.user._id;
        leadData.assignedAt = new Date();
      }
    }

    const lead = await Lead.create(leadData);

    // Log system activity
    await Activity.create({
      lead: lead._id,
      user: req.user._id,
      type: 'system',
      content: `Lead created by ${req.user.name}`,
    });

    if (lead.assignedTo) {
      await Activity.create({
        lead: lead._id,
        user: req.user._id,
        type: 'assignment',
        content: `Lead automatically assigned`,
        metadata: { assignedTo: lead.assignedTo }
      });
    }

    const populatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email');
    res.status(201).json({ success: true, lead: populatedLead, message: 'Lead created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk create leads with auto-distribution
exports.bulkCreateLeads = async (req, res) => {
  try {
    const { leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ success: false, message: 'No leads provided' });
    }

    const createdLeads = await Lead.insertMany(leads.map(l => ({ ...l })));
    const leadIds = createdLeads.map(l => l._id);

    const distribution = await distributeLeads(leadIds);

    // Log bulk creation
    const activities = leadIds.map(leadId => ({
      lead: leadId,
      user: req.user._id,
      type: 'system',
      content: `Lead created via bulk import by ${req.user.name}`
    }));
    await Activity.insertMany(activities);

    res.status(201).json({
      success: true,
      message: `${leads.length} leads created and distributed`,
      distribution
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead || lead.isDeleted) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Sales users can only update their own leads and limited fields
    if (req.user.role === 'sales') {
      if (lead.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      // Sales can update status, notes, followUpDate, revenue
      const { status, notes, followUpDate, revenue } = req.body;
      req.body = {};
      if (status) req.body.status = status;
      if (notes !== undefined) req.body.notes = notes;
      if (followUpDate !== undefined) req.body.followUpDate = followUpDate;
      if (revenue !== undefined) req.body.revenue = revenue; // ✅ Added
    }

    const previousStatus = lead.status;
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('assignedTo', 'name email');

    // Log status change
    if (req.body.status && req.body.status !== previousStatus) {
      await Activity.create({
        lead: lead._id,
        user: req.user._id,
        type: 'status_change',
        content: `Status changed from "${previousStatus}" to "${req.body.status}"`,
        previousStatus,
        newStatus: req.body.status
      });
    }

    res.json({ success: true, lead: updatedLead, message: 'Lead updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete lead (admin only)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign lead (admin)
exports.assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead || lead.isDeleted) return res.status(404).json({ success: false, message: 'Lead not found' });

    const previousAssignee = lead.assignedTo;
    lead.assignedTo = assignedTo;
    lead.assignedBy = req.user._id;
    lead.assignedAt = new Date();
    await lead.save();

    const assignedUser = await User.findById(assignedTo).select('name');

    await Activity.create({
      lead: lead._id,
      user: req.user._id,
      type: 'assignment',
      content: `Lead ${previousAssignee ? 'reassigned' : 'assigned'} to ${assignedUser?.name}`,
      metadata: { previousAssignee, newAssignee: assignedTo }
    });

    const updatedLead = await Lead.findById(lead._id).populate('assignedTo', 'name email');
    res.json({ success: true, lead: updatedLead, message: 'Lead assigned successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk assign leads (admin)
exports.bulkAssignLeads = async (req, res) => {
  try {
    const { leadIds, assignedTo } = req.body;

    if (!leadIds || leadIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No lead IDs provided' });
    }

    if (assignedTo === 'auto') {
      await distributeLeads(leadIds);
    } else {
      await Lead.updateMany(
        { _id: { $in: leadIds } },
        { assignedTo, assignedBy: req.user._id, assignedAt: new Date() }
      );
    }

    // Log activities
    const activities = leadIds.map(leadId => ({
      lead: leadId,
      user: req.user._id,
      type: 'assignment',
      content: assignedTo === 'auto' ? 'Lead auto-distributed by admin' : 'Lead bulk assigned by admin'
    }));
    await Activity.insertMany(activities);

    res.json({ success: true, message: `${leadIds.length} leads assigned successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
