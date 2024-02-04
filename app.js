// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    // 在小程序的入口文件（通常是 app.js）中初始化云开发
  wx.cloud.init({
    env: 'cloud1-9gueqd6i86209e74', // 云环境的环境ID
    traceUser: true // 是否记录用户访问记录，可以根据需求设置
  });

// 之后你可以在其他小程序页面中使用云开发功能

  },
  globalData: {
    userInfo: null,
    storageURL:'qmxma',
    addressList:[],
    userData:{},
    islogin:false,
    token:'',
    tabbarSwitched:false,//是否从购物页导航到购物车页
  },
  
})
