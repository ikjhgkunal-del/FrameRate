const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'testuser1234',
      email: 'test1234@example.com',
      password: 'password123'
    });
    console.log("Registered");
  } catch (err) {
    if (err.response?.status !== 400) console.error("Reg err:", err.message);
  }

  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test1234@example.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log("Got token:", token);

    const reelsRes = await axios.get('http://localhost:5000/api/reels?batch=1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Reels success:", reelsRes.data.reels.length);
  } catch (err) {
    console.error("Error fetching reels:", err.response?.status, err.response?.data);
  }
}
test();
