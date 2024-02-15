// 小程序页面中的 js 代码
let app = getApp();
const db = wx.cloud.database();

Page({
  data: {
    tabIndex: 0,
    totalOrder: [], // 所有订单
    orderList1: [], // 已支付订单列表
    orderList2: [], // 退款/售后
    orderList3: [], // 已发货订单列表
    orderList4: [], // 待支付订单列表

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
  // 03 改变状态
  changeStatus(e) {
    // 从事件对象中获取必要的参数
    const id = e.currentTarget.dataset.id;
    const status = e.detail.status;
    const index = e.detail.index;
    const _id = e.detail._id;
  
    // 获取全局变量中的用户ID和Token
    const userId = app.globalData.userData.userId;
    const token = app.globalData.token;

    wx.showLoading({
      title: '状态更新中',
    })
  
    // 调用云函数更新订单状态
    wx.cloud.callFunction({
      name: 'updateOrderStatus',
      data: {
        userId: userId,
        token: token,
        _id: _id,
        type: status == 0 ? 0 : 1
      },
      success: res => {
        setTimeout(()=>{
          wx.hideLoading()
          .then(()=>{
            // 显示状态更新成功的提示
            wx.showToast({
              title: '状态更新成功',
              icon: 'success'
            });
            let item=null
            if (id == 0) {
              // 更新全部订单页面状态
              let totalOrder = this.data.totalOrder;
              totalOrder[index].status = status==0?4:2;
              item=totalOrder[index]
              // 更新页面数据
              this.setData({
                totalOrder: totalOrder
              });
            } 
            else {
              const tabIndex=this.data.tabIndex
              // 更新其他页面状态
              let filteredOrderList = this.data[`orderList${tabIndex}`];
              item=filteredOrderList[index]
              // 更新总体数据局部
              const list = this.data.totalOrder;
              const targetItem = list.find(item => item._id === _id);
      
              // 如果找到目标订单，更新状态
              if (targetItem) {
                targetItem.status = status==0?4:2;
              }
      
              // 更新页面数据
              this.setData({
                [`orderList${tabIndex}`]: filteredOrderList.splice(index),
                totalOrder: list
              });
            }
            // 如果状态为0，跳转到订单详情页面
            setTimeout(()=>{
              if (status == 0) {
                console.log(item)
                const itemString = JSON.stringify(item);
                wx.navigateTo({
                  url: `/pages/user/orderDetail/orderDetail?orderItem=${encodeURIComponent(itemString)}`,
                });
              }
            },1000)
          })
        },1000)
  
      },
      fail: error => {
        // 显示更新失败的提示
        setTimeout(()=>{
          wx.hideLoading()
          .then(()=>{
            wx.showToast({
              title: '更新失败',
              icon: 'error'
            });
          })
        },1000)
  
        console.error('更新订单状态失败:', error);
      }
    });
  },
  

  onLoad() {
    // 在页面加载时调用云函数获取订单数据
    this.getOrderList();
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
    console.log(totalOrder)
    console.log(tabIndex)
    switch (tabIndex) {
      case 1:
        // 已支付订单列表
        filteredOrderList = totalOrder.filter(order => order.status === 0);
        break;
      case 2:
        // 退款/售后订单列表
        filteredOrderList = totalOrder.filter(order => (order.status === 3||order.status === 4));
        break;
      case 3:
        // 待收货订单列表
        filteredOrderList = totalOrder.filter(order => order.status === 1);
        break;
      case 4:
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
  // 点击搜索栏搜索
  goSearch(){
    // 0代表是首页查询，1代表的订单查询
    wx.navigateTo({
      url: '/pages/search/search?type=1',
    })
  },
});
