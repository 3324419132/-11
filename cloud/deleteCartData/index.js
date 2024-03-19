// 云函数：删除购物车中的记录
const cloud = require('wx-server-sdk');
cloud.init();

/**
 * 验证用户身份验证 token 是否有效
 * @param {string} userId - 用户ID
 * @param {string} token - 用户身份验证 token
 * @returns {boolean} - 返回 token 是否有效
 */
async function validateToken(userId, token) {
  try {
    // 调用另一个云函数进行 token 验证
    const result = await cloud.callFunction({
      name: 'tokenVerify',
      data: {
        userId: userId,
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
  const { userId, token, _id } = event;

  try {
    // 验证 token 是否有效
    const tokenValid = await validateToken(userId, token);
    if (!tokenValid) {
      throw new Error('Token 验证失败');
    }

    // 删除购物车中的记录
    const db = cloud.database();
    const cartCollection = db.collection('cart');
    console.log("传进来的userId："+userId)
    console.log("传进来的_id："+_id)
    const result = await cartCollection
      .where({
        userId: userId,
        _id: _id
      })
      .remove();

    if (result.stats.removed > 0) {
      return {
        success: true,
        message: '记录删除成功'
      };
    } else {
      return {
        success: false,
        message: '未找到匹配的记录'
      };
    }
  } catch (error) {
    console.error('删除记录失败：', error);
    return {
      success: false,
      message: '删除记录失败'
    };
  }
};
