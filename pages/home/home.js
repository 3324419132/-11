// pages/home/home.js
const db = wx.cloud.database()
const app=getApp()
let searchKey = ''//ke
Page({
  data: {
    list:[],//云
    pageIndex:1, // 分页获取的第几页
    // searchKey : '',//搜索词  //gpt
  },
  //ke:获取用户输入的内容
  getSearch(e){
    console.log("get",e.detail.value)
    searchKey = e.detail.value //ke
    // this.setData({  //gpt
    //   searchKey: e.detail.value // 使用 setData 更新 searchKey
    // });
  },
  //ke:出发搜索事件
  goSearch(e){
    // 0代表是首页查询，1代表的订单查询
     wx.navigateTo({
       url: '/pages/search/search?type=0',
     })
  },


  //调用cloud cms
  onLoad() {
   //getTopList(){
    db.collection('shouyelunbotu').get().then(res=>{
      console.log('获取轮播图yes',res)
      this.setData({
        sylbt:res.data  //首页轮播图sylbt
      })
    })

    
    const userId=app.globalData.userData.phone
    const token=app.globalData.token
    const index=this.data.pageIndex
    console.log(userId)
    console.log(token)
    // 获取数据，分页获取，每页10条
    wx.cloud.callFunction({
      name: 'getGoodsData',
      data: {
        userId: userId,
        token: token,
        index: index
      },
      success: (res) => {
        const { success, message, data } = res.result;
        if (success) {
          this.setData({
            list:[...this.data.list,...data]
          })
          console.log(this.data.list)
          // 处理获取成功后的逻辑...
        } else {
          console.error('获取商品数据失败:', message);
          // 处理获取失败后的逻辑...
        }
      },
      fail: (error) => {
        console.error('调用云函数失败:', error);
        // 处理调用失败后的逻辑...
      }
    });

  },
  /////去商品详情页
  goDetail(e){
    const index=e.currentTarget.dataset.index
    const list=this.data.list
    const itemString = JSON.stringify(list[index]);
    wx.navigateTo({
      url: '/pages/goods2/goods2?item='+encodeURIComponent(itemString)+'&type=1',
    })
  },


})