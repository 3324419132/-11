// pages/user/orderDetail/orderDetail.js
const app=getApp()
// 异步加入购物车函数
const addToCartAsync = (token, cartData, _id) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'addToCart',
      data: {
        token: token,
        cartData: cartData,
        _id: _id
      },
      success: (res) => {
        const { success, message } = res.result;
        if (success) {
          resolve(message);
        } else {
          reject(message);
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderItem:{},
    steps: [
      {
        text: '退款成功  2024-1-30 21:56',
        desc: '银行反馈已入账，如有疑问请联系银行客服。',
        inactiveIcon: 'circle',
        activeIcon: 'success',
      },
      {
        text: '银行受理  2024-1-30 21:56',
        desc: '银行已受理，请耐心等待，预计12小时内完成',
        inactiveIcon: 'circle',
        activeIcon: 'plus',
      },
      {
        text: '卖家退款  2024-1-30 21:56',
        desc: '商家退款已提交至银行处理，退款通常将原理退回',
        inactiveIcon: 'circle',
        activeIcon: 'cross',
      },
    ],
  },
  // 01 查看物流
  checkLogistics(){
    wx.navigateTo({
      url: '/pages/user/orderLogistics/orderLogistics',
    })
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  // 确认收货或申请退款
  changeStatus(e){
    console.log("adas")
    const id=e.currentTarget.dataset.id
    // 获取全局变量中的用户ID和Token
    const userId = app.globalData.userData.userId;
    const token = app.globalData.token;
    // 调用云函数更新订单状态
    wx.cloud.callFunction({
      name: 'updateOrderStatus',
      data: {
        userId: userId,
        token: token,
        _id: this.data.orderItem._id,
        type: id==1?2:1
      },
      success: res => {
        // 显示状态更新成功的提示
        wx.showToast({
          title: '状态更新成功',
          icon: 'success'
        });
        // 获取页面栈
        let pages = getCurrentPages();
        // 获取 订单 页面的实例
        // 获取全部订单的数据
        let APageInstance = pages[pages.length - 2];
        let list = APageInstance.data.totalOrder;
        const targetItem = list.find(item => item._id === this.data.orderItem._id);
        if(targetItem){
          targetItem.status=id==1?3:2
        }

        // 更新局部页面
        const tabIndex=APageInstance.data.tabIndex
        if(tabIndex!=0){
          let filteredOrderList = APageInstance.data[`orderList${tabIndex}`];
          filteredOrderList = filteredOrderList.filter(item => item._id !== this.data.orderItem._id);
          APageInstance.setData({
            [`orderList${tabIndex}`]: filteredOrderList,
          })
        }

        // 修改 订单 页面的数据
        APageInstance.setData({
          totalOrder:list
        });
        setTimeout(()=>{
          wx.navigateBack()
        },1000)
  
        console.log('更新订单状态成功:', res);
      },
      fail: error => {
        // 显示更新失败的提示
        wx.showToast({
          title: '更新失败',
          icon: 'error'
        });
  
        console.error('更新订单状态失败:', error);
      }
    });
  },
  
  // 加入购物车
  addCart(){
    const orderItem = this.data.orderItem;
    const userId = app.globalData.userData.phone;
    const token = app.globalData.token;
    const addToCartPromises = [];

    for (let i = 0; i < orderItem.items.length; i++) {
      const item = orderItem.items[i];
      const cartData = {
        style: item.style,
        imageUrl: item.imageUrl,
        shengao: item.shengao,
        tizhong: item.tizhong,
        jiankuan: item.jiankuan,
        houbei: item.houbei,
        xiuchang: item.xiuchang,
        lingkou: item.lingkou,
        price: item.price,
        name: item.name,
        goodNum: item.goodNum,
        userId: userId
      };

      addToCartPromises.push(addToCartAsync(token, cartData, item._id));
    }

    // 使用 Promise.all 等待所有加入购物车的异步操作完成
    Promise.all(addToCartPromises)
      .then((results) => {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
        console.log('所有数据添加成功:', results);
        // 处理成功后的逻辑...
      })
      .catch((errors) => {
        wx.showToast({
          title: '添加失败',
          icon: 'error'
        });
        console.error('数据添加失败:', errors);
        // 处理失败后的逻辑...
      });
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
    console.log(item)
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