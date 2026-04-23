require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

const PICS = {
  ghee1: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800',
  ghee2: 'https://images.unsplash.com/photo-1628173424169-7c85e2b005bd?auto=format&fit=crop&q=80&w=800',
  ghee3: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=800',
  ghee4: 'https://images.unsplash.com/photo-1611078485292-1271f2bfe573?auto=format&fit=crop&q=80&w=800',
  ghee5: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=800',
  cow:   'https://images.unsplash.com/photo-1530836369250-ef71a3f5e481?auto=format&fit=crop&q=80&w=800',
};

const seedProducts = [
  {
    name: 'A2 Gir Cow Ghee - Signature',
    slug: 'a2-gir-cow-ghee-signature',
    description: [{
      header: 'Description',
      text: 'Our signature A2 Ghee is crafted using the ancient Vedic Bilona method. We start by milking free-grazing Gir cows. The fresh milk is boiled on a woodfire and naturally curdled overnight. Before sunrise, the curd is hand-churned in clay pots using a wooden bilona.',
      bulletPoints: ['Heart Healthy', 'Better Digestion']
    }],
    productImages: [PICS.ghee1, PICS.cow],
    quantities: [{ label: '500ml', value: 500 }, { label: '1L', value: 1000 }],
    prices: [{ label: 'MRP', value: 1899 }],
    oldPrice: 2200,
    category: 'Pure Ghee',
    badges: ['Best Seller'],
    stock: 150,
    isActive: true,
    averageRating: 4.9,
    totalReviews: 840
  },
  {
    name: 'A2 Bilona Trial Pack',
    slug: 'a2-bilona-trial',
    description: [{
      header: 'Description',
      text: 'Experience the magic of pure A2 Ghee with our 250ml trial pack. Perfect for testing.',
      bulletPoints: ['Immunity Boost']
    }],
    productImages: [PICS.ghee4],
    quantities: [{ label: '250ml', value: 250 }],
    prices: [{ label: 'MRP', value: 999 }],
    oldPrice: 1150,
    category: 'Pure Ghee',
    badges: ['Trial Size'],
    stock: 200,
    isActive: true,
    averageRating: 4.7,
    totalReviews: 320
  },
  {
    name: 'Ashwagandha Infused Ghee',
    slug: 'ashwagandha-infused-ghee',
    description: [{
      header: 'Description',
      text: 'A powerful Ayurvedic fusion. We slow-infuse organic Ashwagandha roots into our pure A2 Bilona Ghee.',
      bulletPoints: ['Stress Relief', 'Better Sleep', 'Vitality Boost']
    }],
    productImages: [PICS.ghee2],
    quantities: [{ label: '350ml', value: 350 }],
    prices: [{ label: 'MRP', value: 2499 }],
    oldPrice: 2800,
    category: 'Herbal Ghee',
    badges: ['Ayurvedic'],
    stock: 40,
    isActive: true,
    averageRating: 4.8,
    totalReviews: 195
  },
  {
    name: 'Turmeric Golden Ghee',
    slug: 'turmeric-golden-ghee',
    description: [{
      header: 'Description',
      text: 'Infused with high-curcumin Lakadong turmeric and black pepper for maximum absorption. A golden elixir for joints and immunity.',
      bulletPoints: ['Anti-inflammatory', 'Joint Health']
    }],
    productImages: [PICS.ghee5],
    quantities: [{ label: '350ml', value: 350 }],
    prices: [{ label: 'MRP', value: 2299 }],
    oldPrice: 2500,
    category: 'Herbal Ghee',
    badges: ['Immunity'],
    stock: 60,
    isActive: true,
    averageRating: 4.8,
    totalReviews: 245
  },
  {
    name: 'Brahmi Brain Booster Ghee',
    slug: 'brahmi-brain-booster-ghee',
    description: [{
      header: 'Description',
      text: 'Slow-cooked with pure Brahmi (Bacopa monnieri). Known in Ayurveda to enhance memory, focus, and cognitive function.',
      bulletPoints: ['Sharps Memory', 'Focus']
    }],
    productImages: [PICS.ghee3],
    quantities: [{ label: '250ml', value: 250 }],
    prices: [{ label: 'MRP', value: 2699 }],
    oldPrice: 2999,
    category: 'Herbal Ghee',
    badges: ['Cognitive'],
    stock: 25,
    isActive: true,
    averageRating: 4.9,
    totalReviews: 88
  },
  {
    name: 'Wood-Pressed Coconut Oil',
    slug: 'wood-pressed-coconut-oil',
    description: [{
      header: 'Description',
      text: 'Cold-pressed from sun-dried coconuts in a traditional wooden ghani. Extra virgin, unrefined, and perfect for cooking or skin.',
      bulletPoints: ['Heart Healthy', 'Skin Nourishing']
    }],
    productImages: [PICS.ghee4],
    quantities: [{ label: '500ml', value: 500 }, { label: '1L', value: 1000 }],
    prices: [{ label: 'MRP', value: 899 }],
    oldPrice: 1100,
    category: 'Oils',
    badges: ['Cold Pressed'],
    stock: 120,
    isActive: true,
    averageRating: 4.8,
    totalReviews: 450
  },
  {
    name: 'Shatavari Women\'s Ghee',
    slug: 'shatavari-womens-ghee',
    description: [{
      header: 'Description',
      text: 'Enriched with Shatavari root extract, recognized as the foremost Ayurvedic rejuvenative for women. Promotes hormonal balance.',
      bulletPoints: ['Hormonal Balance', 'Rejuvenating']
    }],
    productImages: [PICS.ghee2],
    quantities: [{ label: '250ml', value: 250 }],
    prices: [{ label: 'MRP', value: 2899 }],
    category: 'Herbal Ghee',
    badges: ['Ayurvedic'],
    stock: 35,
    isActive: true,
    averageRating: 5.0,
    totalReviews: 56
  },
  {
    name: 'Wood-Pressed Groundnut Oil',
    slug: 'wood-pressed-groundnut-oil',
    description: [{
      header: 'Description',
      text: 'Rich, nutty flavor extracted from premium native peanuts using the traditional cold-pressed method. High smoke point.',
      bulletPoints: ['Cholesterol Free', 'Rich in Vitamin E']
    }],
    productImages: [PICS.ghee5],
    quantities: [{ label: '1L', value: 1000 }, { label: '5L', value: 5000 }],
    prices: [{ label: 'MRP', value: 749 }],
    category: 'Oils',
    badges: ['Cold Pressed'],
    stock: 180,
    isActive: true,
    averageRating: 4.7,
    totalReviews: 310
  },
  {
    name: 'Garlic & Herb Ghee',
    slug: 'garlic-herb-ghee',
    description: [{
      header: 'Description',
      text: 'A savory delight! Pure A2 Ghee slow-roasted with fresh garlic pods and rosemary. Incredible for sautéing vegetables and spreading on bread.',
      bulletPoints: ['Savory Flavor', 'Heart Healthy']
    }],
    productImages: [PICS.ghee1],
    quantities: [{ label: '250ml', value: 250 }],
    prices: [{ label: 'MRP', value: 1499 }],
    oldPrice: 1699,
    category: 'Culinary Ghee',
    badges: ['New Arrival'],
    stock: 80,
    isActive: true,
    averageRating: 4.8,
    totalReviews: 120
  },
  {
    name: 'Panchagavya Diya (Pack of 30)',
    slug: 'panchagavya-diya-30',
    description: [{
      header: 'Description',
      text: 'Sacred diyas handmade from the 5 elements of the Gir Cow (Dung, Urine, Milk, Curd, Ghee). Purifies the air and brings positive energy.',
      bulletPoints: ['Air Purifying', 'Zero Waste']
    }],
    productImages: [PICS.cow],
    quantities: [{ label: '30 Pieces', value: 30 }],
    prices: [{ label: 'MRP', value: 499 }],
    category: 'Spiritual',
    badges: ['Eco Friendly'],
    stock: 500,
    isActive: true,
    averageRating: 4.9,
    totalReviews: 890
  }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to DB');
  await Product.deleteMany({});
  console.log('Cleared existing products');
  
  await Product.insertMany(seedProducts);
  console.log('Inserted 10 new high-quality seed products!');
  
  process.exit();
}).catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
