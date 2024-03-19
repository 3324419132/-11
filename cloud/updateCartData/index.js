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
