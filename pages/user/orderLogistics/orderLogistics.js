// pages/user/orderLogistics/orderLogistics.js
const app=getApp()
// const logisticsData={
//   "data": {
//     "logo": "http: \/\/img.lundear.com\/shentong.png",
//     "state": 3,
//     "list": [
//       {"time": "2024-01-22 16: 51: 21","status": "已签收，签收人凭取货码签收。起早贪黑不停忙，如有不妥您见谅，好评激励我向上，求个五星暖心房。"},
//       {"time": "2024-01-22 11: 02: 09","status": "快件已暂存至南京侨康路20号10栋店菜鸟驿站，如有疑问请联系18251898654，如您未收到此快递，请拨打投诉电话：02584844771！ "},{"time": "2024-01-22 07: 39: 20","status": "[南京市]【江苏南京江北新区高新公司】的快递员(动漫大厦\/15365013222)正在为您派送(可放心接听95089申通专属派送号码)，投诉电话:02584844771"},
//       {"time": "2024-01-22 07: 26: 24","status": "[南京市]快件已到达【江苏南京江北新区高新公司】咨询电话：02584844771"},
//       {"time": "2024-01-22 02: 36: 22","status": "[南京市]快件已发往【江苏南京江北新区高新公司】"},
//       {"time": "2024-01-22 02: 36: 02","status": "[南京市]快件已到达【江苏南京转运中心】"},
//       {"time": "2024-01-22 01: 19: 15","status": "[南京市]快件已到达【江苏南京转运中心】"},
//       {"time": "2024-01-21 20: 09: 21","status": "[淮安市]快件已发往【江苏南京转运中心】"},
//       {"time": "2024-01-21 20: 06: 39","status": "[淮安市]快件已到达【江苏淮安转运中心】"},
//       {"time": "2024-01-19 22: 53: 00","status": "[呼和浩特市]快件已发往【江苏淮安转运中心】"},
//       {"time": "2024-01-19 22: 51: 26","status": "[呼和浩特市]快件已到达【内蒙古呼和浩特转运中心】"},
//       {"time": "2024-01-19 20: 54: 36","status": "[呼和浩特市]快件已到达【内蒙古呼和浩特转运中心】"},
//       {"time": "2024-01-19 20: 21: 43","status": "[呼和浩特市]快件已到达【内蒙古呼和浩特转运中心】"},
//       {"time": "2024-01-19 16: 51: 45","status": "[呼和浩特市]快件已发往【内蒙古呼和浩特转运中心】"},
//       {"time": "2024-01-19 16: 43: 27","status": "[呼和浩特市]【内蒙古呼市新城区北二环公司】(04714598730)的内蒙古呼市新城区二公司(13304715707)已揽收"}
//     ],
//     "name": "申通快递",
//     "number": "777192143273852",
//     "com": "shentong"
//   },
//   "desc": "成功",
//   "code": 0
// }
function convertToStepsWithTime(logisticsData) {
  console.log(logisticsData)
  // 检查是否存在物流数据
  if (!logisticsData || !logisticsData.list) {
    return [];
  }

  // 将物流数据转为步骤形式
  const steps = logisticsData.list.map((item, index) => {
    return {
      text: item.time,
      desc: item.status,
      inactiveIcon: 'circle',
      activeIcon: 'success',
    };
  });

  // 将步骤数据赋值给data中的steps
  logisticsData.steps = steps;

  // 默认inactiveIcon: 'circle', activeIcon: 'success'
  steps.forEach((step) => {
    step.inactiveIcon = 'circle';
    step.activeIcon = 'success';
  });

  return steps;
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    steps:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(convertToStepsWithTime(logisticsData))
    const type=0 //测试
    if(type==0){
      const data=wx.getStorageSync(app.globalData.storageURL+'logisticsData')
      console.log(data.list)
      this.setData({
        steps:convertToStepsWithTime(data)
      })
      console.log(data)
    }
    else if(type==1)wx.cloud.callFunction({
      name: 'logisticsQuery',
      data: {
        number: "777192143273852",
        phone:app.globalData.userData.phone,
        token:app.globalData.token
      },
      success: function (res) {
        console.log(res.result.data);
        wx.setStorageSync(app.globalData.storageURL+'logisticsData', res.result.data)
        // 在这里处理云函数返回的结果
      },
      fail: function (error) {
        console.error('Error:', error);
        // 处理云函数调用失败的情况
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