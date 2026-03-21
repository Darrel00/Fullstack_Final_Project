import path from 'node:path';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { getSupabase, getGalleryBucket } from './supabase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(publicDir, 'uploads');

const USERS_PATH = path.join(dataDir, 'users.json');
const DRAWINGS_PATH = path.join(dataDir, 'drawings.json');

async function ensureDirsAndFiles() {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(uploadsDir, { recursive: true });

  try {
    await fs.access(USERS_PATH);
  } catch {
    await fs.writeFile(USERS_PATH, JSON.stringify({ users: [] }, null, 2), 'utf8');
  }

  try {
    await fs.access(DRAWINGS_PATH);
  } catch {
    await fs.writeFile(DRAWINGS_PATH, JSON.stringify({ drawings: [] }, null, 2), 'utf8');
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function requireAuth(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect('/auth/signin');
}

function safeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  // pragmatic validation; avoid rejecting real emails
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}

function isDataUrlPngOrJpeg(dataUrl) {
  return (
    typeof dataUrl === 'string' &&
    (dataUrl.startsWith('data:image/png;base64,') || dataUrl.startsWith('data:image/jpeg;base64,'))
  );
}

function dataUrlToBuffer(dataUrl) {
  const base64 = dataUrl.split(',')[1] || '';
  return Buffer.from(base64, 'base64');
}

function extFromDataUrl(dataUrl) {
  if (dataUrl.startsWith('data:image/png;base64,')) return 'png';
  return 'jpg';
}

await ensureDirsAndFiles();

const app = express();

app.set('view engine', 'ejs');
app.set('views', viewsDir);

app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(express.json({ limit: '15mb' }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
});

app.get('/', (req, res) => res.redirect('/draw'));

app.get('/draw', (req, res) => {
  res.render('draw', { title: 'Draw' });
});

app.get('/gallery', async (req, res) => {
  const { drawings } = await readJson(DRAWINGS_PATH);
  const ordered = [...drawings].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  res.render('gallery', { title: 'Gallery', drawings: ordered });
});

app.post('/publish', requireAuth, async (req, res) => {
  const imageData = req.body?.imageData;
  const caption = String(req.body?.caption || '').trim().slice(0, 120);

  if (!isDataUrlPngOrJpeg(imageData)) {
    req.session.flash = { type: 'error', message: 'Please draw something first (PNG/JPEG only).' };
    return res.redirect('/draw');
  }

  const buf = dataUrlToBuffer(imageData);
  if (!buf.length) {
    req.session.flash = { type: 'error', message: 'Image was empty. Try again.' };
    return res.redirect('/draw');
  }

  const ext = extFromDataUrl(imageData);
  const id = randomUUID();
  const filename = `${id}.${ext}`;
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

  const supabase = getSupabase();
  if (!supabase) {
    req.session.flash = {
      type: 'error',
      message: 'Gallery storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or anon key + bucket policies) in .env.',
    };
    return res.redirect('/draw');
  }

  const bucket = getGalleryBucket();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filename, buf, { contentType, upsert: false });

  if (uploadError) {
    // eslint-disable-next-line no-console
    console.error('Supabase storage upload:', uploadError);
    req.session.flash = {
      type: 'error',
      message: 'Could not upload to gallery. Check the bucket name, policies, and API keys.',
    };
    return res.redirect('/draw');
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename);
  const publicUrl = publicData?.publicUrl;
  if (!publicUrl) {
    req.session.flash = {
      type: 'error',
      message: 'Upload succeeded but public URL is missing. Mark the storage bucket as public in Supabase.',
    };
    return res.redirect('/draw');
  }

  const record = {
    id,
    filename,
    url: publicUrl,
    caption,
    authorEmail: req.session.user.email,
    createdAt: new Date().toISOString(),
  };

  const store = await readJson(DRAWINGS_PATH);
  store.drawings.push(record);
  await writeJson(DRAWINGS_PATH, store);

  req.session.flash = { type: 'success', message: 'Published to gallery.' };
  return res.redirect('/gallery');
});

app.get('/auth/signup', (req, res) => {
  res.render('signup', { title: 'Sign up' });
});

app.post('/auth/signup', async (req, res) => {
  const email = safeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!isValidEmail(email)) {
    req.session.flash = { type: 'error', message: 'Enter a valid email.' };
    return res.redirect('/auth/signup');
  }
  if (!isValidPassword(password)) {
    req.session.flash = { type: 'error', message: 'Password must be at least 6 characters.' };
    return res.redirect('/auth/signup');
  }

  const data = await readJson(USERS_PATH);
  const exists = data.users.some((u) => u.email === email);
  if (exists) {
    req.session.flash = { type: 'error', message: 'That email already has an account. Sign in instead.' };
    return res.redirect('/auth/signin');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: randomUUID(), email, passwordHash, createdAt: new Date().toISOString() };
  data.users.push(user);
  await writeJson(USERS_PATH, data);

  req.session.user = { id: user.id, email: user.email };
  req.session.flash = { type: 'success', message: 'Account created.' };
  return res.redirect('/draw');
});

app.get('/auth/signin', (req, res) => {
  res.render('signin', { title: 'Sign in' });
});

app.post('/auth/signin', async (req, res) => {
  const email = safeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  const data = await readJson(USERS_PATH);
  const user = data.users.find((u) => u.email === email);
  if (!user) {
    req.session.flash = { type: 'error', message: 'Invalid email or password.' };
    return res.redirect('/auth/signin');
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    req.session.flash = { type: 'error', message: 'Invalid email or password.' };
    return res.redirect('/auth/signin');
  }

  req.session.user = { id: user.id, email: user.email };
  req.session.flash = { type: 'success', message: 'Signed in.' };
  return res.redirect('/draw');
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/draw');
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

