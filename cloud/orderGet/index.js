// 云函数入口文件: orderGet.js
/**
 * 功能：获取用户的订单列表
 * 参数：
 * - phone: 用户账号
 * - token: 用户身份验证 token
 * 返回：
 * - success: 操作是否成功
 * - data: 获取的订单列表数据
 * - message: 操作结果消息
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

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

/**
 * 云函数主函数，用于获取用户的订单列表
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.phone - 用户账号
 * @param {string} event.token - 用户身份验证 token
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、data（获取的订单列表数据）和 message（操作结果消息）
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const orderCollection = db.collection('dingdan');
  const { phone, token } = event;

  try {
    // 输入验证
    if (!phone || !token) {
      throw new Error('输入无效，请确保提供了 phone 和 token。');
    }

    // 验证 token 是否有效
    const tokenValid = await validateToken(phone, token);
    if (!tokenValid) {
      throw new Error('无效的用户身份验证，请重新登录。');
    }

    // 获取用户的订单列表
    const result = await orderCollection.where({
      userId: phone
    }).orderBy('createTime', 'desc').get(); // 按照创建时间降序排序

    return {
      success: true,
      data: result.data,
      message: '订单获取成功'
    };
  } catch (e) {
    console.error('处理获取订单列表时发生错误:', e);
    return {
      success: false,
      message: e.message
    };
  }
};
