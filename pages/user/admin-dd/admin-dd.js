let app=getApp()
const db=wx.cloud.database()
Page({
  // 在 data 中定义不同状态的订单列表
  data: {
    currtab: 0,
    swipertab: [{ name: '已支付', index: 0 }, { name: '已发货', index: 1 }, { name: '已签收', index: 2 }],
    orderList0: [], // 已支付订单列表
    orderList1: [], // 已发货订单列表
    orderList2: [], // 已签收订单列表
    currentIndex: null,
  },

  onLoad() {
    this.getOrderData();
  },

  tabSwitch: function (e) {
    console.log('ts:',e.target.dataset.current)//
    this.setData({
      currtab: e.target.dataset.current
    });
  },

  tabChange: function (e) {
    console.log('tc:',e.target.detail.current)//
    this.setData({ currtab: e.detail.current });
    this.getOrderData(); // 切换选项卡时重新加载数据
  },

  getOrderData: function () {
    const that = this;

    wx.cloud.database().collection('dingdan').get().then(res => {
      console.log('请求到的数据', res);
      const orderList0 = res.data.filter(item => item.status == '0');
      const orderList1 = res.data.filter(item => item.status == '1');
      const orderList2 = res.data.filter(item => item.status == '2');

      that.setData({
        orderList0: orderList0,
        orderList1: orderList1,
        orderList2: orderList2
      });
    });
  },
 showOrderDetails(e) {
    const index = e.currentTarget.dataset.index;
    if (this.data.currentIndex === index) {
      this.setData({
        currentIndex: null,
      });
    } else {
      this.setData({
        currentIndex: index,
      });
    }
  },

})

