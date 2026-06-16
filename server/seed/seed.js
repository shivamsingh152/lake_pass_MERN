import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Marina from '../models/Marina.js';
import Boat from '../models/Boat.js';
import Customer from '../models/Customer.js';
import Reservation from '../models/Reservation.js';
import Availability from '../models/Availability.js';

dotenv.config();

const marinasData = [
  {
    name: 'Sunset Bay Marina',
    slug: 'sunset-bay',
    description: 'Premier lakefront marina with stunning sunset views and full-service docks.',
    address: '1200 Lakeshore Drive',
    city: 'Lake Geneva',
    state: 'WI',
    zipCode: '53147',
    phone: '(262) 555-0101',
    email: 'info@sunsetbay.com',
    website: 'https://sunsetbay.com',
  },
  {
    name: 'Crystal Lake Harbor',
    slug: 'crystal-lake',
    description: 'Family-friendly marina on Crystal Lake with pontoon and fishing boat rentals.',
    address: '450 Harbor Road',
    city: 'Traverse City',
    state: 'MI',
    zipCode: '49684',
    phone: '(231) 555-0202',
    email: 'contact@crystallake.com',
    website: 'https://crystallake.com',
  },
  {
    name: 'Blue Water Marina',
    slug: 'blue-water',
    description: 'Luxury yacht and ski boat rentals on the largest freshwater lake.',
    address: '88 Marina Boulevard',
    city: 'Duluth',
    state: 'MN',
    zipCode: '55802',
    phone: '(218) 555-0303',
    email: 'hello@bluewater.com',
    website: 'https://bluewater.com',
  },
  {
    name: 'Pine Cove Marina',
    slug: 'pine-cove',
    description: 'Rustic marina nestled in pine forests, perfect for kayaks and pontoons.',
    address: '22 Cove Lane',
    city: 'Brainerd',
    state: 'MN',
    zipCode: '56401',
    phone: '(218) 555-0404',
    email: 'rentals@pinecove.com',
    website: 'https://pinecove.com',
  },
];

const boatsByMarina = [
  [
    { name: 'Sunset Cruiser', type: 'pontoon', capacity: 10, dailyRate: 350, length: 24, features: ['Bimini top', 'Bluetooth stereo', 'Cooler'] },
    { name: 'Bay Fisher', type: 'fishing', capacity: 4, dailyRate: 275, length: 18, features: ['Fish finder', 'Live well', 'Rod holders'] },
    { name: 'Wave Runner Pro', type: 'jet_ski', capacity: 2, dailyRate: 199, length: 10, features: ['Life jackets included'] },
  ],
  [
    { name: 'Crystal Queen', type: 'pontoon', capacity: 12, dailyRate: 400, length: 26, features: ['Slide', 'Grill', 'GPS'] },
    { name: 'Angler Special', type: 'fishing', capacity: 5, dailyRate: 225, length: 19, features: ['Trolling motor', 'Depth finder'] },
    { name: 'Kayak Duo Set', type: 'kayak', capacity: 2, dailyRate: 75, length: 12, features: ['Paddles', 'Life vests'] },
  ],
  [
    { name: 'Blue Horizon', type: 'yacht', capacity: 8, dailyRate: 1200, length: 42, features: ['Cabin', 'Galley', 'AC'] },
    { name: 'Speed Demon', type: 'ski', capacity: 6, dailyRate: 550, length: 22, features: ['Wake tower', 'Ballast system'] },
    { name: 'Harbor Hopper', type: 'pontoon', capacity: 8, dailyRate: 325, length: 22, features: ['Canopy', 'Swim ladder'] },
  ],
  [
    { name: 'Pine Explorer', type: 'pontoon', capacity: 8, dailyRate: 299, length: 20, features: ['Fishing seats', 'Anchor'] },
    { name: 'Cove Kayak', type: 'kayak', capacity: 1, dailyRate: 45, length: 10, features: ['Dry bag', 'Map'] },
    { name: 'Forest Fisher', type: 'fishing', capacity: 4, dailyRate: 199, length: 16, features: ['Electric motor'] },
  ],
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany(),
      Marina.deleteMany(),
      Boat.deleteMany(),
      Customer.deleteMany(),
      Reservation.deleteMany(),
      Availability.deleteMany(),
    ]);

    const password = await bcrypt.hash('password123', 10);

    for (let i = 0; i < marinasData.length; i++) {
      const marinaData = marinasData[i];

      const owner = await User.create({
        name: `${marinaData.name} Owner`,
        email: `owner@${marinaData.slug.replace(/-/g, '')}.com`,
        password,
        role: 'owner',
      });

      const marina = await Marina.create({ ...marinaData, owner: owner._id });
      owner.marina = marina._id;
      await owner.save();

      await User.create({
        name: 'Marina Manager',
        email: `manager@${marinaData.slug.replace(/-/g, '')}.com`,
        password,
        role: 'manager',
        marina: marina._id,
      });

      await User.create({
        name: 'Dock Staff',
        email: `staff@${marinaData.slug.replace(/-/g, '')}.com`,
        password,
        role: 'staff',
        marina: marina._id,
      });

      const boats = await Boat.insertMany(
        boatsByMarina[i].map((b) => ({ ...b, marina: marina._id, description: `Premium ${b.type} rental at ${marina.name}` }))
      );

      const customers = await Customer.insertMany([
        {
          marina: marina._id,
          firstName: 'John',
          lastName: 'Smith',
          email: `john.smith${i}@email.com`,
          phone: '(555) 100-2000',
          licenseNumber: `DL-${1000 + i}`,
          insuranceProvider: 'BoatSafe Insurance',
          insurancePolicy: `POL-${2000 + i}`,
        },
        {
          marina: marina._id,
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: `sarah.j${i}@email.com`,
          phone: '(555) 300-4000',
          licenseNumber: `DL-${3000 + i}`,
          insuranceProvider: 'LakeGuard',
          insurancePolicy: `POL-${4000 + i}`,
        },
      ]);

      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const twoWeeks = new Date(today);
      twoWeeks.setDate(today.getDate() + 14);

      await Reservation.create({
        marina: marina._id,
        boat: boats[0]._id,
        customer: customers[0]._id,
        startDate: nextWeek,
        endDate: twoWeeks,
        status: 'confirmed',
        totalAmount: boats[0].dailyRate * 7,
        depositAmount: Math.round(boats[0].dailyRate * 7 * 0.25),
        paymentStatus: 'deposit_paid',
        source: 'dashboard',
        createdBy: owner._id,
      });

      await Availability.create({
        boat: boats[1]._id,
        marina: marina._id,
        type: 'maintenance',
        startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        reason: 'Annual engine service',
        createdBy: owner._id,
      });
    }

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Demo login credentials (all marinas):');
    console.log('  Owner:   owner@sunsetbay.com / password123');
    console.log('  Manager: manager@sunsetbay.com / password123');
    console.log('  Staff:   staff@sunsetbay.com / password123');
    console.log('\nOther marinas: crystal-lake, blue-water, pine-cove (same pattern)\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
