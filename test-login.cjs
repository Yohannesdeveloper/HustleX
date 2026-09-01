const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with admin@hustlex.com...');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@hustlex.com',
      password: 'admin123'
    });
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin();
