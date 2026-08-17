import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { calculateEstimate } from './services/calculator.js';
import { requireOwnerAuth } from './middleware/auth.js';

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

// GET active config
app.get('/api/config', async (req, res) => {
  const cfgRec = await prisma.config.findFirst({ where: { active: true }, orderBy: { configVersion: 'desc' } });
  const cfg = cfgRec
    ? {
        configVersion: cfgRec.configVersion,
        businessName: cfgRec.businessName,
        currency: cfgRec.currency,
        questions: JSON.parse(cfgRec.questions || '[]'),
        modifiers: JSON.parse(cfgRec.modifiers || '{}'),
      }
    : null;
  if (!cfg) return res.status(404).json({ error: 'No active config' });

  // Return only public fields
  return res.json({
    config_version: cfg.configVersion,
    business: { name: cfg.businessName, currency: cfg.currency },
    questions: cfg.questions,
    modifiers: cfg.modifiers
  });
});

// POST estimate
app.post('/api/estimate', async (req, res) => {
  const { name, email, phone, answers } = req.body;
  if (!answers) return res.status(400).json({ error: 'answers required' });

  const cfgRec = await prisma.config.findFirst({ where: { active: true }, orderBy: { configVersion: 'desc' } });
  if (!cfgRec) return res.status(500).json({ error: 'Config missing' });
  const cfg = {
    configVersion: cfgRec.configVersion,
    questions: JSON.parse(cfgRec.questions || '[]'),
    modifiers: JSON.parse(cfgRec.modifiers || '{}')
  };

  // Basic validation: roof_area bounds
  const qRoof = (cfg.questions || []).find((q) => q.key === 'roof_area');
  const roofArea = Number(answers['roof_area'] || 0);
  if (qRoof) {
    if (qRoof.min && roofArea < qRoof.min) return res.status(400).json({ error: 'roof_area below min' });
    if (qRoof.max && roofArea > qRoof.max) return res.status(400).json({ error: 'roof_area above max' });
  }

  const result = calculateEstimate(cfg, answers);

  const lead = await prisma.lead.create({
    data: {
      name: name || 'Anonymous',
      email: email || null,
      phone: phone || null,
      answers: JSON.stringify(answers),
      estimateLow: result.estimate_low,
      estimateHigh: result.estimate_high,
      configVersion: cfg.configVersion
    }
  });

  return res.json({ ...result });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'roofing2026!';
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // For simplicity return a basic token (not JWT) — client can store it
    return res.json({ token: 'ok' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Protected admin routes
app.get('/api/admin/leads', requireOwnerAuth, async (req, res) => {
  const leadsRaw = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  const leads = leadsRaw.map(l => ({
    id: l.id,
    name: l.name,
    email: l.email,
    phone: l.phone,
    answers: (() => { try { return JSON.parse(l.answers || '{}') } catch (e) { return l.answers } })(),
    estimateLow: l.estimateLow,
    estimateHigh: l.estimateHigh,
    configVersion: l.configVersion,
    createdAt: l.createdAt
  }));
  res.json({ leads });
});

app.put('/api/admin/config', requireOwnerAuth, async (req, res) => {
  const payload = req.body;
  if (!payload) return res.status(400).json({ error: 'payload required' });

  // Create new config version (simple increment)
  const latest = await prisma.config.findFirst({ orderBy: { configVersion: 'desc' } });
  const nextVersion = (latest?.configVersion || 0) + 1;

  const created = await prisma.config.create({
    data: {
      configVersion: nextVersion,
      businessName: payload.business?.name ?? latest?.businessName ?? 'Northline Roofing',
      currency: payload.business?.currency ?? latest?.currency ?? 'USD',
      questions: payload.questions ?? latest?.questions,
      modifiers: payload.modifiers ?? latest?.modifiers,
      active: true
    }
  });

  res.json({ created });
});

const PORT = process.env.PORT || 4000;
// Root route: redirect to frontend dev server for convenience during local development
app.get('/', (req, res) => {
  const client = process.env.CLIENT_URL || 'http://localhost:5173';
  return res.redirect(client);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
