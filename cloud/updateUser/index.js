/**
 * 云函数入口文件：updateUserInfo
 * 功能：根据传入的参数更新用户信息，包括用户权限、手机号、头像地址、昵称等信息。支持更新密码操作。
 * 参数：
 * - event._id: 用户ID
 * - event.authority: 用户权限（数字）
 * - event.phone: 用户手机号
 * - event.imageUrl: 用户头像地址
 * - event.nickName: 用户昵称
 * - event.type: 操作类型，1表示需要更新密码，0表示不更新密码
 * - event.password: 新密码（如果需要更新密码）
 * - event.oldPassword: 旧密码（用于验证身份，仅在type为1时需要）
 * 返回：
 * - code: 操作结果代码，0表示成功，-1表示失败
 * - message: 操作结果消息
 * - data: 更新的数据条数（成功更新的数据条数）
 */

const cloud = require('wx-server-sdk');
const crypto = require('crypto'); // 引入crypto模块

cloud.init();
const db = cloud.database();
const usersCollection = db.collection('user');

// 密码加密函数
function encryptPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}


exports.main = async (event, context) => {
  const { _id, authority, phone, imageUrl, nickName, type, password, oldPassword } = event;

  try {
    // 根据type判断是否需要更新密码
    if (type === 1) {
      // 需要更新密码，首先校验旧密码
      const encryptedOldPassword = encryptPassword(oldPassword);
      const user = await usersCollection.doc(_id).get();

      if (user.data.length === 0 || user.data[0].password !== encryptedOldPassword) {
        return { code: -1, message: '旧密码错误', data: 0 };
      }

      // 更新密码
      const encryptedNewPassword = encryptPassword(password);
      return updateUser(_id, authority, phone, encryptedNewPassword, imageUrl, nickName);
    } else {
      // 不更新密码
      return updateUser(_id, authority, phone, null, imageUrl, nickName);
    }
  } catch (error) {
    console.error('云函数执行失败：', error);
    return { code: -1, message: '更新失败', data: 0 };
  }
};

/**
 * 辅助函数，用于更新用户信息
 * @param {string} _id - 用户ID
 * @param {number} authority - 用户权限
 * @param {string} phone - 用户手机号
 * @param {string} password - 用户密码
 * @param {string} imageUrl - 用户头像地址
 * @param {string} nickName - 用户昵称
 * @returns {Object} - 返回操作结果，包括 code（操作结果代码），message（操作结果消息）和 data（更新的数据条数）
 */
async function updateUser(_id, authority, phone, password, imageUrl, nickName) {
  const updateTime = new Date();
  const updateData = {
    authority: authority,
    phone: phone,
    imageUrl: imageUrl,
    nickName: nickName,
    updateTime: updateTime
  };

  if (password) {
    updateData.password = password;
  }

  try {
    // 更新用户信息
    const result = await usersCollection.doc(_id).update({ data: updateData });

    return {
      code: 0,
      message: '更新成功',
      data: result.stats.updated
    };
  } catch (error) {
    // 更新失败时返回错误信息
    console.error('用户信息更新失败：', error);
    return { code: -1, message: '更新失败', data: 0 };
  }
}
