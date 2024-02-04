// pages/user/addressManage/addressEdit.js
import { areaList } from '../../../miniprogram_npm/@vant/area-data/data';
const app=getApp()
// 01 判断手机号是否合法
function isPhoneNumberValid(phoneNumber) {
  // 使用正则表达式验证手机号码格式
  const regex = /^1[3456789]\d{9}$/; // 中国大陆手机号的正则表达式
  return regex.test(phoneNumber);
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressItem:{
      name:'',
      phone:'',
      address:[],
      _id:'',
    },
    province:'',
    city:'',
    county:'',
    specificAddress:'',
    isDefaultAddress:false,
    areaList:areaList,// 全国省份、城市、县区数据
    isAreaSelected:false,
    inputedError:false,// 手机号输入错误
    type:0,//是添加还是修改
    userData:null,
  },
  //01 切换是否为默认地址
  switchChange(){
    this.setData({
      isDefaultAddress:!this.data.isDefaultAddress
    })
  },
  // 02 确认保存
  confirmAddAddress() {
    let addressItem = this.data.addressItem;
    const name = addressItem.name;
    const phone = addressItem.phone;
    const province = this.data.province;
    const city = this.data.city;
    const county = this.data.county;
    const specificAddress = this.data.specificAddress;
    const userData = app.globalData.userData;
    const isDefaultAddress = this.data.isDefaultAddress;
    const type = this.data.type; // 添加还是更新的标志
    console.log(userData)
    if (userData==null || !userData.phone) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      });
    } else if (name == '') {
      wx.showToast({
        title: '收货人不能为空',
        icon: 'error'
      });
    } else if (phone == '') {
      wx.showToast({
        title: '手机号不能为空',
        icon: 'error'
      });
    } else if (!isPhoneNumberValid(phone)) {
      wx.showToast({
        title: '手机号不正确',
        icon: 'error'
      });
    } else if (province == '' || city == '' || county == '' || specificAddress == '') {
      wx.showToast({
        title: '请完善地址',
        icon: 'error'
      });
    } else {
      addressItem.address[0] = province;
      addressItem.address[1] = city;
      addressItem.address[2] = county;
      addressItem.address[3] = specificAddress;
      this.setData({
        addressItem: addressItem
      });
      console.log(type)
      wx.cloud.callFunction({
        name: type === 1 ? 'addressUpdate' : 'addressAdd',
        data: {
          _id: type === 1 ? addressItem._id : '',
          account: userData.phone,
          name: name,
          phone: phone,
          address: [province, city, county, specificAddress],
          isDefault: isDefaultAddress,
          token: userData.token // 传入用户 token
        }
      }).then(res => {
        if (res.result.success) {
          wx.showToast({
            title: type === 1 ? '地址更新成功' : '地址添加成功',
            icon: 'success'
          });

          const newAddress = res.result.newAddress;

          if (isDefaultAddress || (type == 1 && !isDefaultAddress)) {
            wx.cloud.callFunction({
              name: 'addressGet',
              data: { account: userData.phone,token:userData.token },
              success: res => {
                if (res.result.success) {
                  app.globalData.addressList = res.result.data;
                } else {
                  console.error('重新获取地址失败:', res.result.message);
                }
              },
              fail: err => {
                console.error('调用 addressGet 云函数失败:', err);
              }
            });
          } else {
            app.globalData.addressList = [newAddress, ...app.globalData.addressList];
          }

          setTimeout(() => {
            wx.navigateBack();
          }, 500);
        } 
        else {
          console.log(res)
          wx.showToast({
            title: type === 1 ? '地址更新失败' : '地址添加失败',
            icon: 'error'
          });
        }
      }).catch(err => {
        
        console.error(type === 1 ? '地址更新失败' : '地址添加失败', err);
        wx.showToast({
          title: type === 1 ? '地址更新失败' : '地址添加失败',
          icon: 'error'
        });
      });
    }
  },


  // 03 点击选择地区
  selectAddress(){
    this.setData({
      isAreaSelected:true
    })
  },
  // 04 取消地区选择
  cancelSelectArea(){
    this.setData({
      isAreaSelected:false
    })
  },
  // 05 确认地区选择
  confirmSelectArea(e){
    console.log(e)
    var index=e.detail.index
    var values=e.detail.values
    if(index[0]==0||index[1]==0||index[2]==0)wx.showToast({
      title: '地区不合理',
      icon:'error'
    })
    this.setData({
      province:values[0].name,
      city:values[1].name,
      county:values[2].name,
      isAreaSelected:false
    })
  },
  // 06 获取输入数据
  getInputContent(e){
    var id=e.currentTarget.dataset.id
    var value=e.detail.value
    // 收货人
    if(id==1){
      this.setData({
        'addressItem.name':value
      })
    }
    // 手机号
    else if(id==2){
      this.setData({
        'addressItem.phone':value,
      })
      if(isPhoneNumberValid(value))this.setData({
        inputedError:false
      })
    }
    // 具体地址
    else if(id==3){
      this.setData({
        specificAddress:value
      })
    }
  },
  // 07 手机号输入框焦点失去事件
  handleBlur(){
    var phone=this.data.addressItem.phone
    if(!isPhoneNumberValid(phone)&&phone!='')this.setData({
      inputedError:true
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
   onLoad(options) {
    if (options.type && options.type === "1" && options.item) {
      try {
        const item = JSON.parse(decodeURIComponent(options.item)); // 解码并解析字符串
        const addressItem = {
          name: item.name || '',
          phone: item.phone || '',
          address: item.address || [],
          _id: item._id, // 不设置为空字符串，保持它为空
        }
        // 使用item数据初始化页面
        this.setData({
          addressItem: addressItem,
          province: item.address ? item.address[0] : '',
          city: item.address ? item.address[1] : '',
          county: item.address ? item.address[2] : '',
          specificAddress: item.address ? item.address[3] : '',
          isDefaultAddress: item.isDefault || false,
          type: 1
        });
        console.log("type:"+options.type)
      } catch (e) {
        console.error('解析item时发生错误:', e);
      }
    }    
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