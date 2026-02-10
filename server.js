require('dotenv').config();
const express = require('express');
const path = require('path');
const walletAPI = require('./services/walletAPI');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    walletApiUrl: process.env.WALLET_API_URL
  });
});

// Check if user exists
app.post('/api/check-user', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const result = await walletAPI.getCustomerByMerchantCode(username);
    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
app.post('/api/create-user', async (req, res) => {
  try {
    const { username, firstName, lastName, email, country, city, currency } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const result = await walletAPI.createNewUser({
      username,
      firstName: firstName || 'User',
      lastName: lastName || 'Academy',
      email: email || '',
      country: country || 'US',
      city: city || 'Unknown',
      currencyCode: currency || 'USD'
    });

    res.json(result);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add balance
app.post('/api/add-balance', async (req, res) => {
  try {
    const { customerId, amount } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ error: 'CustomerId and amount are required' });
    }

    await walletAPI.addBalance(customerId, parseFloat(amount));
    res.json({ success: true, message: `Added ${amount} to customer ${customerId}` });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get balance
app.post('/api/get-balance', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'CustomerId is required' });
    }

    const balance = await walletAPI.getCustomerBalance(customerId);
    res.json({ success: true, balance });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate auth token
app.post('/api/generate-token', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: 'CustomerId is required' });
    }

    const token = await walletAPI.getAuthToken(customerId);
    const sportsbookUrl = `${process.env.SPORTSBOOK_URL}/?operatorToken=${token}`;

    res.json({
      success: true,
      token,
      sportsbookUrl,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete flow: check/create user, add balance, generate token
app.post('/api/sportsbook-login', async (req, res) => {
  try {
    const { username, firstName, lastName, email, country, city, currency, initialBalance } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    let customerId;
    let isNewUser = false;

    // Step 1: Check if user exists
    const existingUser = await walletAPI.getCustomerByMerchantCode(username);

    if (existingUser.success) {
      customerId = existingUser.customerId;
    } else {
      // Step 2: Create new user
      const newUser = await walletAPI.createNewUser({
        username,
        firstName: firstName || 'User',
        lastName: lastName || 'Academy',
        email: email || '',
        country: country || 'US',
        city: city || 'Unknown',
        currencyCode: currency || 'USD'
      });

      customerId = newUser.customerId;
      isNewUser = true;

      // Step 3: Add initial balance for new users
      if (initialBalance && parseFloat(initialBalance) > 0) {
        await walletAPI.addBalance(customerId, parseFloat(initialBalance));
      }
    }

    // Step 4: Get current balance
    const balance = await walletAPI.getCustomerBalance(customerId);

    // Step 5: Generate auth token
    const token = await walletAPI.getAuthToken(customerId);
    const sportsbookUrl = `${process.env.SPORTSBOOK_URL}/?operatorToken=${token}`;

    res.json({
      success: true,
      isNewUser,
      customerId,
      balance,
      token,
      sportsbookUrl,
      expiresIn: '10 minutes'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to test the integration`);
});
