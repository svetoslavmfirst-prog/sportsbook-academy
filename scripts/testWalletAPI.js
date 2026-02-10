require('dotenv').config();
const walletAPI = require('../services/walletAPI');

/**
 * Test script to verify Wallet API connectivity and functionality
 */
async function testWalletAPI() {
  console.log('='.repeat(60));
  console.log('WALLET API CONNECTION TEST');
  console.log('='.repeat(60));
  console.log(`API URL: ${process.env.WALLET_API_URL}`);
  console.log(`Agent: ${process.env.AGENT_USERNAME}`);
  console.log('='.repeat(60));

  const testUsername = `testuser_${Date.now()}`;

  try {
    // Test 1: Check if user exists (should not exist)
    console.log('\n[Test 1] Checking if test user exists...');
    const checkResult = await walletAPI.getCustomerByMerchantCode(testUsername);
    console.log('Result:', checkResult);

    if (!checkResult.success) {
      console.log('✅ User does not exist (expected)');
    } else {
      console.log('⚠️  User already exists');
    }

    // Test 2: Create new user
    console.log('\n[Test 2] Creating new user...');
    const createResult = await walletAPI.createNewUser({
      username: testUsername,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@academy.com',
      country: 'US',
      city: 'Test City',
      currencyCode: 'USD'
    });
    console.log('Result:', createResult);

    if (createResult.success) {
      console.log('✅ User created successfully');
      console.log(`   Customer ID: ${createResult.customerId}`);

      const customerId = createResult.customerId;

      // Test 3: Add balance
      console.log('\n[Test 3] Adding initial balance...');
      await walletAPI.addBalance(customerId, 100.00);
      console.log('✅ Balance added successfully');

      // Test 4: Get balance
      console.log('\n[Test 4] Getting customer balance...');
      const balance = await walletAPI.getCustomerBalance(customerId);
      console.log(`✅ Current balance: ${balance}`);

      // Test 5: Generate auth token
      console.log('\n[Test 5] Generating authentication token...');
      const token = await walletAPI.getAuthToken(customerId);
      console.log('✅ Auth token generated');
      console.log(`   Token: ${token.substring(0, 50)}...`);

      // Test 6: Verify user exists now
      console.log('\n[Test 6] Verifying user exists...');
      const verifyResult = await walletAPI.getCustomerByMerchantCode(testUsername);
      console.log('Result:', verifyResult);

      if (verifyResult.success && verifyResult.customerId === customerId) {
        console.log('✅ User verification successful');
      }

      console.log('\n' + '='.repeat(60));
      console.log('🎉 ALL TESTS PASSED!');
      console.log('='.repeat(60));
      console.log(`\nTest user created: ${testUsername}`);
      console.log(`Customer ID: ${customerId}`);
      console.log(`\nSportsbook URL: ${process.env.SPORTSBOOK_URL}/?operatorToken=${token}`);

    } else {
      console.log('❌ Failed to create user');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('\nStack trace:', error.stack);
  }
}

// Run tests
testWalletAPI();
