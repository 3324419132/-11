// pages/food/food.js
const db = wx.cloud.database()
const app =getApp()
let searchKey = ''//ke
Page({
  data:{
    type:0,// 0代表是首页查询，1代表的订单查询
    searchText:null,// 搜索文本
    goodList:[],// 搜索出来的商品列表
    orderList:[],// 搜索出来的订单列表
    index:1,// 分页查询的页号
    isReachBottom:false,// 是否已经触底，没有数据了
  },
  // 取消搜索
  onCancel(){
    wx.navigateBack()
  },
  // 确认搜索
  onSearch(){
    const value=this.data.searchText
    this.getSearchData(value)
  },
  // 搜索关键词变化
  onChange(e){
    const value=e.detail
    const type=this.data.type
    this.setData({
      searchText:value,
      isReachBottom:false
    })
    if(value==''||value==null){
      if(type==0)this.setData({
        goodList:[]
      })
      else this.setData({
        orderList:[]
      })
    }
    this.getSearchData(value)
  },
  getSearchData(value){
    const index=this.data.index
    const type=this.data.type
    // 商品搜索
    if(type==0){
      wx.cloud.callFunction({
        name: 'getGoodSearchData', 
        data: {
          userId:app.globalData.userData.userId,
          token:app.globalData.token,
          index,
          searchText:value
        },
        success: (res) => {
          const { success, data } = res.result;
          if (success) {
            this.setData({
              goodList: data,
            });
            wx.setStorageSync('goodSearchList', data)
          } else {
            wx.showToast({
              title: '查询失败',
              icon: 'error',
            });
          }
        },
        fail: (err) => {
          console.error(err);
          wx.showToast({
            title: '调用云函数失败',
            icon: 'none',
          });
        },
      });
    }
    // 订单搜索
    else if(type==1){
      wx.cloud.callFunction({
        name: 'getOrderSearchData', 
        data: {
          userId:app.globalData.userData.userId,
          token:app.globalData.token,
          index,
          searchText:value
        },
        success: (res) => {
          const { success, data } = res.result;
          if (success) {
            this.setData({
              orderList: data,
            });
            console.log(data)
            wx.setStorageSync('orderOrderList', data)
          } else {
            wx.showToast({
              title: '查询失败',
              icon: 'error',
            });
          }
        },
        fail: (err) => {
          console.error(err);
          wx.showToast({
            title: '调用云函数失败',
            icon: 'none',
          });
        },
      });
    }
  },
  // 点击跳转到商品详情页
  goToGoods2(e){
    const index=e.currentTarget.dataset.index
    const list=this.data.goodList
    const itemString = JSON.stringify(list[index]);
    wx.navigateTo({
      url: '/pages/goods2/goods2?item='+encodeURIComponent(itemString)+'&type=1',
    })
  },
   // 下拉触底事件
   onReachBottom() {
     const searchText=this.data.searchText
     const isReachBottom=this.data.isReachBottom
     console.log(isReachBottom)
     if(searchText!=null&&searchText!=''&&!isReachBottom){
        wx.showLoading({
          title: '加载中...',
        })
        this.loadMoreData(); // 触底时加载更多数据
     }
     
  },
    // 03 改变状态
    changeStatus(e) {
      // 从事件对象中获取必要的参数
      const status = e.detail.status;
      const index = e.detail.index;
      const _id = e.detail._id;
      let list=this.data.orderList
      list[index].status=status==0?4:2
      // 获取全局变量中的用户ID和Token
      const userId = app.globalData.userData.userId;
      const token = app.globalData.token;
    
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
          // 显示状态更新成功的提示
          wx.showToast({
            title: '状态更新成功',
            icon: 'success'
          });
          let item=null
          
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


  // 加载更多数据的方法
  loadMoreData() {
    const index=this.data.index
    const type=this.data.type
    const searchText=this.data.searchText
    // 模拟异步加载更多数据
    setTimeout(() => {
      if(type==0)wx.cloud.callFunction({
        name: 'getGoodSearchData', 
        data: {
          userId:app.globalData.userData.userId,
          token:app.globalData.token,
          index:index+1,
          searchText
        },
        success: (res) => {
          const { success, data } = res.result;
          console.log(res)
          if (success) {
            wx.hideLoading()
            .then(()=>{
              const moreData = data;
              console.log(moreData)
              if(moreData.length>0){
                this.setData({
                  goodList: this.data.goodList.concat(moreData),
                  index: index + 1, // 页数加1
                });
                wx.setStorageSync('goodSearchList', this.data.goodList)
                wx.showToast({
                  title: '加载成功',
                  icon:'success'
                })
              }
              else{
                this.setData({
                  isReachBottom:true
                })
                wx.showToast({
                  title: '没有更多数据了',
                  icon:'error'
                })
              }
              
            })
            
          } else {
            wx.hideLoading()
            .then(()=>{
              wx.showToast({
                title: '查询失败',
                icon: 'error',
              });
            })
          }
        },
        fail: (err) => {
          console.error(err);
          wx.showToast({
            title: '调用云函数失败',
            icon: 'none',
          });
        },
      });
      else wx.cloud.callFunction({
        name: 'getOrderSearchData', 
        data: {
          userId:app.globalData.userData.userId,
          token:app.globalData.token,
          index:index+1,
          searchText
        },
        success: (res) => {
          const { success, data } = res.result;
          console.log(res)
          if (success) {
            wx.hideLoading()
            .then(()=>{
              const moreData = data;
              console.log(moreData)
              if(moreData.length>0){
                this.setData({
                  orderList: this.data.orderList.concat(moreData),
                  index: index + 1, // 页数加1
                });
                wx.setStorageSync('orderSearchList', this.data.orderList)
                wx.showToast({
                  title: '加载成功',
                  icon:'success'
                })
              }
              else{
                this.setData({
                  isReachBottom:true
                })
                wx.showToast({
                  title: '没有更多数据了',
                  icon:'error'
                })
              }
              
            })
            
          } else {
            wx.hideLoading()
            .then(()=>{
              wx.showToast({
                title: '查询失败',
                icon: 'error',
              });
            })
          }
        },
        fail: (err) => {
          console.error(err);
          wx.showToast({
            title: '调用云函数失败',
            icon: 'none',
          });
        },
      });
      
    }, 1000);
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
  
  onLoad(options) {
    this.setData({
      orderList:[],
      goodList:[],
      type:options.type
    })
  },



})