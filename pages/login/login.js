// pages/test/test.js
const app=getApp()
const defaultImageUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
// 01 判断手机号是否合法
function isPhoneNumberValid(phoneNumber) {
  // 使用正则表达式验证手机号码格式
  const regex = /^1[3456789]\d{9}$/; // 中国大陆手机号的正则表达式
  return regex.test(phoneNumber);
}
// 02 是否只包含数字、字母
function isPasswordOnlyContain(password) {
  // 使用正则表达式检查密码是否只包含数字和字母
  const regex = /^[0-9a-zA-Z]+$/;
  return regex.test(password)
}
// 03 是否同时包括数字和大小写字母
function isPasswordValid(password) {
  // 使用正则表达式检查密码是否包含至少一个数字、一个小写字母和一个大写字母
  const hasDigit = /[0-9]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  // 返回 true 如果同时包含数字、小写字母和大写字母，否则返回 false
  return hasDigit && hasLowercase && hasUppercase;
}
// 04 6位验证码校验
function isSixDigitNumericCode(code) {
  // 使用正则表达式检查是否是6位数字
  const regex = /^\d{6}$/;
  return regex.test(code);
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNum:1,
    login:{
      account:null,
      password:null,
      input_error1:false,
      isShow:false,
      msg_inputed:false,
    },
    register:{
      account:null,
      password1:null,
      password2:null,
      identification:null,
      input_errormsg1:false,
      input_errormsg2:false,
      input_errormsg3:false,
      isShow:false,
      msg_inputed:false,
      countDown: 59, // 初始倒计时时间
      timer: null // 定时器
    },
    forget_psw:{

    },
    type:null,// 其他页面跳转的标志，1为从个人页跳转的
  },
