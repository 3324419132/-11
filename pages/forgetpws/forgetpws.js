// 在 resetPassword.js 中实现密码重置逻辑
const db = wx.cloud.database();

Page({
  data: {
    phone: "",
    password: "",
    confirmPassword: "",
  },

  inputPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  inputPassword(e) {
    this.setData({ password: e.detail.value });
  },

  inputConfirmPassword(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  resetPassword() {
    const phone = this.data.phone;
    const password = this.data.password;
    const confirmPassword = this.data.confirmPassword;

    if (!isValidPhoneNumber(phone)) {
      wx.showToast({ title: '请输入有效的电话号码', icon: 'none' });
      return;
    }

    if (password.length < 6 || !/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      wx.showToast({ title: '新密码至少6位，包含数字和字母', icon: 'none' });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({ title: '新密码与确认密码不匹配', icon: 'none' });
      return;
    }

    const userCollection = db.collection('user');
    userCollection.where({ phone: phone }).get({
      success: (res) => {
        if (res.data.length === 0) {
          wx.showToast({ title: '该手机号尚未注册', icon: 'none' });
        } else {
          const userId = res.data[0]._id;
          userCollection.doc(userId).update({
            data: {
              password: password,
            },
            success: (res) => {
              console.log("密码重置成功", res);
              wx.showToast({ title: '密码重置成功', icon: 'success' });
              this.setData({ phone: '', password: '', confirmPassword: '' });
            },
            fail: (err) => {
              console.error('密码重置失败', err);
            },
          });
        }
      },
      fail: (err) => {
        console.error('查询手机号失败', err);
      },
    });
  },
});
