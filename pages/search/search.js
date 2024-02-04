// pages/food/food.js
const db = wx.cloud.database()
let searchKey = ''//ke
Page({
  //ke:获取用户输入的内容    
  getSearch(e){   //非得在onload函数上面！！！
    console.log("get",e.detail.value)
    searchKey = e.detail.value //ke
  },
  //ke:出发搜索事件
  goSearch(e){
    console.log("searchKey:",searchKey)
    // const searchKey = this.data.searchKey; // 获取搜索词
    if (searchKey && searchKey.length>0){
     wx.navigateTo({
       url: '/pages/search/search?searchKey=' + searchKey,
     })
    }else{
      wx.showToast({
        icon:'none',
        title: '搜索词为空',
      })
    }
  },

  goDetail(e){
    console.log(e.currentTarget.dataset.id)
    wx.navigateTo({
      url: '/pages/goods2/goods2?id='+e.currentTarget.dataset.id,
    })
  },
  onLoad(options) {
    console.log('options：',options)
    let searchKey=options.searchKey
    //搜索的触发写在这里
      db.collection('shangpinliebiao').where({  //又调用云
        name:db.RegExp({  //name可以改为自己定义的字段的名字
          regexp:searchKey,
          options:'i'   //i表示不区分大小写
        })
      }).get()
      .then(res=>{
        console.log('sou索成功',res)
        this.setData({
          list:res.data
        })
      })
      .catch(res=>{
        console.log('sou索失败',res)
      })
  },



})