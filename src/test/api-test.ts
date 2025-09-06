import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

interface TestResults {
  passed: number;
  failed: number;
  results: string[];
}

class APITester {
  private results: TestResults = { passed: 0, failed: 0, results: [] };

  async runTests() {
    console.log('🚀 Starting API Tests...\n');

    await this.testHealthCheck();
    await this.testCreateShortUrl();
    await this.testCreateShortUrlWithCustomCode();
    await this.testCreateShortUrlInvalidUrl();
    await this.testCreateShortUrlDuplicateCode();
    await this.testRedirect();
    await this.testGetStats();
    await this.testGetAllUrls();

    this.printSummary();
  }

  private async testHealthCheck() {
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      this.assert(response.status === 200, 'Health check should return 200');
      this.assert(response.data.status === 'OK', 'Health check should return OK status');
      this.log('✅ Health check test passed');
    } catch (error) {
      this.log('❌ Health check test failed');
      this.results.failed++;
    }
  }

  private async testCreateShortUrl() {
    try {
      const response = await axios.post(`${BASE_URL}/api/shorturls`, {
        url: 'https://www.example.com',
        validity: 60
      });

      this.assert(response.status === 201, 'Should return 201 status');
      this.assert(response.data.shortLink, 'Should return shortLink');
      this.assert(response.data.expiry, 'Should return expiry');
      this.log('✅ Create short URL test passed');
    } catch (error) {
      this.log('❌ Create short URL test failed');
      this.results.failed++;
    }
  }

  private async testCreateShortUrlWithCustomCode() {
    try {
      const response = await axios.post(`${BASE_URL}/api/shorturls`, {
        url: 'https://www.google.com',
        validity: 30,
        shortcode: 'google123'
      });

      this.assert(response.status === 201, 'Should return 201 status');
      this.assert(response.data.shortLink.includes('google123'), 'Should use custom shortcode');
      this.log('✅ Create short URL with custom code test passed');
    } catch (error) {
      this.log('❌ Create short URL with custom code test failed');
      this.results.failed++;
    }
  }

  private async testCreateShortUrlInvalidUrl() {
    try {
      const response = await axios.post(`${BASE_URL}/api/shorturls`, {
        url: 'invalid-url'
      });
      this.log('❌ Should have failed for invalid URL');
      this.results.failed++;
    } catch (error: any) {
      this.assert(error.response?.status === 400, 'Should return 400 for invalid URL');
      this.log('✅ Invalid URL test passed');
    }
  }

  private async testCreateShortUrlDuplicateCode() {
    try {
      // Try to create with the same shortcode again
      const response = await axios.post(`${BASE_URL}/api/shorturls`, {
        url: 'https://www.github.com',
        shortcode: 'google123'
      });
      this.log('❌ Should have failed for duplicate shortcode');
      this.results.failed++;
    } catch (error: any) {
      this.assert(error.response?.status === 409, 'Should return 409 for duplicate shortcode');
      this.log('✅ Duplicate shortcode test passed');
    }
  }

  private async testRedirect() {
    try {
      // Test redirect (should return 301)
      const response = await axios.get(`${BASE_URL}/google123`, {
        maxRedirects: 0,
        validateStatus: (status) => status === 301
      });

      this.assert(response.status === 301, 'Should return 301 redirect');
      this.assert(response.headers.location === 'https://www.google.com', 'Should redirect to correct URL');
      this.log('✅ Redirect test passed');
    } catch (error) {
      this.log('❌ Redirect test failed');
      this.results.failed++;
    }
  }

  private async testGetStats() {
    try {
      const response = await axios.get(`${BASE_URL}/api/shorturls/google123`);

      this.assert(response.status === 200, 'Should return 200 status');
      this.assert(response.data.shortcode === 'google123', 'Should return correct shortcode');
      this.assert(response.data.clickCount >= 0, 'Should return click count');
      this.assert(Array.isArray(response.data.clicks), 'Should return clicks array');
      this.log('✅ Get stats test passed');
    } catch (error) {
      this.log('❌ Get stats test failed');
      this.results.failed++;
    }
  }

  private async testGetAllUrls() {
    try {
      const response = await axios.get(`${BASE_URL}/api/shorturls`);

      this.assert(response.status === 200, 'Should return 200 status');
      this.assert(Array.isArray(response.data), 'Should return array of URLs');
      this.log('✅ Get all URLs test passed');
    } catch (error) {
      this.log('❌ Get all URLs test failed');
      this.results.failed++;
    }
  }

  private assert(condition: boolean, message: string) {
    if (condition) {
      this.results.passed++;
    } else {
      this.results.failed++;
      throw new Error(message);
    }
  }

  private log(message: string) {
    console.log(message);
    this.results.results.push(message);
  }

  private printSummary() {
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
  }
}

// Run tests
const tester = new APITester();
tester.runTests().catch(console.error);
