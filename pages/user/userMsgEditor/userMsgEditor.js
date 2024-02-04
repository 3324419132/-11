// pages/user/userMsgEditor/userMsgEditor.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app=getApp()
// 01 是否同时包括数字和大小写字母
function isPasswordValid(password) {
  // 使用正则表达式检查密码是否包含至少一个数字、一个小写字母和一个大写字母
  const hasDigit = /[0-9]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  // 返回 true 如果同时包含数字、小写字母和大写字母，否则返回 false
  return hasDigit && hasLowercase && hasUppercase;
}
// 02 密码加密函数
function encryptPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: defaultAvatarUrl,
    isEditPassword:false, // 是否在编辑密码
    inputError1:false, // 输入新密码是否错误
    inputError2:false,// 再次输入是否有错误
    user:{
      nickName:'',
      imageUrl:defaultAvatarUrl,
      account:'',
      password:'',
    },
    oldPassword:'',// 旧密码
    newPassword1:'',// 新密码
    newPassword2:'',// 再次输入的新密码
  },
  //01 更改图像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      'user.imageUrl':avatarUrl,
    })
  },
  //02 修改密码
  editPassword(){
    this.setData({
      isEditPassword:!this.data.isEditPassword
    })
  },
  // 03 输入新密码
  handleBlur(){
    var password=this.data.newPassword1
    if(!isPasswordValid(password)&&password!=''){
      this.setData({
        inputError1:true
      })
    }
  },

  // 04 获取输入内容
  getInputContent(e) {
    var id = e.currentTarget.dataset.id;
    var value = e.detail.value;
  
    if (id == 1) {
      this.setData({
        'user.nickName': value
      });
    } else if (id == 2) {
      this.setData({
        oldPassword: value
      });
    } else if (id == 3) {
      const newPassword2=this.data.newPassword2
      this.setData({
        newPassword1: value,
        inputError1: !isPasswordValid(value) ? false : this.data.inputError1,
      });
      if(value!=newPassword2&&newPassword2!=''){
        this.setData({
          inputError2:true
        })
      }
      else if(value==newPassword2&&newPassword2!='')this.setData({
        inputError2:false
      })
      
    } else if (id == 4) {
      this.setData({
        newPassword2: value,
        inputError2: value === this.data.newPassword1 ? false : this.data.inputError2
      });
    }
  },

  // 05 修改用户信息时，判断是否需要修改密码
  confirmChange() {
    console.log("触发了更新");
    var { isEditPassword, oldPassword, newPassword1, newPassword2, user } = this.data;
    var flag = true;

    // 如果修改密码
    if (isEditPassword) {
      flag = false;
      // 校验旧密码、新密码的有效性
      if (!isPasswordValid(oldPassword)) {
        wx.showToast({
          title: '旧密码错误',
          icon: 'error'
        });
      } else if (!isPasswordValid(newPassword1)) {
        wx.showToast({
          title: '新密码格式错误',
          icon: 'error'
        });
      } else if (newPassword1 !== newPassword2) {
        wx.showToast({
          title: '两次输入的新密码不一致',
          icon: 'error'
        });
      } else {
        flag = true;
        // 准备更新密码的数据
        var updateData = {
          _id: user._id,
          authority: user.authority,
          phone: user.phone,
          imageUrl: user.imageUrl,
          nickName: user.nickName,
          oldPassword: oldPassword,
          password: newPassword1,
          type: 1 // 涉及密码修改
        };
      }
    } else {
      // 不涉及密码修改的情况
      var updateData = {
        _id: user._id,
        authority: user.authority,
        phone: user.phone,
        imageUrl: user.imageUrl,
        nickName: user.nickName,
        password: user.password, // 保持原密码
        type: 0 // 不涉及密码修改
      };
    }

    // 如果校验通过，调用云函数更新数据
    if (flag) {
      wx.cloud.callFunction({
        name: 'updateUser',
        data: updateData,
        success: res => {
          const { code, message } = res.result;
          if (code === 0) {
            wx.showToast({
              title: '更新成功',
              icon: 'success',
              duration: 2000
            });
            // 更改本地缓存
            let userInfo=wx.getStorageSync(app.globalData.storageURL+'user')
            if(userInfo.phone==user.phone){
              userInfo.password=user.password
              wx.setStorageSync(app.globalData.storageURL+'user', userInfo)
            }
            // 如果是更改密码的话，存储在本地的数据也应该加密
            if(isEditPassword)user.password=encryptPassword(user.password)
            app.globalData.userData = user;
            setTimeout(() => {
              wx.navigateBack();
            }, 500);
          } else {
            console.log(res)
            wx.showToast({
              title: message,
              icon: 'error',
              duration: 2000
            });
          }
        },
        fail: error => {
          console.error('调用云函数失败：', error);
          wx.showToast({
            title: '更新失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  },
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    try {
      const item = JSON.parse(decodeURIComponent(options.userData)); // 解码并解析字符串

      // 使用item数据初始化页面
      this.setData({
        user:item
      });
      console.log("type:"+options.type)
    } catch (e) {
      console.error('解析item时发生错误:', e);
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