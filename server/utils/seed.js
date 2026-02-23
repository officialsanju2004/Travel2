const mongoose = require('mongoose');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/travel-crm';

const destinations = ['Bali, Indonesia', 'Paris, France', 'Dubai, UAE', 'Maldives', 'Tokyo, Japan', 'New York, USA', 'Rome, Italy', 'Bangkok, Thailand', 'London, UK', 'Singapore'];
const sources = ['Facebook', 'Instagram', 'Website', 'Referral', 'WhatsApp', 'Phone Call'];
const statuses = ['New', 'Contacted', 'Quotation Sent', 'Flight Booked', 'Hotel Booked', 'Confirmed', 'Cancelled', 'Lost'];
const priorities = ['Low', 'Medium', 'High', 'Urgent'];

const names = ['Ahmed Al-Rashidi', 'Sarah Johnson', 'Mohammed Al-Farsi', 'Emily Chen', 'Khalid Al-Mansoori', 'Jessica Williams', 'Omar Al-Hashimi', 'Priya Sharma', 'Abdullah Al-Zaabi', 'Laura Martinez'];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Lead.deleteMany({});
  await Activity.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Super Admin',
    email: 'bably1937@gmail.com',
    password: 'admin123',
    role: 'admin',
    phone: '+971501234567'
  });

  // Create sales users
  const salesUsers = await User.create([
    { name: 'Alex Thompson', email: 'godsanju21@gmail.com', password: 'sales123', role: 'sales', phone: '+971502345678' },
    { name: 'Maria Garcia', email: 'maria@travelcrm.com', password: 'sales123', role: 'sales', phone: '+971503456789' },
    { name: 'James Wilson', email: 'james@travelcrm.com', password: 'sales123', role: 'sales', phone: '+971504567890' },
    { name: 'Fatima Al-Said', email: 'fatima@travelcrm.com', password: 'sales123', role: 'sales', phone: '+971505678901' },
    { name: 'David Kim', email: 'david@travelcrm.com', password: 'sales123', role: 'sales', phone: '+971506789012' },
  ]);

  // Create leads and distribute round-robin
  const leads = [];
  for (let i = 0; i < 50; i++) {
    const travelDate = new Date();
    travelDate.setDate(travelDate.getDate() + Math.floor(Math.random() * 120) + 7);

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const agentIndex = i % salesUsers.length;

    leads.push({
      name: `${names[i % names.length]} ${i + 1}`,
      phone: `+9715${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
      email: `lead${i + 1}@example.com`,
      destination: destinations[Math.floor(Math.random() * destinations.length)],
      travelDate,
      budget: Math.floor(Math.random() * 10000) + 1000,
      source: sources[Math.floor(Math.random() * sources.length)],
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      assignedTo: salesUsers[agentIndex]._id,
      assignedBy: admin._id,
      assignedAt: new Date(),
      numberOfTravelers: Math.floor(Math.random() * 5) + 1,
      revenue: status === 'Confirmed' ? Math.floor(Math.random() * 5000) + 2000 : 0,
      notes: 'Initial contact made. Customer interested in premium package.',
      followUpDate: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
    });
  }

  const createdLeads = await Lead.insertMany(leads);

  // Create sample activities
  const activityTypes = ['note', 'call', 'email', 'status_change'];
  const activityContents = [
    'Called customer, discussed package options. Very interested.',
    'Sent quotation via email. Waiting for response.',
    'Customer confirmed travel dates. Processing booking.',
    'Follow-up call made. Customer requested changes to itinerary.',
    'Hotel booking confirmed. Sent confirmation details to customer.'
  ];

  const activities = createdLeads.slice(0, 20).map((lead, i) => ({
    lead: lead._id,
    user: salesUsers[i % salesUsers.length]._id,
    type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
    content: activityContents[Math.floor(Math.random() * activityContents.length)]
  }));

  await Activity.insertMany(activities);

  console.log('\n✅ Seed completed!');
  console.log('='.repeat(40));
  console.log('👤 Admin Login:');
  console.log('   Email: admin@travelcrm.com');
  console.log('   Password: admin123');
  console.log('\n👥 Sales Users:');
  salesUsers.forEach(u => console.log(`   ${u.email} / sales123`));
  console.log(`\n📊 Created ${leads.length} leads`);
  console.log('='.repeat(40));

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
