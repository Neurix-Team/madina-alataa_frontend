const axios = require('axios');

async function testPost() {
  try {
    const res = await axios.post('http://localhost:5128/api/mission', {
      title: "Test",
      description: "Test desc",
      difficulty: 1,
      requiredLevel: 1,
      kpReward: 1,
      xpReward: 1,
      impactReward: 1,
      tags: ["general"]
    });
    console.log("Success", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error Status:", err.response.status);
      console.log("Error Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.log("Other Error:", err.message);
    }
  }
}

testPost();
