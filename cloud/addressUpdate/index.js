// 云函数入口文件: addressUpdate.js


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

    return result;
  } catch (error) {
    console.error('Token 验证失败:', error);
    return false;
  }
}


/**
 * 云函数主函数，用于更新用户的地址
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event._id - 要更新的地址ID
 * @param {string} event.account - 用户账号
 * @param {string} event.name - 收货人姓名
 * @param {string} event.phone - 收货人电话
 * @param {Array} event.address - 收货地址
 * @param {boolean} event.isDefault - 是否设为默认地址
 * @param {string} event.token - 用户身份验证 token
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）和 message（操作结果消息）
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const addressCollection = db.collection('address');
  const { _id, account, name, phone, address, isDefault, token } = event;

  try {
    // 输入验证
    if (!_id || !account || !name || !phone || !address || isDefault === undefined || !token) {
      throw new Error('输入无效，请确保提供了 _id、account、name、phone、address、isDefault 和 token。');
    }

    // 验证手机号格式
    const phoneRegex = /^1[3456789]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('无效的手机号格式。');
    }

    // 验证 isDefault
    if (typeof isDefault !== 'boolean') {
      throw new Error('无效的 isDefault 值，应为布尔型。');
    }

    // 验证 token 是否有效
    const tokenValid = await validateToken(account, token);
    if (!tokenValid) {
      throw new Error('无效的用户身份验证，请重新登录。');
    }

    // 如果更新后的地址要设为默认地址
    if (isDefault) {
      // 首先将之前的默认地址取消默认
      await addressCollection.where({
        isDefault: true,
        userId: account
      }).update({
        data: {
          isDefault: false
        }
      });
    }

    // 更新地址数据
    const updateResult = await addressCollection.doc(_id).update({
      data: {
        userId: account,
        name: name,
        phone: phone,
        address: address,
        isDefault: isDefault,
        updateTime: new Date()
      }
    });

    if (updateResult.stats.updated === 1) {
      return { success: true, message: '地址更新成功' };
    } else {
      return { success: false, message: '地址更新失败' };
    }
  } catch (e) {
    console.error('处理地址更新时发生错误:', e);
    return { success: false, message: e.message };
  }
};
