const cloud = require('wx-server-sdk');
const request = require('request-promise');
cloud.init();

/**
 * 验证用户身份验证 token 是否有效
 * @param {string} phone - 用户账号
 * @param {string} token - 用户身份验证 token
 * @returns {boolean} - 返回 token 是否有效
 */
async function validateToken(phone, token) {
  try {
    const result = await cloud.callFunction({
      name: 'tokenVerify',
      data: {
        phone: phone,
        token: token
      }
    });
    return result;
  } catch (error) {
    console.error('Token 验证失败:', error);
    return false;
  }
}


exports.main = async (event, context) => {
  const { number, phone, token } = event;
  const appCode = process.env.appCode;

  try {
    console.log('phone:', phone);
    console.log('token:', token);

    // 输入验证
    if (!phone || !token) {
      throw new Error('输入无效，请确保提供了 phone 和 token。');
    }

    // 验证 token 是否有效
    const tokenValid = await validateToken(phone, token);
    console.log(tokenValid)
    if (!tokenValid) {
      throw new Error('Token 验证失败');
    }

    const apiUrl = 'http://express.api.bdymkt.com/lundear/expressTracking';
    const queryString = `?number=${number}&com=null&mobile=null`;

    const url = `${apiUrl}${queryString}`;
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Bce-Signature': 'AppCode/c7da3563e4164f52baf9099cdbcb6bb6',
    };

    const options = {
      uri: url,
      method: 'GET',
      headers: headers,
      json: true, // 自动将响应体解析为 JSON
    };

    const body = await request(options);

    return {
      success: true,
      data: body.data,
      message: '物流信息查询成功',
    };
  } catch (error) {
    console.error('物流信息查询失败:', error);
    return {
      success: false,
      data: error,
      message: '物流信息查询失败',
    };
  }
};
