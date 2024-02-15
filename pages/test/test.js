// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  // 页面中的代码
  wx.cloud.callFunction({
    name: 'testDelete', // 替换成你实际的云函数名
    data: {
      userId: '18949954607', // 替换成你要删除的 userId
    },
    success: (res) => {
      const { success, message } = res.result;
      if (success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        console.log('删除记录成功:', message);
        // 处理成功后的逻辑...
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'error'
        });
        console.error('删除记录失败:', message);
        // 处理失败后的逻辑...
      }
    },
    fail: (error) => {
      wx.showToast({
        title: '调用云函数失败',
        icon: 'error'
      });
      console.error('调用云函数失败:', error);
      // 处理调用失败后的逻辑...
    }
  });

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