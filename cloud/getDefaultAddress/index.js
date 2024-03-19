const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 验证用户身份验证 token 是否有效
 * @param {string} userId - 用户ID
 * @param {string} token - 用户身份验证 token
 * @returns {boolean} - 返回 token 是否有效
 */
async function validateToken(userId, token) {
  try {
    const result = await cloud.callFunction({
      name: 'tokenVerify',
      data: {
        phone: userId,
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
  const db = cloud.database();
  const addressCollection = db.collection('address');
  const { userId, token } = event;
  console.log(userId)
  console.log(token)
  try {
    // 输入验证
    if (!userId || !token) {
      throw new Error('输入无效，请确保提供了 userId 和 token。');
    }
    console.log(userId)
    console.log(token)
    // 验证 token 是否有效
    const tokenValid = await validateToken(userId, token);

    if (!tokenValid) {
      throw new Error(userId + " | " + token);
    }

    // 获取用户的默认地址
    const result = await addressCollection.where({
      userId: userId,
      isDefault: true
    }).get();

    return {
      success: true,
      data: result.data || [],
      message: '默认地址获取成功'
    };
  } catch (e) {
    console.error('处理获取默认地址时发生错误:', e);
    return {
      success: false,
      message: e.message
    };
  }
};
