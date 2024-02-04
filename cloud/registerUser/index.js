// registerUser/index.js
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
const crypto = require('crypto');

// 用于加密密码的函数
function encryptPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

exports.main = async (event, context) => {
  const { phone, password, identification, defaultImageUrl } = event;
  const registerCollection = db.collection('register');
  const userCollection = db.collection('user');
  const currentTime = new Date();

  try {
    // 查询验证码记录
    const queryResult = await registerCollection.where({
      phone: phone
    }).orderBy('createTime', 'desc').limit(1).get();
    if (queryResult.data.length === 0) {
      return { success: false, message: '验证码无效或已过期' };
    }

    const latestRecord = queryResult.data[0];
    const updateTime = latestRecord.updateTime;
    const timeDifference = currentTime - updateTime;

    if (timeDifference > 300000) {
      return { success: false, message: '验证码已失效' };
    }

    if (latestRecord.identification!==identification) {
      return { success: false, message: '验证码错误' };
    }
  
    // 校验密码是否合法
    // 您可以在这里添加密码复杂性的校验逻辑，例如检查密码长度、包含数字和字母等

    // 对用户密码进行加密
    const encryptedPassword = encryptPassword(password);

    // 将用户信息添加到user集合
    await userCollection.add({
      data: {
        phone: phone,
        password: encryptedPassword,
        imageUrl: defaultImageUrl,
        authority: 1,
        nickName:'用户'+phone,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    });

    return { success: true, message: '注册成功' };
  } catch (error) {
    console.error(error);
    return { success: false, message: '注册失败', error: error };
  }
};
