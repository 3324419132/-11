// 更新购物车中商品数量的云函数
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

/**
 * 云函数主函数，用于更新购物车中商品数量
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.userId - 用户ID
 * @param {string} event.token - 用户登录凭证
 * @param {string} event._id - 商品在购物车中的唯一标识
 * @param {number} event.goodNum - 更新后的商品数量
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、message（返回消息）
 */
exports.main = async (event, context) => {
  const { userId, token, _id, goodNum } = event;

  try {
    console.log(userId)
    console.log(token)
    // 校验用户登录状态
    const tokenValid = await validateToken(userId, token);
    if (!tokenValid) {
      throw new Error('Token 验证失败');
    }

    // 更新购物车中指定商品的数量
    const db = cloud.database();
    const result = await db.collection('cart').doc(_id).update({
      data: {
        goodNum: goodNum
      }
    });

    if (result.stats.updated === 1) {
      return {
        success: true,
        message: '更新商品数量成功'
      };
    } else {
      return {
        success: false,
        message: '未找到指定商品或更新失败'
      };
    }
  } catch (error) {
    console.error('处理更新商品数量时发生错误:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
