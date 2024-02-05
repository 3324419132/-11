// pages/denglu/denglu.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app=getApp()
Page({
  //刷新页面方法√
  onPullDownRefresh: function () {
    // 下拉刷新时执行的逻辑
    const user = wx.getStorageSync('user'); // 从本地缓存获取 user 数据//我加的

    if (user) {
      // 如果从本地缓存中成功获取到 user 数据
      this.setData({
        userInfo: user,
      });
      const currentUserPhone = user.phone;
      this.setData({
        currentUserPhone: currentUserPhone,
      });
      console.log('current现在:',currentUserPhone)
      // 在这里可以执行其他逻辑，例如从服务器获取最新用户信息并更新
      //...
      // 最后，停止下拉刷新
      wx.stopPullDownRefresh();
    } else {
      // 如果未能获取到 user 数据，您可以处理逻辑，例如重新授权或跳转到登录页

      const currentUserPhone = 'weidenglu';
      this.setData({
        currentUserPhone: '未登录',
      });
      console.log('current:',currentUserPhone)
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '未登录，请重新登录',
        icon: 'none',
      });
    }
  },
  navigateTowddd: function () {
    const userData=this.data.userData
    if(JSON.stringify(userData) === '{}')wx.showToast({
      title: '请先登录',
      icon:'error'
    })
    else {
      wx.navigateTo({
        url: '/pages/user/order/order', // 目标页面的路径
      });
    }
  },
  // 跳转到地址页
  navigateToAddress:function(){
    wx.navigateTo({
      url: '/pages/user/addressManage/addressManage',
    })
  },
  // 跳转到信息编辑页
  navigateToMsgEditor:function(){
    var itemString = JSON.stringify(this.data.userData); 
    wx.navigateTo({
      url: '../userMsgEditor/userMsgEditor?userData='+ encodeURIComponent(itemString),
    })
  },
  data:{
    isHaveGetCloudData:false,
    userData:{
      _id:'',
      authority:'',
      imageUrl:defaultAvatarUrl,
      nickName:'',
      password:'',
      phone:'',

    },
    islogin:false,
    avatarUrl:defaultAvatarUrl,
  },
  onChooseAvatar(e) {//选头像
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },
  // 图片加载失败时的处理函数
  handleImageError(e) {
    console.error('Image load error:', e);
    // 在这里切换到默认头像地址
    this.setData({
      'userData.imageUrl': defaultAvatarUrl,
    });
  },
  onLoad(){
    if(!(Object.keys(app.globalData.userData).length===0))this.setData({
      userData:app.globalData.userData,
      islogin:true
    })
    console.log(app.globalData.userData)
  },
  onShow(){
    if(!(Object.keys(app.globalData.userData).length===0))this.setData({
      userData:app.globalData.userData,
      islogin:true
    })

  },
  
  login(){
    var userInfo=this.data.userInfo
    if(userInfo==null||userInfo=='')wx.navigateTo({
      url: '/pages/login/login?'+'type=1',
    })
  },
  
  
  loginOut() {
    // 清除本地缓存的用户账号信息
    // wx.removeStorageSync('user');
    // 重置登录状态
    app.globalData.userInfo=null
    app.globalData.userData={}
    app.globalData.userLoggedIn = false;
    // 返回到登录页面或其他适当的操作
    // 如果有登录界面，可以跳转到登录界面
    // wx.navigateTo({ url: '/pages/login/login' });
    // 也可以重新显示登录页面的内容，例如显示输入手机号和密码的表单
    this.setData({
      islogin:false
    });
  },
  
  //跳转到管理员登录界面
  admindd(){
    wx.navigateTo({
      url: '/pages/admin/admin',
    })
  }
})