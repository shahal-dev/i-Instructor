const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_...');
const { v4: uuidv4 } = require('uuid');
const { statements } = require('../database/db');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Create payment intent for session
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd', sessionId, instructorId } = req.body;

    // Validate session exists and user is authorized
    const session = statements.getSessionById.get(sessionId);
    if (!session || session.learner_id !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized session access' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        sessionId,
        learnerId: req.user.userId,
        instructorId,
        platform: 'i-instructor'
      }
    });

    // Store payment record
    const paymentId = uuidv4();
    statements.db.prepare(`
      INSERT INTO payments (id, session_id, learner_id, instructor_id, amount, currency, stripe_payment_intent_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(paymentId, sessionId, req.user.userId, instructorId, amount, currency, paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and update session
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, sessionId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      statements.db.prepare(`
        UPDATE payments SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
        WHERE stripe_payment_intent_id = ?
      `).run(paymentIntentId);

      // Update session status to active
      statements.updateSessionStatus.run('active', sessionId);

      res.json({ success: true, message: 'Payment confirmed and session activated' });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get user payment history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const payments = statements.db.prepare(`
      SELECT p.*, s.subject, s.topic, u.name as instructor_name
      FROM payments p
      LEFT JOIN sessions s ON p.session_id = s.id
      LEFT JOIN users u ON p.instructor_id = u.id
      WHERE p.learner_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.userId);

    res.json({ success: true, payments });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
});

// Instructor earnings and payouts
router.get('/earnings', authenticateToken, (req, res) => {
  try {
    const earnings = statements.db.prepare(`
      SELECT 
        SUM(amount * 0.8) as total_earnings,
        COUNT(*) as total_sessions,
        AVG(amount) as avg_session_value
      FROM payments 
      WHERE instructor_id = ? AND status = 'completed'
    `).get(req.user.userId);

    const recentPayments = statements.db.prepare(`
      SELECT p.*, s.subject, s.topic, u.name as learner_name
      FROM payments p
      LEFT JOIN sessions s ON p.session_id = s.id
      LEFT JOIN users u ON p.learner_id = u.id
      WHERE p.instructor_id = ? AND p.status = 'completed'
      ORDER BY p.completed_at DESC
      LIMIT 10
    `).all(req.user.userId);

    res.json({ 
      success: true, 
      earnings: earnings || { total_earnings: 0, total_sessions: 0, avg_session_value: 0 },
      recentPayments 
    });
  } catch (error) {
    console.error('Earnings fetch error:', error);
    res.status(500).json({ error: 'Failed to get earnings data' });
  }
});

// Request payout
router.post('/request-payout', authenticateToken, async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;

    // Validate instructor has sufficient balance
    const earnings = statements.db.prepare(`
      SELECT SUM(amount * 0.8) as available_balance
      FROM payments 
      WHERE instructor_id = ? AND status = 'completed'
    `).get(req.user.userId);

    if (!earnings || earnings.available_balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create payout request
    const payoutId = uuidv4();
    statements.db.prepare(`
      INSERT INTO payouts (id, instructor_id, amount, method, account_details, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(payoutId, req.user.userId, amount, method, JSON.stringify(accountDetails));

    res.json({ success: true, message: 'Payout request submitted', payoutId });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ error: 'Failed to request payout' });
  }
});

module.exports = router;