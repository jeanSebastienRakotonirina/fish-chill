const express = require('express');
const router = express.Router();

const vesselCtrl = require('../controllers/vesselController');
const catchCtrl = require('../controllers/catchController');
const netCtrl = require('../controllers/netController');
const authCtrl = require('../controllers/authController');
const aiCtrl = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// ── Auth (public) ──────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', protect, authCtrl.me);

// ── Health (public) ────────────────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fish-chill-backend', timestamp: new Date().toISOString() });
});

// ── Routes protégées ───────────────────────────────────────

// Navires
router.get('/vessels', protect, vesselCtrl.getAll);
router.get('/vessels/:id', protect, vesselCtrl.getOne);
router.get('/vessels/:id/dashboard', protect, vesselCtrl.dashboard);
router.post('/vessels', protect, authorize('admin', 'terre'), vesselCtrl.create);
router.patch('/vessels/:id', protect, authorize('admin', 'terre', 'embarque'), vesselCtrl.update);

// Captures
router.get('/catches', protect, catchCtrl.getAll);
router.get('/catches/stats', protect, catchCtrl.stats);
router.post('/catches', protect, authorize('admin', 'terre', 'embarque'), catchCtrl.create);

// Filets
router.get('/nets', protect, netCtrl.getAll);
router.post('/nets', protect, authorize('admin', 'terre', 'embarque'), netCtrl.create);
router.patch('/nets/:id', protect, authorize('admin', 'terre', 'embarque'), netCtrl.update);
router.post('/nets/:id/alerts/:alertId/ack', protect, authorize('admin', 'terre', 'embarque'), netCtrl.acknowledgeAlert);

// ── IA ─────────────────────────────────────────────────────
router.get('/ai/insights', protect, aiCtrl.insights);
router.post('/ai/chat', protect, aiCtrl.chat);

module.exports = router;
