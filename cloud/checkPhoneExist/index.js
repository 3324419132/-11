/**
 * 功能：校验手机号是否已存在于用户表中
 * 参数：
 * - phone: 要校验的手机号
 * 返回：
 * - code: 校验结果代码，0 表示手机号已存在，-1 表示手机号不存在
 * - message: 校验结果消息
 */

// 引入云开发模块
const cloud = require('wx-server-sdk');
cloud.init();

// 引入数据库模块
const db = cloud.database();
const usersCollection = db.collection('user');

// 云函数入口函数
exports.main = async (event, context) => {
  const { phone } = event;

  try {
    // 在数据库中查找匹配的手机号记录
    const user = await usersCollection.where({
      phone: phone
    }).get();

    if (user.data.length > 0) {
      // 如果找到匹配的手机号记录，返回手机号已存在
      return {
        code: 0,
        message: '手机号已存在'
      };
    } else {
      // 如果未找到匹配的手机号记录，返回手机号不存在
      return {
        code: -1,
        message: '手机号不存在'
      };
    }
  } catch (error) {
    console.error('云函数执行失败：', error);
    return {
      code: -1,
      message: '校验失败'
    };
  }
};
