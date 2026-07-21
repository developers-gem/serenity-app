/**
 * Seeds the Therapist collection with the six clinicians shown in the
 * Flutter app's design and demo fallback data (services/therapist_service.dart),
 * so the real backend and the offline client fallback stay in sync.
 *
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const Therapist = require('../models/Therapist');

const therapists = [
  {
    name: 'Dr. Aanya Mehta',
    specialty: 'Anxiety & Stress',
    pricePerSession: 1800,
    bio: 'Licensed clinical psychologist with 12 years of experience helping clients navigate anxiety, panic, and burnout with CBT and mindfulness.',
    languages: ['English', 'Hindi'],
    approaches: ['CBT', 'Mindfulness', 'Somatic'],
    rating: 4.9,
    yearsExperience: 12,
  },
  {
    name: 'Dr. Marcus Webb',
    specialty: 'Depression & Mood',
    pricePerSession: 2200,
    bio: 'Specializes in mood disorders and grief, blending psychodynamic therapy with practical behavioral tools.',
    languages: ['English'],
    approaches: ['Psychodynamic', 'Behavioral Activation'],
    rating: 4.7,
    yearsExperience: 15,
  },
  {
    name: 'Dr. Sana Iqbal',
    specialty: 'Trauma & PTSD',
    pricePerSession: 2500,
    bio: 'EMDR-certified trauma specialist supporting survivors of abuse, accidents, and complex PTSD.',
    languages: ['English', 'Urdu'],
    approaches: ['EMDR', 'Trauma-Informed CBT'],
    rating: 5.0,
    yearsExperience: 10,
  },
  {
    name: 'Dr. Leo Tanaka',
    specialty: 'Relationships & LGBTQ+',
    pricePerSession: 2000,
    bio: 'Couples and individual therapist focused on attachment, identity, and queer-affirming care.',
    languages: ['English', 'Japanese'],
    approaches: ['Attachment-Based', 'Affirming Care'],
    rating: 4.8,
    yearsExperience: 9,
  },
  {
    name: 'Dr. Priya Nair',
    specialty: 'Teen & Young Adult',
    pricePerSession: 1500,
    bio: 'Works with students and young professionals on self-esteem, academic stress, and life transitions.',
    languages: ['English', 'Malayalam', 'Hindi'],
    approaches: ['CBT', 'Solution-Focused'],
    rating: 4.6,
    yearsExperience: 6,
  },
  {
    name: 'Dr. Ethan Brooks',
    specialty: 'Sleep & Burnout',
    pricePerSession: 2100,
    bio: 'Behavioral sleep medicine and workplace burnout recovery using ACT and habit-based protocols.',
    languages: ['English'],
    approaches: ['ACT', 'CBT-I'],
    rating: 4.7,
    yearsExperience: 11,
  },
];

async function seed() {
  await mongoose.connect(env.mongodbUri);
  console.log(`Connected to ${env.mongodbUri}`);

  for (const t of therapists) {
    // eslint-disable-next-line no-await-in-loop
    await Therapist.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
    console.log(`Upserted: ${t.name}`);
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
