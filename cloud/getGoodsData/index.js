/**
 * 校验用户登录状态的函数
 * @param {string} userId - 用户ID
 * @param {string} token - 用户登录凭证
 * @returns {boolean} - 返回用户登录状态是否有效
 */

const cloud = require('wx-server-sdk');
cloud.init();

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
    throw new Error('Token 验证失败');
  }
}

/**
 * 云函数主函数，用于分页获取商品数据
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.userId - 用户ID
 * @param {string} event.token - 用户登录凭证
 * @param {number} event.index - 分页的页数，从1开始
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、message（返回消息）、data（云数据库返回的数据）
 */
exports.main = async (event, context) => {
  const { userId, token, index } = event;
  try {
    // 校验用户登录状态
    await validateToken(userId, token);

    // 定义每页获取的数据条数
    const pageSize = 10;

    // 计算应该跳过的数据量
    const myIndex = (index == 0) ? 1 : index;
    const skipCount = (myIndex - 1) * pageSize;

    // 查询商品数据，按创建时间降序排列，限制获取 pageSize 条，跳过 skipCount 条
    const db = cloud.database();
    const result = await db.collection('good')
      .orderBy('createTime', 'desc')
      .skip(skipCount)
      .limit(pageSize)
      .get();

    return {
      success: true,
      message: '获取商品数据成功',
      data: result.data
    };
  } catch (error) {
    console.error('处理获取商品数据时发生错误:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