// 01 显示/隐藏密码
toggleIsShow(){
  this.setData({
    'login.isShow': !this.data.login.isShow
  });
},
// 02 获取登录页输入
getInputContent(e){
  var id=e.currentTarget.dataset.id
  var value=e.detail.value

  if(id==1){
    this.setData({
      'login.account': value
    });
    // 使用正则表达式检查是否包含非数字字符
    const regex = /[^0-9]/;
    if(regex.test(value)||(value.length==11&&!isPhoneNumberValid(value))){
      // 手机号码格式不正确，可以提示用户或采取其他操作
      this.setData({
        'login.input_error':true
      })
    }
    else{
      this.setData({
        'login.input_error':false
      })
    }


  }
  else if(id==2){
    this.setData({
      'login.password': value
    });
  }
  
  this.is_inputed(this.data.login)
},
// 03 获取注册页输入
getInputContent2(e){
  var id=e.currentTarget.dataset.id
  var value=e.detail.value

  if(id==1){
    this.setData({
      'register.account': value
    });
    // 使用正则表达式检查是否包含非数字字符
    const regex = /[^0-9]/;
    if(regex.test(value)||(value.length==11&&!isPhoneNumberValid(value))){
      // 手机号码格式不正确，可以提示用户或采取其他操作
      this.setData({
        'register.input_errormsg1':true
      })
    }
    else{
      this.setData({
        'register.input_errormsg1':false
      })
    }
  }
  else if(id==2){
    this.setData({
      'register.password1': value
    });
    var password2=this.data.register.password2
    if((isPasswordOnlyContain(value)&&isPasswordValid(value))||(value=='')){
      this.setData({
        'register.input_errormsg2':false
      })
    }
    else this.setData({
      'register.input_errormsg2':true
    })
    if(password2!=null&&password2!=''){
      if(value==password2)this.setData({
        'register.input_errormsg3':false
      })
      else this.setData({
        'register.input_errormsg3':true
      })
    }

  }
  else if(id==3){
    if(value==this.data.register.password1)this.setData({
      'register.input_errormsg3':false
    })
    else this.setData({
      'register.input_errormsg3':true
    })
    this.setData({
      'register.password2': value
    });
  }
  else{
    this.setData({
      'register.identification': value
    });
  }
  
  this.is_inputed2(this.data.register)
},
// 03 判断是否信息都完全输入
is_inputed(msg){
  var account=msg.account
  var password=msg.password
  if(isPhoneNumberValid(account)&&account!=''&&password!=''&&account!=null&&password!=null){
    console.log("成功了")
    this.setData({
      'login.msg_inputed':true
    })
  }
  else{
    console.log("dsad")
    this.setData({
      'login.msg_inputed':false
    })
  }
  
 
},
is_inputed2(msg){
  var account=msg.account
  var password1=msg.password1
  var password2=msg.password2
  var identification=msg.identification
  if(isPhoneNumberValid(account)&&account!=''&&account!=null&&password1!=''&&password1!=null&&isPasswordValid(password1)&&password2!=''&&password2!=null&&isPasswordValid(password2)
  &&identification!=null&&isSixDigitNumericCode(identification)
  ){
    this.setData({
      'register.msg_inputed':true
    })
  }
  else{
    this.setData({
      'register.msg_inputed':false
    })
  }
  
 
},
// 04 切换登录注册
switchPage(e){
  var id=e.currentTarget.dataset.id
  var pageNum=this.data.pageNum
  this.setData({
    pageNum:id==1?(pageNum==1?2:1):3
  })
  console.log("pageNum: "+pageNum)
  if(pageNum==1){
    this.setData({
      'register.account':null,
      'register.password1':null,
      'register.password2':null,
      'register.identification':null,
      'register.input_errormsg1':null,
      'register.input_errormsg2':null,
      'register.input_errormsg3':null,
      'register.isShow':false,
      'register.msg_inputed':false,
    })
  }

},
// 05 点击发送验证码并开始倒计时
sendIdentification() {
  const phone=this.data.register.account
  if(phone==''||phone==null)wx.showToast({
    title: '手机号不能为空',
    icon:'error'
  })
  // 如果允许发送
  else if (this.data.register.countDown==59) {
    // 首先校验
    this.setData({
      'register.timer': setInterval(() => {
        let countDown = this.data.register.countDown;
        console.log(countDown)
        if (countDown > 0) {
          countDown--;
          this.setData({
            'register.countDown': countDown,
          });
        } 
        else 
        {
          clearInterval(this.data.register.timer);
          this.setData({
            'register.timer': null,
            'register.countDown':59
          });
        }
      }, 1000) // 每秒执行一次
    });

    // 调用云函数发送验证码
    wx.cloud.callFunction({
      name: 'SendSMS', // 云函数的名称
      data: {
        phone: phone // 将用户输入的手机号传递给云函数
      },
      success: res => {
        if (res.result.success) {
          wx.showToast({ title: '验证码已发送' });
        } 
        else {
          console.log(res)
          wx.showToast({ title: res.result.message, icon: 'error' });
        }
      },
      fail: err => {
        console.log(err)
        wx.showToast({ title: '发送失败', icon: 'error' });
      }
    });
  }
},

