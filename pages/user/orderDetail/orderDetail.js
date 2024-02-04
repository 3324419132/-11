// pages/user/orderDetail/orderDetail.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderItem:{},
  },
  // 01 查看物流
  checkLogistics(){
    wx.navigateTo({
      url: '/pages/user/orderLogistics/orderLogistics',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    const item = JSON.parse(decodeURIComponent(options.orderItem)); // 解码并解析字符串
    this.setData({
      orderItem:item
    })

    wx.setStorageSync(app.globalData.storageUrl+'testData', item)
    // this.setData({
    //   orderItem:wx.getStorageSync(app.globalData.storageUrl+'testData')
    // })
    // console.log(this.data.orderItem)
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