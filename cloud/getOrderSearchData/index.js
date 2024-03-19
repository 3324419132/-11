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