// 06 登录
login() {
  var account = this.data.login.account;
  var password = this.data.login.password;
  if (account == '' || account == null) {
    wx.showToast({
      title: '手机号不能为空',
      icon: 'error'
    });
  } else if (!isPhoneNumberValid(account)) {
    wx.showToast({
      title: '手机号不规范',
      icon: 'error'
    });
  } else if (password == '' || password == null) {
    wx.showToast({
      title: '密码不能为空',
      icon: 'error'
    });
  } else {
    // 查询用户信息
    wx.cloud.callFunction({
      name: 'getUserByIdentifiction',
      data: {
        phone: account,
        password: password
      },
      success: (res) => {
        const { code, message, data } = res.result;
        console.log(code)
        if (code === 0) {
          // 校验成功，将用户信息保存到全局变量
          console.log(data)
          // 处理用户数据并赋值给userData
          const userData = {
            _id: data.user._id,
            authority: data.user.authority,
            phone: data.user.phone,
            password: password,
            imageUrl: data.user.imageUrl || defaultImageUrl,
            nickName: data.user.nickName || `用户${data.phone}`,
            token:data.user.token
          };
          // 保存 token 到本地存储，使用小程序自己的标识
          app.globalData.token=data.token
          const user = {
            phone: account,
            password: password
          };
          app.globalData.userData = userData;
          app.globalData.islogin = true;

          // 保存用户信息到本地存储，使用小程序自己的标识
          const userKey = app.globalData.storageURL + 'user';
          wx.setStorageSync(userKey, user);
          // 在登录成功后切换到首页
          const type = this.data.type;
          if (type !=1) wx.switchTab({
            url: '/pages/home/home', // 首页页面的路径
          });
          else {
            wx.navigateBack()
          }
        } else {
          console.log("sad")
          // 校验失败，显示错误消息
          wx.showToast({
            title: message,
            icon: 'error',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('调用云函数失败：', error);
        wx.showToast({
          title: '校验失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
},



// 16784396548
// 244rf67
// 07 注册
register(){
  var msg_inputed=this.data.register.msg_inputed
  var identification=this.data.register.identification
  const phone=this.data.register.account
  if(!msg_inputed){
    // 请完善填写信息
    wx.showToast({
      title: '请先完成填写',
      icon:'error'
    })
  }
  else{
    if(!isSixDigitNumericCode(identification)){
      wx.showToast({
        title: '验证码验证失败',
        icon:'error'
      })
    }
    else{
      console.log("进行注册")
      // 用户点击发送验证码按钮时调用的函数
      // 首先校验该手机号是否已经存在
      wx.cloud.callFunction({
        name: 'checkPhoneExist',
        data: {
          phone: phone
        },
        success: (res) => {
          const { code, message } = res.result;
          console.log(res.result)
          if (code === 0) {
            wx.showToast({
              title: '手机号已存在',
              icon: 'error',
              duration: 2000
            });
          } 
          else {
            // 但该手机号不存在时完成注册
            // 手机号不存在时，调用云函数进行注册
            wx.cloud.callFunction({
              name: 'registerUser',
              data: {
                phone: phone,
                password: this.data.register.password1, // 使用密码输入框1的密码
                identification: identification,
                defaultImageUrl: defaultImageUrl
              },
              success: (res) => {
                const { success, message } = res.result;
                if (success) {
                  wx.showToast({
                    title: '注册成功',
                    icon: 'success',
                    duration: 2000
                  });
                  // 注册成功后可以执行其他操作，例如跳转到登录页等
                  this.setData({
                    pageNum:1
                  })
                } 
                else {
                  console.log(res)
                  wx.showToast({
                    title: message,
                    icon: 'error',
                    duration: 2000
                  });
                }
              },
              fail: (error) => {
                console.error('调用云函数失败：', error);
                wx.showToast({
                  title: '注册失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            });
          
          }
        },
        fail: (error) => {
          console.error('调用云函数失败：', error);
          wx.showToast({
            title: '校验失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  }
},


// 08 注册时手机输入框失焦
checkRegisterPhone(){
  const phone=this.data.register.account
  console.log(phone)
  if(!isPhoneNumberValid(phone)&&phone!=''){
    this.setData({
      'register.input_errormsg1':true
    })
  }
},

// 09 登录时手机输入框失焦
checkLoginPhone(){
  var phone=this.data.login.account
  if(!isPhoneNumberValid(phone)&&phone!=''){
    this.setData({
      'login.input_error':true
    })
  }
},



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      type:options.type==undefined?null:options.type
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    var userData=wx.getStorageSync(app.globalData.storageURL+"user")
    this.setData({
      'login.account':userData.phone==undefined?null:userData.phone,
      'login.password':userData.password==undefined?null:userData.password,
      'login.msg_inputed':true
    })
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
    // 页面卸载时清除定时器，防止内存泄漏
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
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