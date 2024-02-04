// sendSMS/index.js
const cloud = require('wx-server-sdk');
cloud.init(); // 初始化云环境
const db = cloud.database(); // 获取数据库的引用

const Core = require('@alicloud/pop-core');
const accessKeyId = process.env.ACCESS_KEY_ID; // 从环境变量获取AccessKey ID
const accessKeySecret = process.env.ACCESS_KEY_SECRET; // 从环境变量获取AccessKey Secret
const SignName = 'BCI'; // 设置短信签名
const TemplateCode = 'SMS_464780990'; // 设置短信模板CODE

var client = new Core({
  accessKeyId: accessKeyId,
  accessKeySecret: accessKeySecret,
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
});

exports.main = async (event, context) => {
  const phoneNumber = event.phone; // 获取传入的手机号码
  const currentTime = new Date();
  const registerCollection = db.collection('register');

  try {
    // 查找是否存在该手机号的记录
    const existingRecord = await registerCollection.where({
      phone: phoneNumber
    }).get();

    let code;
    if (existingRecord.data.length > 0) {
      // 如果存在记录，检查时间间隔是否小于一分钟
      const lastUpdateTime = existingRecord.data[0].updateTime;
      const timeDifference = currentTime - lastUpdateTime;
      if (timeDifference < 60000) {
        // 一分钟内不允许重复发送
        return { success: false, message: '一分钟内不能重复发送验证码' };
      }

      // 更新验证码和更新时间
      code = Math.floor(100000 + Math.random() * 900000).toString(); // 生成6位数字验证码
      await registerCollection.doc(existingRecord.data[0]._id).update({
        data: {
          identification: code,
          updateTime: db.serverDate()
        }
      });
    } else {
      // 不存在记录，则新建记录
      code = Math.floor(100000 + Math.random() * 900000).toString(); // 生成6位数字验证码并转换为字符串
      await registerCollection.add({
        data: {
          phone: phoneNumber,
          identification: code,
          createTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
    }

    // 调用阿里云短信服务发送短信
    const smsResult = await client.request('SendSms', {
      PhoneNumbers: phoneNumber,
      SignName: SignName,
      TemplateCode: TemplateCode,
      TemplateParam: JSON.stringify({ code: code })
    }, {
      method: 'POST'
    });

    if (smsResult.Code === 'OK') {
      return { success: true, message: '验证码发送成功' };
    } else {
      // 短信发送失败，返回相应的错误信息
      return { success: false, message: `短信发送失败: ${smsResult.Message}` };
    }
  } catch (error) {
    console.error(error); // 打印错误信息
    return { success: false, message: '验证码发送失败', error: error };
  }
};
