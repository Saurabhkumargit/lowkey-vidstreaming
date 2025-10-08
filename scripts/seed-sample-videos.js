/*
  Seed script to add sample videos to the `videos` collection.
  Usage (Windows PowerShell):
    node .\scripts\seed-sample-videos.js

  The script reads MONGODB_URI from .env.local (via dotenv).
*/

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Try to load dotenv if available; otherwise parse .env.local manually
try {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });
} catch (err) {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    });
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in .env.local');
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('Connected to MongoDB');

    const videos = [
      {
        title: 'Sample: Mountain Timelapse',
        description: 'Beautiful mountain timelapse sample video.',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        thumbnailUrl: 'https://placehold.co/640x360?text=Mountain',
        controls: true,
        transformation: { width: 1080, height: 1920, quality: 80 },
        userId: new mongoose.Types.ObjectId(),
        likes: [],
        comments: [],
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Sample: Ocean Waves',
        description: 'Relaxing ocean waves sample video.',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        thumbnailUrl: 'https://placehold.co/640x360?text=Ocean',
        controls: true,
        transformation: { width: 1080, height: 1920, quality: 80 },
        userId: new mongoose.Types.ObjectId(),
        likes: [],
        comments: [],
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Sample: City Drive',
        description: 'Night city drive sample video.',
        videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
        thumbnailUrl: 'https://placehold.co/640x360?text=City',
        controls: true,
        transformation: { width: 1080, height: 1920, quality: 80 },
        userId: new mongoose.Types.ObjectId(),
        likes: [],
        comments: [],
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const res = await mongoose.connection.collection('videos').insertMany(videos);
    console.log(`Inserted ${res.insertedCount} sample videos.`);

    const count = await mongoose.connection.collection('videos').countDocuments();
    console.log(`Total videos in collection: ${count}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed videos:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

main();
