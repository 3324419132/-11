// pages/user/addressManage/addressManage.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 地址信息列表
    addressList:[],
    indexList:[
    ],
    // 是否处于管理状态
    manageStatus:false,
    // 删除的个数
    deletedNum:0,
    // 默认地址序号
    defaultID:0,
    type:0,// type为0代表是正常进入，反之为订单支付页的进入
    pageName:'address',
    selectedAddress:null,// 从订单页跳转后返点击的地址项
  },
  // 01 改变管理状态
  changeManageStatus(){
    this.setData({
      manageStatus:!this.data.manageStatus
    })
    if(this.data.manageStatus){
      this.setData({
        indexList:new Array(this.data.addressList.length).fill(false)
      })
    }
  },
  // 02 选中/不选中地址
  addressSelectEvent(e){
    var id=e.currentTarget.dataset.id
    var indexList=this.data.indexList
    indexList[id]=!indexList[id]
    this.setData({
      indexList:indexList,
      deletedNum:indexList.filter(Boolean).length
    })
  },

  // 03 新增/删除地址
  addressChangeEvent() {
    var manageStatus = this.data.manageStatus;
    var addressList = this.data.addressList;
    var indexList = this.data.indexList;
    var that = this;

    // 删除
    if (manageStatus) {
      let itemsToDelete = addressList.filter((item, index) => indexList[index]);
      let deletePromises = itemsToDelete.map(item => {
        return wx.cloud.callFunction({
          name: 'addressDelete',
          data: {
            userId: app.globalData.userData.phone, // 或者其他用户ID标识
            addressId: item._id
          }
        });
      });

      Promise.all(deletePromises).then(results => {
        results.forEach((res, index) => {
          if (res.result.success) {
            console.log('地址删除成功');
            // 从addressList中移除
            let idx = addressList.findIndex(addr => addr._id === itemsToDelete[index]._id);
            if (idx > -1) {
              addressList.splice(idx, 1);
            }
          } else {
            console.log('删除失败:', itemsToDelete[index]._id);
          }
        });

        // 更新页面和全局变量
        that.setData({ addressList: addressList, manageStatus: false });
        app.globalData.addressList = addressList;
      }).catch(err => {
        console.error('删除过程中出现错误:', err);
      });
    }
    // 新增,跳转到添加页面
    else {
      wx.navigateTo({
        url: '../addressEdit/addressEdit',
      });
    }
  },


  // 04 获取云端数据
  // 获取地址的函数
  getAddress: function() {
    const that = this;
    console.log(app.globalData.userData.phone)
    console.log(app.globalData.token)
    wx.cloud.callFunction({
      name: 'addressGet',
      data: {
        account:app.globalData.userData.phone,
        token:app.globalData.token
      },
      success: function(res) {
        console.log(res)
        if(res.result.success) {
          that.setData({
            addressList: res.result.data
          });
          app.globalData.addressList=res.result.data
          console.log('地址获取成功:', res.result.data);
        } 
        else 
          {
          wx.showToast({
            title: '获取地址失败',
            icon: 'error'
          });
          console.error('获取地址失败:', res.result.message);
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '调用云函数失败',
          icon: 'none'
        });
        console.error('调用云函数失败:', err);
      }
    });
  },

  // 05 更改地址信息
  changeAddress(e) {
    var item = e.currentTarget.dataset.item;
    var itemString = JSON.stringify(item); // 将对象转换为字符串
    wx.navigateTo({
      url: '../addressEdit/addressEdit?item=' + encodeURIComponent(itemString) + '&type=1',
    });
  },

  // 从订单页进入，type为1，点击具体地址表示选中该地址，并返回
  selectAddress(e){
    if(this.data.type==1){
      var item = e.currentTarget.dataset.item;
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      
      prevPage.setData({
        defaultAddress: item,
      });
      // 返回上一页
      wx.navigateBack({
        delta: 1
      });
    }

  },
  


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getAddress()
    const type=options.type
    this.setData({
      type:type
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
    this.setData({
      addressList:app.globalData.addressList
    })
    console.log(app.globalData.addressList)
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