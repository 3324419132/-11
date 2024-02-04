// 云函数入口文件: tokenVerify.js
/**
 * 功能：验证用户的token是否有效
 * 参数：
 * - phone: 用户账号（手机号）
 * - token: 用户传递的token
 * 返回：
 * - success: 验证是否成功
 * - message: 验证结果消息
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const db = cloud.database();
  const userCollection = db.collection('user');
  const { phone, token } = event;

  try {
    // 查询用户信息
    const userResult = await userCollection.where({
      phone: phone,
      token: token
    }).get();

    if (userResult.data.length > 0) {
      const userRecord = userResult.data[0];

      // 验证token是否有效，且距离最近更新不超过1小时
      const currentTime = new Date();
      const lastUpdateTime = userRecord.updateTime;

      const timeDifference = currentTime - lastUpdateTime;
      const oneHourInMilliseconds = 60 * 60 * 1000;

      if (timeDifference <= oneHourInMilliseconds) {
        // 用户存在且token有效且在1小时内更新
        return true;
      } else {
        // Token距离最近更新超过1小时，需要重新登录
        return false;
      }
    } 
    else {
      // 用户不存在或token无效
      return false;
    }
  } catch (e) {
    console.error('Token验证失败:', e);
    return false;
  }
};
