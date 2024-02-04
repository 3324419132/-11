// login.js
Page({
  data: {
    phone: '',
    password: '',
    noLogin:true
  },

  onLoad() {
    let admin=wx.getStorageSync('user')
    console.log('缓存登录信息',admin)
    if(admin && admin.phone && admin.password){
      this.loginData(user.phone,user.password)
    }
    
  },
  // 获取手机号输入
  getPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  // 获取密码输入
  getPassword(e) {
    this.setData({ password: e.detail.value });
  },

  // 登录按钮点击事件
  login() {
    const phone = this.data.phone;
    const password = this.data.password;

    // 查询用户信息
    wx.cloud.database().collection('user').where({ phone: phone ,password:password}).get({
      success: (res) => {
        if (res.data.length > 0 && res.data[0].password === password) {
          // 登录成功
          console.log('登录成功');
          this.setData({
            noLogin:false
          })
          // 将手机号存储在全局数据中
          getApp().globalData.currentUserPhone = phone;
          //2.缓存账号密码用于记录登陆状态
          let user={}
          user.phone=phone
          user.password=password
          wx.setStorageSync('user', user)  //存!!

          wx.switchTab({ url: '/pages/home/home' });
        } else {
          // 登录失败
          wx.showToast({
            title: '手机号或密码错误',
            icon: 'none',
          });
        }
      },
      fail: (error) => {
        console.error('查询用户信息失败', error);
      },
    });
  },
});
