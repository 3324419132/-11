// 云函数入口文件: addressGet.js
/**
 * 功能：获取用户的地址列表
 * 参数：
 * - account: 用户账号
 * - token: 用户身份验证 token
 * 返回：
 * - success: 操作是否成功
 * - data: 获取的地址列表数据
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
    return result
  } catch (error) {
    console.error('Token 验证失败:', error);
    return false;
  }
}

/**
 * 云函数主函数，用于获取用户的地址列表
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.account - 用户账号
 * @param {string} event.token - 用户身份验证 token
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、data（获取的地址列表数据）和 message（操作结果消息）
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const addressCollection = db.collection('address');
  const { account, token } = event;

  try {
    // 输入验证
    if (!account || !token) {
      throw new Error('输入无效，请确保提供了 account 和 token。');
    }

    // 验证 token 是否有效
    const tokenValid = await validateToken(account, token);
    if (!tokenValid) {
      throw new Error(account+" | "+token);
    }

    // 获取用户的地址列表
    const result = await addressCollection.where({
      userId: account
    }).orderBy('createTime', 'desc').get(); // 按照创建时间降序排序

    return {
      success: true,
      data: result.data,
      message: '地址获取成功'
    };
  } 
  catch (e) {
    console.error('处理获取地址列表时发生错误:', e);
    return {
      success: false,
      message: e.message
    };
  }
};
