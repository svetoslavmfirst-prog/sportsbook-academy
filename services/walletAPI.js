const axios = require('axios');
const xml2js = require('xml2js');

class WalletAPIService {
  constructor() {
    this.baseURL = process.env.WALLET_API_URL;
    this.agentUsername = process.env.AGENT_USERNAME;
    this.agentPassword = process.env.AGENT_PASSWORD;
    this.parser = new xml2js.Parser({ explicitArray: false });
  }

  /**
   * Generic method to call Wallet API endpoints
   */
  async callAPI(endpoint, params = {}) {
    try {
      console.log(`[Wallet API] Calling: ${endpoint}`);

      const response = await axios.post(
        `${this.baseURL}${endpoint}`,
        {
          AgentUserName: this.agentUsername,
          AgentPassword: this.agentPassword,
          ...params
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/xml, text/xml, */*'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log(`[Wallet API] Response received`);
      console.log(`[Wallet API] Raw response:`, response.data);

      // Parse XML response to JavaScript object
      const result = await this.parser.parseStringPromise(response.data);
      return result;

    } catch (error) {
      console.error('[Wallet API] Error:', error.message);
      if (error.response) {
        console.error('[Wallet API] Response status:', error.response.status);
        console.error('[Wallet API] Response data:', error.response.data);
      }
      throw new Error(`Wallet API Error: ${error.message}`);
    }
  }

  /**
   * Check if a customer exists by MerchantCustomerCode (username)
   * Returns: { success: true, customerId: "123" } or { success: false, errorCode: "InvalidCustomer" }
   */
  async getCustomerByMerchantCode(merchantCustomerCode) {
    try {
      const result = await this.callAPI(
        '/api/walletservice/WHLCustomers/GetCustomerByMerchantCode',
        { MerchantCustomerCode: merchantCustomerCode }
      );

      const errorCode = result.ErrorCode || result.string?.ErrorCode || '0';

      if (errorCode === '0' || errorCode === 0) {
        const customerId = result.CustomerID || result.string?.CustomerID;
        return {
          success: true,
          customerId: customerId
        };
      }

      return {
        success: false,
        errorCode: errorCode
      };

    } catch (error) {
      console.error('[getCustomerByMerchantCode] Error:', error.message);
      return {
        success: false,
        errorCode: 'API_ERROR',
        error: error.message
      };
    }
  }

  /**
   * Create a new user in the Wallet system
   * Returns: { success: true, customerId: "123" } or throws error
   */
  async createNewUser(userData) {
    try {
      const result = await this.callAPI(
        '/api/walletservice/WHLCustomers/CreateUserNew',
        {
          MerchantCustomerCode: userData.username,
          FirstName: userData.firstName || 'User',
          LastName: userData.lastName || 'Academy',
          City: userData.city || 'Unknown',
          Country: userData.country || 'US',
          CurrencyCode: userData.currencyCode || process.env.CURRENCY_CODE || 'USD',
          Email: userData.email || '',
          Mobile: userData.mobile || '',
          VIP: userData.vip || 1,
          ZipCode: userData.zipCode || '',
          Address1: userData.address1 || '',
          BirthDate: userData.birthDate || ''
        }
      );

      const errorCode = result.ErrorCode || result.string?.ErrorCode;

      if (errorCode === '0' || errorCode === 0 || errorCode === 'NoError') {
        const customerId = result.CustomerID || result.string?.CustomerID;
        return {
          success: true,
          customerId: customerId
        };
      }

      throw new Error(`Failed to create user: ${errorCode}`);

    } catch (error) {
      console.error('[createNewUser] Error:', error.message);
      throw error;
    }
  }

  /**
   * Add balance to a user's wallet (Transfer TO wallet)
   * Returns: true if successful, throws error otherwise
   */
  async addBalance(customerId, amount) {
    try {
      // Generate unique transaction ID
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const result = await this.callAPI(
        '/api/walletservice/WHLCustomers/TransferToWHL',
        {
          CustomerID: customerId,
          Amount: parseFloat(amount).toFixed(2),
          MerchantTransactionID: transactionId
        }
      );

      const errorCode = result.ErrorCode || result.string?.ErrorCode;

      if (errorCode === '0' || errorCode === 0 || errorCode === 'NoError') {
        console.log(`[addBalance] Successfully added ${amount} to customer ${customerId}`);
        return true;
      }

      throw new Error(`Failed to add balance: ${errorCode}`);

    } catch (error) {
      console.error('[addBalance] Error:', error.message);
      throw error;
    }
  }

  /**
   * Get authentication token for customer login
   * Returns: loginToken (string) or throws error
   */
  async getAuthToken(customerId) {
    try {
      const result = await this.callAPI(
        '/api/walletservice/WHLCustomers/GetCustomerAuthToken',
        { CustomerID: customerId }
      );

      const errorCode = result.ErrorCode || result.string?.ErrorCode;

      if (errorCode === '0' || errorCode === 0 || errorCode === 'NoError') {
        const loginToken = result.LoginToken || result.string?.LoginToken;

        if (!loginToken) {
          throw new Error('No LoginToken returned from API');
        }

        console.log(`[getAuthToken] Token generated for customer ${customerId}`);
        return loginToken;
      }

      throw new Error(`Failed to get auth token: ${errorCode}`);

    } catch (error) {
      console.error('[getAuthToken] Error:', error.message);
      throw error;
    }
  }

  /**
   * Get customer balance
   * Returns: balance amount or throws error
   */
  async getCustomerBalance(customerId) {
    try {
      const result = await this.callAPI(
        '/api/walletservice/WHLCustomers/GetCustomerBalance',
        { CustomerID: customerId }
      );

      const errorCode = result.ErrorCode || result.string?.ErrorCode;

      if (errorCode === '0' || errorCode === 0 || errorCode === 'NoError') {
        const balance = result.Balance || result.string?.Balance || '0';
        return parseFloat(balance);
      }

      throw new Error(`Failed to get balance: ${errorCode}`);

    } catch (error) {
      console.error('[getCustomerBalance] Error:', error.message);
      throw error;
    }
  }
}

module.exports = new WalletAPIService();
