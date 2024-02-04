// pages/admin/admin.js
Page({
  data: {
    name:'',
    password:'',
    noLogin:true
  },
  onLoad() {
    let admin=wx.getStorageSync('admin')
    console.log('缓存登录信息',admin)
    if(admin && admin.name && admin.password){
      this.loginData(admin.name,admin.password)
    }
  },
  getName(e){
    console.log(e.detail.value)
    this.setData({
      name:e.detail.value
    })
  },
  getPassword(e){
    console.log(e.detail.value)
    this.setData({
      password:e.detail.value
    })
  },
//点击登录按钮
  goLogin(){
    let name=this.data.name
    let password=this.data.password
    if(!name){
      wx.showToast({
        icon:'error',
        title:"请输入账号",
      })
      return 
    }
    if(!password){
      wx.showToast({
        title: '请输入密码',
        icon:"error",
      })
      return
    }
    console.log(name)
    console.log(password)
   this.loginData(name,password)//转写成下面这个函数了，因为别的时候也要调用
  },
//执行登录的方法
  loginData(name,password){
    wx.cloud.database().collection("admin")//!!!!
    .where({
      name,
      password:password
    }).get().then(res=>{
      console.log('返回的数据',res)
      if(res.data && res.data.length>0){
        // console.log('登陆成功')
        //1.切换到登陆成功的页面
        this.setData({
          noLogin:false
        })
        let admin={}
        admin.name=name
        admin.password=password
        //2.缓存账号密码用于记录登陆状态
        wx.setStorageSync('admin', admin)  //这多加了个括号，所以出现了bug
      }else{
        wx.showToast({
          icon:"error",
          title:'账号或密码错误'
        })
        wx.setStorageSync('admin', null)  //！
      }
    }).catch(res=>{
      console.log('请求失败',res)
    })
  },
  //去管理员查看订单页
  checkdd(){
    wx.navigateTo({
      url: '/pages/admin-dd/admin-dd',
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})