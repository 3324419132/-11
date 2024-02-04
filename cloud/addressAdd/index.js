// 云函数入口文件: addressAdd.js
/**
 * 功能：添加地址
 * 参数：
 * - account: 用户账号
 * - name: 收货人姓名
 * - phone: 收货人电话
 * - address: 收货地址
 * - isDefault: 是否设为默认地址
 * - token: 用户身份验证 token
 * 返回：
 * - success: 操作是否成功
 * - message: 操作结果消息
 * - newAddress: 新添加的地址信息（如果成功添加）
 */

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
 * 云函数主函数，用于添加地址
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.account - 用户账号
 * @param {string} event.name - 收货人姓名
 * @param {string} event.phone - 收货人电话
 * @param {Array} event.address - 收货地址数组
 * @param {boolean} event.isDefault - 是否设为默认地址
 * @param {string} event.token - 用户身份验证 token
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、message（操作结果消息）和 newAddress（新添加的地址信息）
 */
exports.main = async (event, context) => {
  const db = cloud.database();
  const addressCollection = db.collection('address');
  const { account, name, phone, address, isDefault, token } = event;

  try {
    // 输入验证
    if (!account || !name || !phone || !address || isDefault === undefined || !token) {
      throw new Error('输入无效，请确保提供了 account、name、phone、address、isDefault 和 token。');
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

    // 更新现有的默认地址
    if (isDefault) {
      await addressCollection.where({
        isDefault: true,
        userId: account
      }).update({
        data: {
          isDefault: false
        }
      });
    }

    // 添加新地址
    const addResult = await addressCollection.add({
      data: {
        userId: account,
        name: name,
        phone: phone,
        address: address,
        isDefault: isDefault,
        createTime: new Date(),
        updateTime: new Date()
      }
    });


    if (addResult._id) {
      const newAddress = await addressCollection.doc(addResult._id).get();
      return { success: true, message: '地址添加成功', newAddress: newAddress.data };
    } else {
      return { success: false, message: '地址添加失败' };
    }
  } catch (e) {
    console.error('处理地址时发生错误:', e);
    return { success: false, message: e.message };
  }
};
