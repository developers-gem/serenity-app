const express = require('express');

const authRoutes = require('./authRoutes');
const sageRoutes = require('./sageRoutes');
const moodRoutes = require('./moodRoutes');
const journalRoutes = require('./journalRoutes');
const therapistRoutes = require('./therapistRoutes');
const sessionRoutes = require('./sessionRoutes');
const billingRoutes = require('./billingRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'serenity-backend' }));

router.use('/auth', authRoutes);
router.use('/sage', sageRoutes);
router.use('/mood', moodRoutes);
router.use('/journal', journalRoutes);
router.use('/therapists', therapistRoutes);
router.use('/sessions', sessionRoutes);
router.use('/billing', billingRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
