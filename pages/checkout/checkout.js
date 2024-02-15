// 在 checkout.js 中存储订单信息到云开发数据库
const db = wx.cloud.database();
const app=getApp()

/**
 * 生成订单编号
 * @param {string} phoneNumber - 用户手机号
 * @returns {string} - 返回生成的订单编号
 */
function generateOrderNumber(phoneNumber) {
  // 获取当前时间戳，精确到毫秒
  const timestamp = new Date().getTime().toString();
  
  // 生成随机数，取整，确保是六位数
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  // 截取手机号的后六位，确保是六位数
  const phoneNumberSuffix = phoneNumber.slice(-6).padStart(6, '0');
  
  // 将手机号码分成三部分
  const part1 = phoneNumber.slice(0, 3);
  const part2 = phoneNumber.slice(3, 7);
  const part3 = phoneNumber.slice(7);
  
  // 随机选择插入位置或者按照特定规则插入
  const insertionIndex = Math.random() > 0.5 ? 
    Math.floor(Math.random() * (timestamp.length + 1)) : // 随机位置
    Math.floor(timestamp.length / 2); // 特定规则位置
  
  // 插入手机号的各部分到订单编号
  let orderNumber = (
    timestamp.slice(0, insertionIndex) +
    part1 +
    timestamp.slice(insertionIndex, insertionIndex + 3) +
    part2 +
    timestamp.slice(insertionIndex + 3) +
    part3 +
    random +
    phoneNumberSuffix
  );

  // 截取订单号的前 12 位
  const truncatedOrderNumber = orderNumber.slice(0, 12);

  // 随机生成插入字符串，可以根据需要修改
  const charactersToAdd = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // 可以根据需要修改
  const numberOfCharacters = Math.floor(Math.random() * 5) + 1; // 随机插入 1 到 5 个字符

  let insertedCharacters = '';
  for (let i = 0; i < numberOfCharacters; i++) {
    const randomCharacter = charactersToAdd[Math.floor(Math.random() * charactersToAdd.length)];
    insertedCharacters += randomCharacter;
  }

  // 插入字符串到订单号中间，保证最终长度为 15
  const middleIndex = Math.floor(truncatedOrderNumber.length / 2);
  orderNumber = (
    truncatedOrderNumber.slice(0, middleIndex) +
    insertedCharacters +
    truncatedOrderNumber.slice(middleIndex)
  );

  return orderNumber;
}


