const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 生成订单编号
 * @param {string} phoneNumber - 用户手机号
 * @returns {string} - 返回生成的订单编号
 */
function generateOrderNumber(phoneNumber) {
  // 获取当前时间戳，精确到毫秒
  const timestamp = new Date().getTime().toString();
  
  // 生成随机数，取整，确保是六位数
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  // 截取手机号的后六位，确保是六位数
  const phoneNumberSuffix = phoneNumber.slice(-6).padStart(6, '0');
  
  // 将手机号码分成三部分
  const part1 = phoneNumber.slice(0, 3);
  const part2 = phoneNumber.slice(3, 7);
  const part3 = phoneNumber.slice(7);
  
  // 随机选择插入位置或者按照特定规则插入
  const insertionIndex = Math.random() > 0.5 ? 
    Math.floor(Math.random() * (timestamp.length + 1)) : // 随机位置
    Math.floor(timestamp.length / 2); // 特定规则位置
  
  // 插入手机号的各部分到订单编号
  let orderNumber = (
    timestamp.slice(0, insertionIndex) +
    part1 +
    timestamp.slice(insertionIndex, insertionIndex + 3) +
    part2 +
    timestamp.slice(insertionIndex + 3) +
    part3 +
    random +
    phoneNumberSuffix
  );

  // 截取订单号的前 12 位
  const truncatedOrderNumber = orderNumber.slice(0, 12);

  // 随机生成插入字符串，可以根据需要修改
  const charactersToAdd = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 可以根据需要修改
  const numberOfCharacters = Math.floor(Math.random() * 5) + 1; // 随机插入 1 到 5 个字符

  let insertedCharacters = '';
  for (let i = 0; i < numberOfCharacters; i++) {
    const randomCharacter = charactersToAdd[Math.floor(Math.random() * charactersToAdd.length)];
    insertedCharacters += randomCharacter;
  }

  // 插入字符串到订单号中间，保证最终长度为 15
  const middleIndex = Math.floor(truncatedOrderNumber.length / 2);
  orderNumber = (
    truncatedOrderNumber.slice(0, middleIndex) +
    insertedCharacters +
    truncatedOrderNumber.slice(middleIndex)
  );

  return orderNumber;
}


/**
 * 生成微信支付签名
 * @param {Object} params - 微信支付参数，包括 totalAmount（总金额）、orderNumber（订单编号）、timestamp（支付时间）
 * @param {string} apiSecret - 微信支付接口密钥
 * @returns {string} - 返回生成的微信支付签名
 */
function generateWechatPaySignature(params, apiSecret) {
  const stringA = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  const stringSignTemp = `${stringA}&key=${apiSecret}`;
  const sign = crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
  return sign;
}

/**
 * 验证用户身份验证 token 是否有效
 * @param {string} phoneNumber - 用户手机号
 * @param {string} token - 用户身份验证 token
 * @returns {boolean} - 返回 token 是否有效
 */
async function validateToken(phoneNumber, token) {
  try {
    const result = await cloud.callFunction({
      name: 'tokenVerify',
      data: {
        phone: phoneNumber,
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
 * 获取用户的 OpenID
 * @returns {string} - 返回用户的 OpenID
 */
function getOpenId() {
  // 通过 wx.cloud.getWXContext() 获取用户上下文，包含 openid 等信息
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  return openid;
}

/**
 * 云函数主函数，用于生成订单编号并发起微信支付
 * @param {Object} event - 云函数调用时传入的参数
 * @param {string} event.phoneNumber - 用户手机号
 * @param {string} event.token - 用户身份验证 token
 * @param {number} event.totalAmount - 总金额
 * @param {Object} context - 云函数调用上下文
 * @returns {Object} - 返回操作结果，包括 success（是否成功）、data（生成的订单编号）、payParams（微信支付参数）
 */
exports.main = async (event, context) => {
  const { phoneNumber, token, totalAmount } = event;

  try {
    // 输入验证
    if (!phoneNumber || !token || !totalAmount) {
      throw new Error('用户手机号、token和总金额不能为空');
    }

    // 获取用户的 OpenID
    const openid = getOpenId();

    // 验证 token 是否有效
    const tokenValid = await validateToken(phoneNumber, token);
    if (!tokenValid) {
      throw new Error('Token 验证失败');
    }

    // 生成订单编号
    const orderNumber = generateOrderNumber(phoneNumber);

    // 获取当前时间戳，精确到秒
    const timestamp = Math.floor(new Date().getTime() / 1000);

    // TODO: 替换为你的微信支付密钥
    const wechatPayApiSecret = 'YOUR_WECHAT_PAY_API_SECRET';

    // 构造微信支付参数
    const wechatPayParams = {
      appid: 'YOUR_WECHAT_APP_ID', // 微信小程序的 APPID
      mch_id: 'YOUR_WECHAT_MCH_ID', // 微信支付商户号
      nonce_str: Math.random().toString(36).substr(2, 15), // 随机字符串，防重发
      body: '商品描述', // 商品描述
      out_trade_no: orderNumber, // 商户订单号，需保持唯一性
      total_fee: totalAmount * 100, // 微信支付金额单位为分，需转换为整数
      spbill_create_ip: '127.0.0.1', // 终端 IP，用户的实际 IP
      notify_url: 'YOUR_WECHAT_PAY_NOTIFY_URL', // 支付结果通知的回调地址
      trade_type: 'JSAPI', // 小程序取值如下：JSAPI
      openid: openid, // 用户的 OpenID
      time_start: timestamp, // 订单生成时间，格式为yyyyMMddHHmmss
      time_expire: timestamp + 600, // 订单过期时间为当前时间后600秒
    };

    // 生成微信支付签名
    wechatPayParams.sign = generateWechatPaySignature(wechatPayParams, wechatPayApiSecret);

    return {
      success: true,
      data: orderNumber,
      payParams: wechatPayParams,
    };
  } 
  catch (e) {
    console.error('处理生成订单并发起微信支付时发生错误:', e);
    return {
      success: false,
      message: e.message
    };
  }
};
