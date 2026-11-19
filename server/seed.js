require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Package = require('./models/Package');
const Booking = require('./models/Booking');

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=70`;

// Next 6 departure dates, every ~3 weeks
const dates = () =>
  Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 14 + i * 21);
    d.setHours(0, 0, 0, 0);
    return d;
  });

const packages = [
  { title: 'Goa Beach Escape', destination: 'Goa', country: 'India', category: 'Beach', price: 14999, days: 4, seats: 30, rating: 4.6, featured: true,
    image: img('photo-1512343879784-a960bf40e7f2'),
    description: 'Four relaxed days on the Goan coast: sunrise walks, beach shacks, water sports and a sunset cruise on the Mandovi river.',
    highlights: ['Baga & Calangute beaches', 'Sunset river cruise', 'Old Goa churches', 'Water sports'] },
  { title: 'Manali Snow Adventure', destination: 'Manali', country: 'India', category: 'Mountain', price: 18999, days: 5, seats: 24, rating: 4.7, featured: true,
    image: img('photo-1626621341517-bbf3d9990a23'),
    description: 'Snow, pine forests and the Solang Valley. Includes skiing, paragliding and a day trip to Atal Tunnel.',
    highlights: ['Solang Valley', 'Rohtang / Atal Tunnel', 'Paragliding', 'Hadimba Temple'] },
  { title: 'Jaipur Royal Heritage', destination: 'Jaipur', country: 'India', category: 'Heritage', price: 12499, days: 3, seats: 40, rating: 4.5, featured: true,
    image: img('photo-1477587458883-47145ed94245'),
    description: 'Walk through forts and palaces of the Pink City: Amber Fort, City Palace, Hawa Mahal and Chokhi Dhani dinner.',
    highlights: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Chokhi Dhani dinner'] },
  { title: 'Kerala Backwater Retreat', destination: 'Alleppey', country: 'India', category: 'Beach', price: 21999, days: 5, seats: 20, rating: 4.8, featured: true,
    image: img('photo-1602216056096-3b40cc0c9944'),
    description: 'Overnight houseboat stay, Munnar tea gardens and Ayurvedic spa sessions across God\'s Own Country.',
    highlights: ['Houseboat stay', 'Munnar tea estates', 'Ayurvedic massage', 'Kathakali show'] },
  { title: 'Ladakh Road Trip', destination: 'Leh', country: 'India', category: 'Adventure', price: 32999, days: 7, seats: 16, rating: 4.9,
    image: img('photo-1506038634487-60a69ae4b7b1'),
    description: 'High-altitude passes, Pangong Lake, monasteries and Nubra Valley camel rides in a small group.',
    highlights: ['Pangong Lake', 'Khardung La', 'Nubra Valley', 'Thiksey Monastery'] },
  { title: 'Jim Corbett Safari', destination: 'Nainital', country: 'India', category: 'Wildlife', price: 16499, days: 3, seats: 18, rating: 4.4,
    image: img('photo-1549366021-9f761d450615'),
    description: 'Jeep safaris through Corbett National Park with a resort stay on the Kosi river.',
    highlights: ['Jeep safari', 'Riverside resort', 'Bird watching', 'Nainital lake'] },
  { title: 'Dubai City Getaway', destination: 'Dubai', country: 'UAE', category: 'City', price: 54999, days: 5, seats: 25, rating: 4.6,
    image: img('photo-1512453979798-5ea266f8880c'),
    description: 'Burj Khalifa, desert safari, Dubai Mall and a Marina dhow dinner cruise.',
    highlights: ['Burj Khalifa', 'Desert safari', 'Dhow cruise', 'Dubai Mall'] },
  { title: 'Bali Island Bliss', destination: 'Bali', country: 'Indonesia', category: 'Beach', price: 64999, days: 6, seats: 22, rating: 4.8,
    image: img('photo-1537996194471-e657df975ab4'),
    description: 'Ubud rice terraces, temple visits, Nusa Penida cliffs and beach clubs in Seminyak.',
    highlights: ['Ubud rice terraces', 'Nusa Penida', 'Tanah Lot temple', 'Seminyak beach'] },
  { title: 'Paris & Swiss Alps', destination: 'Paris', country: 'France', category: 'City', price: 189999, days: 9, seats: 12, rating: 4.7,
    image: img('photo-1502602898657-3e91760cbb34'),
    description: 'Eiffel Tower, Louvre and Seine cruise, followed by the Swiss Alps by scenic train.',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Jungfraujoch', 'Scenic train'] },
].map((p) => ({ ...p, startDates: dates() }));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Package.deleteMany(), Booking.deleteMany()]);
  await User.create([
    { name: 'Admin', email: 'admin@travel.com', password: 'admin123', role: 'admin' },
    { name: 'Demo User', email: 'user@travel.com', password: 'user123' },
  ]);
  await Package.insertMany(packages);
  console.log('Seeded: admin@travel.com / admin123  and  user@travel.com / user123');
  await mongoose.disconnect();
})();
