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
    throw new Error('Token 验证失败');
  }
}

/**
 * 云函数主函数，用于根据搜索框文本对 dingdan 数据库进行筛选，并进行分页查询
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.userId - 用户ID
 * @param {string} event.token - 用户登录凭证
 * @param {string} event.searchText - 搜索框的文本
 * @param {number} event.index - 分页的页数，从1开始
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、message（返回消息）、data（云数据库返回的数据）
 */
exports.main = async (event, context) => {
  const { userId, token, searchText, index } = event;
  try {
    // 校验用户登录状态
    await validateToken(userId, token);

    // 定义每页获取的数据条数
    const pageSize = 10;

    // 计算应该跳过的数据量
    const myIndex = (index == 0) ? 1 : index;
    const skipCount = (myIndex - 1) * pageSize;

    if (searchText == null || searchText == undefined || searchText == '') {
      return {
        success: true,
        message: '获取商品数据成功',
        data: []
      };
    }

    // 构建模糊查询条件
    const searchCondition = {
      _openid: userId, // 添加对用户的判断
      items: {
        $elemMatch: {
          name: cloud.database().RegExp({
            regexp: searchText,
            options: 'i',
          }),
        },
      },
    };

    // 查询订单数据，限制获取 pageSize 条，跳过 skipCount 条
    const db = cloud.database();
    const result = await db.collection('dingdan')
      .where(searchCondition)
      .skip(skipCount)
      .limit(pageSize)
      .get();

    return {
      success: true,
      message: '获取订单数据成功',
      data: result.data
    };
  } catch (error) {
    console.error('处理获取订单数据时发生错误:', error);
    return {
      success: false,
      message: error.message
    };
  }
};