Page({
  data: {
    // 其他数据略
    note: '',  // 用户输入的备注
    note1:'',// 截取内容
    goodList:[],
    defaultAddress:{},
    pageName:null, // 从哪个页面抵达此页面
    totalPrice:'',
    payWay:0,// 支付方式，0代表未选择，1代表微信支付，2代表银行卡支付
    isEditNote:false,// 是否编辑备注

  },

  // 01 选择收货地址
  selectAddress(){
    wx.navigateTo({
      url: '/pages/user/addressManage/addressManage?type=1',
    })
  },
  // 02 选择支付方式
  selectPayWay(e){
    const id=e.currentTarget.dataset.id
    this.setData({
      payWay:id
    })
  },
  // 03 确认支付
  confirmPay(){
    const defaultAddress=this.data.defaultAddress
    const payWay=this.data.payWay
    // 如果没有选择地址
    if(defaultAddress._id==undefined){
      wx.showToast({
        title: '请选择收货地址',
        icon:'error'
      })
    }
    else if(payWay==0){
      wx.showToast({
        title: '请选择支付方式',
        icon:'error'
      })
    }
    else{
      // 进行支付
      if(payWay==1){
        const userData=app.globalData.userData
        const totalPrice=this.data.totalPrice
        // 支付
        // this.handlePay(userData.phone,totalPrice)

        // 测试
        this.saveToDB(generateOrderNumber(userData.phone),userData.phone,totalPrice)
      }
    }
  },

  // 04 支付处理,支付成功后将订单保存在数据库中
  async handlePay(userId,totalPrice) {
    try {
      // 调用云函数生成订单并获取支付参数
      const res = await wx.cloud.callFunction({
        name: 'wxPay',
        data: {
          phoneNumber: userId, // 用户ID，替换为实际用户ID
          totalAmount: totalPrice, // 订单总金额，单位为元
          token:app.globalData.token,// token
        },
      });

      const { success, data, payParams } = res.result;

      if (success) {
        // 调用微信支付 API
        await wx.requestPayment({
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: `prepay_id=${payParams.prepay_id}`,
          signType: 'MD5',
          paySign: payParams.paySign,
          success: (paymentRes) => {
            console.log('支付成功:', paymentRes);

            // 处理支付成功后的逻辑，例如跳转到支付成功页面
            this.saveToDB(payParams.out_trade_no,userId,totalPrice)

          },
          fail: (paymentError) => {
            console.error('支付失败:', paymentError);

            // 处理支付失败后的逻辑，例如提示用户重新支付
            wx.showToast({
              title: '支付失败，请重新支付',
              icon: 'none',
              duration: 2000,
            });
          },
        });
      } else {
        console.error('生成订单失败:', data);
        // 处理生成订单失败的逻辑，例如提示用户重新下单
        wx.showToast({
          title: '生成订单失败，请重新下单',
          icon: 'none',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('调用云函数失败:', error);
      // 处理调用云函数失败的逻辑，例如提示用户稍后再试
      wx.showToast({
        title: '调用云函数失败，请稍后再试',
        icon: 'none',
        duration: 2000,
      });
    }
  },
  // 04-1 保存到数据库,传入订单号等数据，保存成功后删除购物车对应数据
  saveToDB(out_trade_no,userId,totalPrice){
    const goodList=this.data.goodList
    const defaultAddress=this.data.defaultAddress
    const note=this.data.note
    const token=app.globalData.token
    const pageName=this.data.pageName

    // 调用云函数保存或更新订单数据
    wx.cloud.callFunction({
      name: 'saveOrder',
      data: {
        userId: userId,
        orderId: out_trade_no,
        totalPrice: totalPrice,
        status: 0,
        items: goodList,
        consignee: defaultAddress.name,
        phone: defaultAddress.phone,
        address: defaultAddress.address,
        notes: note,
        token: token,
        reduction:0 
      },
      success: (res) => {
        const { success, message } = res.result;

        if (success) {
          console.log('订单数据保存成功');

          // 清除购物车里的数据
          if(pageName=='cart')this.deleteCartDB(userId,token)
          else {
            wx.showToast({
              title: '下单成功',
              icon:'success'
            })
            .then(()=>{
              setTimeout(()=>{
                wx.navigateBack()
              },1000)
            })
            
          }
        } else {
          console.error('订单数据保存失败:', message);
          wx.showToast({
            title: '订单数据保存失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('调用云函数失败:', error);
        wx.showToast({
          title: '调用云函数失败',
          icon: 'none'
        });
      }
    });
  },
  // 04-2 删除goodList中的购物车记录进行删除
  deleteCartDB(userId, token) {
    const goodList = this.data.goodList;

    // 封装删除购物车记录的云函数调用为 Promise
    const deleteCartItem = (_id) => {
      return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name: 'deleteCartData',
          data: {
            userId: userId,  // 替换为实际的用户ID
            token: token,    // 替换为实际的Token
            _id: _id         // 替换为实际的购物车记录ID
          },
          success: (res) => {
            const { success, message } = res.result;
            if (success) {
              console.log('记录删除成功:', message);
              resolve();
            } else {
              console.error('记录删除失败:', message);
              reject(message);
            }
          },
          fail: (error) => {
            console.error('调用云函数失败:', error);
            reject(error);
          }
        });
      });
    };

    // 使用 Promise.all 处理所有的删除请求
    Promise.all(goodList.map(item => deleteCartItem(item._id)))
      .then(() => {
        // 所有记录删除成功后的逻辑...
        // 回到购物车
        wx.navigateBack()
      })
      .catch((error) => {
        // 处理任何一个记录删除失败后的逻辑...
      });
  },


  // 05 编辑备注
  editNote(){
    this.setData({
      isEditNote:!this.data.isEditNote
    })
  },

  // 06 获取备注输入
  getNoteContent(e){
    const value=e.detail.value
    this.setData({
      note:value
    })
    if(value.length<=10){
      this.setData({
        note1:value
      })
    }
  },

  onLoad(options) {
    const items = JSON.parse(decodeURIComponent(options.items)); 
    const totalPrice=options.totalPrice
    console.log(options)
    this.setData({
      goodList:items||[],
      totalPrice:totalPrice
    })
    console.log(this.data.goodList)
    // wx.setStorageSync(app.globalData.storageUrl+'goodList', items)

    // this.setData({
    //   goodList:wx.getStorageSync(app.globalData.storageUrl+'goodList')
    // })
    console.log(this.data.goodList)
  },
  // 在页面卸载时执行，用于删除本地缓存
  onUnload() {

  },
  onReady(){
    // this.setData({
    //   defaultAddress:wx.getStorageSync(app.globalData.storageUrl+'address')[0]
    // })
    // console.log(this.data.defaultAddress)
    console.log(app.globalData.userData.phone)
    console.log(app.globalData.token)
    // 调用云函数获取默认地址
    wx.cloud.callFunction({
      name: 'getDefaultAddress', // 替换为实际的云函数名字
      data: {
        userId: app.globalData.userData.phone, // 替换为实际的用户ID
        token: app.globalData.token // 替换为实际的用户Token
      },
      success: res => {
        const { success, data, message } = res.result;
        if (success) {
          console.log('默认地址获取成功:', data);
          this.setData({
            defaultAddress:data[0]
          })
          // wx.setStorageSync(app.globalData.storageUrl+'address', data)
          // 处理获取到的默认地址数据，例如更新页面上的数据等
        } else {
          console.error('默认地址获取失败:', message);
          wx.showToast({
            title: '默认地址获取失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: error => {
        console.error('默认地址获取失败：', error);
        wx.showToast({
          title: '调用云函数失败',
          icon: 'none',
          duration: 2000
        });
      }
    });

  },
  onShow(){
    // 获取当前页面栈
    const pages = getCurrentPages();
    // 获取上一个页面（可能是购物车页或地址页）的数据
    const prevPage = pages[pages.length - 2];
    
    // 判断是否有数据传递
    if (prevPage) {
      if (prevPage.data.pageName === 'cart') {
        // 从购物车页返回的数据
        const cartData = prevPage.data.cartData;
        console.log('从购物车页返回的数据:', cartData);
      } else if (prevPage.data.pageName === 'address') {
        // 从地址页返回的数据
        const selectedAddress = prevPage.data.selectedAddress;
        console.log(selectedAddress)
        this.setData({
          defaultAddress:selectedAddress
        })
      }
    }
  },
  

  // 处理备注输入
  inputnote(e) {
    this.setData({
      note: e.detail.value,
    });
  },

  // 提交订单
  confirmOrder() {
    // 获取用户输入的地址、电话、备注
    const address = this.data.address;
    const phone = this.data.phone;
    const note = this.data.note;
    // 验证电话号码格式
    const phoneNumber = phone.trim(); // 去除电话号码前后空格
    const phoneRegex = /^1\d{10}$/; // 11位数字的手机号码格式正则表达式
    const currentUserPhone = this.data.currentUserPhone;//我加的
    console.log('curr:',currentUserPhone);
    // 验证地址和电话是否为空
    if (!address) {
      wx.showToast({
        title: '请输入收货地址',
        icon: 'none'
      });
      return; // 如果地址为空，不继续执行下面的操作
    }
    if (!phoneRegex.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return; // 如果电话号码格式不正确，不继续执行下面的操作
    }

    // 获取本地缓存中的选中商品信息
    const selectedItems = wx.getStorageSync('selectedItems') || [];
    // 过滤掉数量为零的商品
    const filteredItems = selectedItems.filter(item => item.goodNum > 0);
    this.setData({
      selectedItems: filteredItems
    });

    // 构建 items 数组，包含商品的 id、name 和 goodNum,style,等等
    const items = filteredItems.map(item => ({
      id: item.id,
      name: item.name,
      goodNum: item.goodNum,
      style:item.style,
      shengao:item.shengao,
      tizhong:item.tizhong,
      houbei:item.houbei,
      jiankuan:item. jiankuan,
      xiuchang:item. xiuchang,
      lingkou:item. lingkou,
    }));

    
    // 根据需求将地址、电话、备注等信息添加到订单数据中
    const orderInfo = {
      orderNumber: generateOrderNumber(), // 生成随机订单号
      //items: selectedItems, // 商品信息数组no
      items:items,//json数组（json对象）
      totalPrice: this.data.totalPrice,
      address: address,
      phone: phone,
      note: note,
      time: new Date(),
      status: -1,//！！！改这里
      userId:currentUserPhone,//我加的
    };

    // 调用云开发数据库 API 存储订单信息
    const db = wx.cloud.database();
    const ordersCollection = db.collection("dingdan");

    ordersCollection
      .add({
        data: orderInfo,
        success: (res) => {
          console.log("订单存储成功", res);
          // 清空购物车或其他操作
        },
        fail: (err) => {
          console.error("订单存储失败", err);
        },
      });

      // wx.navigateTo({
      //   url: '/pages/pay/pay'
      // });
      wx.navigateTo({
        url: `/pages/pay/pay?totalPrice=${this.data.totalPrice}&orderNumber=${orderInfo.orderNumber}`
      });
  }

})

