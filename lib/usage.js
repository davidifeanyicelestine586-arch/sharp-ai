import fs from 'fs/promises';
import path from 'path';
import { PLANS } from './plans.js';

const DB_PATH = path.join(process.cwd(), 'mock_db.json');

async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) { // eslint-disable-line no-unused-vars
    return { users: {} };
  }
}

async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

export async function getUserStatus(userId = 'default_user') {
  const db = await readDB();
  if (!db.users[userId]) {
    // Initialize default user
    db.users[userId] = {
      plan: 'free',
      usage: 0,
      email: 'user@example.com'
    };
    await writeDB(db);
  }
  return db.users[userId];
}

export async function incrementUsage(userId = 'default_user') {
  const db = await readDB();
  const user = db.users[userId];
  
  if (!user) return false;

  const plan = Object.values(PLANS).find(p => p.id === user.plan);
  
  if (plan.generationLimit !== -1 && user.usage >= plan.generationLimit) {
    return { success: false, error: 'Usage limit reached' };
  }

  user.usage += 1;
  await writeDB(db);
  return { success: true, usage: user.usage };
}

export async function updateSubscription(userId = 'default_user', planId) {
  const db = await readDB();
  if (!db.users[userId]) {
    db.users[userId] = {
      plan: 'free',
      usage: 0,
      email: 'user@example.com'
    };
  }
  db.users[userId].plan = planId;
  await writeDB(db);
  return true;
}
