// 在 register.js 中存储订单信息到云开发数据库
const db = wx.cloud.database();
let searchKey = '';

// 验证电话号码格式
function isValidPhoneNumber(phoneNumber) {
  const phoneRegex = /^1\d{10}$/;
  return phoneRegex.test(phoneNumber);
}

Page({
  data: {
    phone: "",
    password: "",
    confirmPassword: "", // 新添加的确认密码字段
  },

  inputPhone(e) {
    const phoneNumber = e.detail.value;
    if (!isValidPhoneNumber(phoneNumber)) {
      wx.showToast({
        title: '请输入有效的电话号码',
        icon: 'none'
      });
    } else {
      this.setData({
        phone: phoneNumber,
      });
    }
  },

  inputPassword(e) {
    this.setData({ password: e.detail.value });
  },

  inputConfirmPassword(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  register() {
    // 获取用户输入的电话、密码和确认密码
    const phone = this.data.phone;
    const password = this.data.password;
    const confirmPassword = this.data.confirmPassword;

    // 检查手机号和密码是否符合规范
    if (!isValidPhoneNumber(phone)) {
      wx.showToast({ title: '请输入有效的电话号码', icon: 'none' });
      return;
    }

    if (password.length < 6 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      wx.showToast({ title: '密码至少6位，包含数字和字母', icon: 'none' });
      return;
    }

    // 检查密码和确认密码是否匹配
    if (password !== confirmPassword) {
      wx.showToast({ title: '密码与确认密码不匹配', icon: 'none' });
      return;
    }

    // 在注册之前查询是否手机号已经被注册
    const userCollection = db.collection('user');
    userCollection.where({ phone: phone }).get({
      success: (res) => {
        if (res.data.length > 0) {
          // 手机号已经被注册
          wx.showToast({ title: '该手机号已被注册', icon: 'none' });
        } else {
          // 该手机号尚未注册，进行注册操作
          const registerInfo = {
            phone: phone,
            password: password,
          };

          // 将用户信息存储到云开发数据库
          userCollection.add({
            data: registerInfo,
            success: (res) => {
              console.log("用户注册成功", res);
              wx.showToast({ title: '注册成功', icon: 'success' });
              // 清空输入框
              this.setData({ phone: '', password: '', confirmPassword: '' });
            },
            fail: (err) => {
              console.error('用户注册失败', err);
            },
          });
        }
      },
      fail: (err) => {
        console.error('查询手机号是否已注册失败', err);
      },
    });
  },
});
