const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 验证用户身份验证 token 是否有效
 * @param {string} userId - 用户ID
 * @param {string} token - 用户身份验证 token
 * @returns {boolean} - 返回 token 是否有效
 */
async function validateToken(userId, token) {
  try {
    // 调用名为 'tokenVerify' 的云函数验证用户 token 是否有效
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
  const { userId, orderId, totalPrice, status, items, consignee, phone, address, notes, token,reduction } = event;

  try {
    // 验证 token 是否有效
    const tokenValid = await validateToken(userId, token);
    if (!tokenValid) {
      throw new Error('Token 验证失败');
    }

    // 在云数据库中创建或更新订单信息
    const result = await db.collection('dingdan').where({
      userId: userId,
      orderId: orderId
    }).update({
      data: {
        userId: userId,
        orderId: orderId,
        totalPrice: totalPrice,
        status: status,
        items: items,
        consignee: consignee,
        phone: phone,
        address: address,
        notes: notes,
        updateTime: new Date()
      }
    });

    // 如果订单不存在，则插入新的订单数据
    if (result.stats.updated === 0) {
      await db.collection('dingdan').add({
        data: {
          userId: userId,
          orderId: orderId,
          totalPrice: totalPrice,
          status: status,
          items: items,
          consignee: consignee,
          phone: phone,
          address: address,
          notes: notes,
          reduction:reduction,
          createTime: new Date(),
          updateTime: new Date()
        }
      });
    }

    return {
      success: true,
      message: '订单数据存储成功'
    };
  } catch (error) {
    console.error('存储订单数据时发生错误:', error);
    return {
      success: false,
      message: '存储订单数据失败'
    };
  }
};
