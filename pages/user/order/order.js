// 小程序页面中的 js 代码
let app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    tabIndex: 0,
    totalOrder: [], // 所有订单
    orderList1: [], // 已支付订单列表
    orderList2: [], // 待支付订单列表
    orderList3: [], // 已发货订单列表
    serchContent:'',// 搜索内容
    isSearch:false,// 是否搜索了
  },

  // 01 切换时获取当前tab索引
  onTabChange(e) {
    this.setData({
      tabIndex: e.detail.index
    });
    this.filterOrderList();
  },
  // 02 点击查看详情
  checkDetail(e){
    console.log(e)
    const item=e.detail.orderItem
    const itemString = JSON.stringify(item);
    wx.navigateTo({
      url: '/pages/user/orderDetail/orderDetail?orderItem='+encodeURIComponent(itemString),
    })
  },

  onLoad() {
    // 在页面加载时调用云函数获取订单数据
    this.getOrderList();
    console.log(this.data.totalOrder)
    console.log(this.data.orderList3)
    console.log(this.data.orderList1)
    console.log(this.data.orderList2)
  },

  // 获取订单数据
  getOrderList() {
    const that = this;
    const { phone, token } = app.globalData.userData; // 获取用户的账号和token

    wx.cloud.callFunction({
      name: 'orderGet',
      data: {
        phone: phone,
        token: token
      },
      success: res => {
        const result = res.result;
        console.log(res)
        if (result.success) {
          const totalOrder = result.data || [];
          that.setData({
            totalOrder: totalOrder
          });
          that.filterOrderList();
          
        } else {
          console.error('获取订单失败:', result.message);
        }
      },
      fail: err => {
        console.error('调用getOrderList云函数失败:', err);
      }
    });
  },

  // 根据当前tab索引过滤订单列表
  filterOrderList() {
    const tabIndex = this.data.tabIndex;
    const totalOrder = this.data.totalOrder;
    let filteredOrderList = [];

    switch (tabIndex) {
      case 1:
        // 已支付订单列表
        filteredOrderList = totalOrder.filter(order => order.status === 0);
        break;
      case 2:
        // 待支付订单列表
        filteredOrderList = totalOrder.filter(order => order.status === 1);
        break;
      case 3:
        // 已发货订单列表
        filteredOrderList = totalOrder.filter(order => order.status === 2);
        break;
      default:
        break;
    }

    // 更新当前tab对应的订单列表
    this.setData({
      [`orderList${tabIndex}`]: filteredOrderList
    });
  },
});
