const cloud = require('wx-server-sdk');
cloud.init();

/**
 * 校验用户登录状态的函数
 * @param {string} userId - 用户ID
 * @param {string} token - 用户登录凭证
 * @returns {boolean} - 返回用户登录状态是否有效
 */
async function validateToken(userId, token) {
  try {
    const result = await cloud.callFunction({
      name: 'tokenVerify', // 替换成实际的校验 token 的云函数名
      data: {
        phone: userId,
        token: token
      }
    });
    return result;
  } catch (error) {
    console.error('Token 验证失败:', error);
    throw new Error('Token 验证失败');
  }
}

/**
 * 云函数主函数，用于根据用户 ID 和订单 ID 更新订单状态
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.userId - 用户ID
 * @param {string} event.token - 用户登录凭证
 * @param {string} event.orderId - 订单ID
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、message（返回消息）
 */
exports.main = async (event, context) => {
  const { userId, token, _id,type } = event;
  try {
    // 校验用户登录状态
    await validateToken(userId, token);
    const status=type==0?4:type==1?2:3
    // 更新订单状态为3
    const db = cloud.database();
    console.log(_id)
    const result = await db.collection('dingdan').doc(_id).update({
      data: {
        status: status
      }
    });
    console.log(result)
    return {
      success: true,
      message: '更新订单状态成功'
    };
  } catch (error) {
    console.error('处理更新订单状态时发生错误:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
