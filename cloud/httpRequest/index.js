// 云函数 httpRequest/index.js
const cloud = require('wx-server-sdk');
const axios = require('axios');

cloud.init();

exports.main = async (event, context) => {
  const { url, method, headers } = event;

  try {
    const response = await axios({
      url: url,
      method: method,
      headers: headers,
    });

    return {
      result: response.data
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      error: error
    };
  }
};
