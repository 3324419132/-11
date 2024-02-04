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

/**
 * 云函数主函数，用于存储或更新订单数据
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.userId - 用户ID
 * @param {string} event.orderId - 订单ID
 * @param {number} event.totalPrice - 订单总金额
 * @param {number} event.status - 订单状态
 * @param {Array} event.items - 订单商品列表
 * @param {string} event.consignee - 收货人姓名
 * @param {string} event.phone - 收货人手机号
 * @param {Array} event.address - 收货地址
 * @param {string} event.notes - 订单备注
 * @param {string} event.token - 用户身份验证 token
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）和 message（操作结果消息）
 */
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
