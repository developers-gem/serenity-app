const express = require('express');

const authRoutes = require('./authRoutes');
const sageRoutes = require('./sageRoutes');
const moodRoutes = require('./moodRoutes');
const journalRoutes = require('./journalRoutes');
const therapistRoutes = require('./therapistRoutes');  //done
const dashboardRoutes = require("./dashboardRoutes");
const sessionRoutes = require('./sessionRoutes');
const billingRoutes = require('./billingRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok', service: 'serenity-backend' }));

router.use('/auth', authRoutes);  //done
router.use('/sage', sageRoutes);  //done 
router.use('/mood', moodRoutes);  //done
router.use('/journal', journalRoutes);  //done
router.use('/therapists', therapistRoutes); //done
router.use('/dashboard', dashboardRoutes);  //done
router.use('/sessions', sessionRoutes);
router.use('/billing', billingRoutes);
router.use('/notifications', notificationRoutes); //done

module.exports = router;
