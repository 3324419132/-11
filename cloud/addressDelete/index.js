// 云函数入口文件: addressDelete.js
/**
 * 功能：删除地址
 * 参数：
 * - account: 用户账号
 * - addressId: 要删除的地址ID
 * - token: 用户身份验证 token
 * 返回：
 * - success: 操作是否成功
 * - data: 删除操作的结果
 * - message: 操作结果消息
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 验证用户身份验证 token 是否有效
 * @param {string} account - 用户账号
 * @param {string} token - 用户身份验证 token
 * @returns {boolean} - 返回 token 是否有效
 */
async function validateToken(account, token) {
  try {
    const result = await cloud.callFunction({
      name: 'tokenVerify',
      data: {
        phone: account,
        token: token
      }
    });

    return result;
  } catch (error) {
    console.error('Token 验证失败:', error);
    return false;
  }
}

/**
 * 云函数主函数，用于删除地址
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.account - 用户账号
 * @param {string} event.addressId - 要删除的地址ID
 * @param {string} event.token - 用户身份验证 token
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、data（删除操作的结果）和 message（操作结果消息）
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const addressCollection = db.collection('address');
  const { account, addressId, token } = event;

  try {
    // 输入验证
    if (!account || !addressId || !token) {
      throw new Error('输入无效，请确保提供了 account、addressId 和 token。');
    }

    // 验证 token 是否有效
    const tokenValid = await validateToken(account, token);
    if (!tokenValid) {
      throw new Error('无效的用户身份验证，请重新登录。');
    }

    // 删除地址
    const result = await addressCollection.where({
      userId: account,
      _id: addressId
    }).remove();

    return {
      success: true,
      data: result,
      message: '地址删除成功'
    };
  } catch (e) {
    console.error('处理删除地址时发生错误:', e);
    return {
      success: false,
      message: e.message
    };
  }
};
