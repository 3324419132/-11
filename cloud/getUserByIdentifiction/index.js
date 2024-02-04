/**
 * 功能：用户登录，生成并更新用户 Token
 * 参数：
 * - phone: 用户手机号
 * - password: 用户密码
 * 返回：
 * - code: 登录结果代码，0 表示登录成功，-1 表示登录失败
 * - message: 登录结果消息
 * - data: 如果登录成功，返回用户记录数据；否则，为空
 */

// 引入云开发模块
const cloud = require('wx-server-sdk');
const crypto = require('crypto'); // 引入crypto模块用于密码加密

cloud.init();

// 引入数据库模块
const db = cloud.database();
const usersCollection = db.collection('user');

// 密码加密函数
function encryptPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

// 生成随机 Token 的函数
function generateToken() {
  // 这里可以使用更为复杂的逻辑生成 Token，这里简化为一个随机字符串
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { phone, password } = event;

  try {
    // 加密用户输入的密码
    const encryptedPassword = encryptPassword(password);

    // 校验账号密码
    const user = await usersCollection.where({
      phone: phone,
      password: encryptedPassword
    }).get();

    if (user.data.length > 0) {
      // 生成新的 Token
      const newToken = generateToken();

      // 更新用户记录中的 Token 字段
      await usersCollection.doc(user.data[0]._id).update({
        data: {
          token: newToken
        }
      });

      // 返回登录成功的信息和用户数据
      return {
        code: 0,
        message: '登录成功',
        data: {
          user: user.data[0],
          token: newToken
        }
      };
    } else {
      // 如果未找到匹配的用户记录，返回登录失败消息
      return {
        code: -1,
        message: '账号或密码错误'
      };
    }
  } catch (error) {
    console.error('云函数执行失败：', error);
    return {
      code: -1,
      message: '登录失败'
    };
  }
};
