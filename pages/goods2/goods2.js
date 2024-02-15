const db = wx.cloud.database();
const app=getApp()

Page({
  data: {




    /**   张雪成   */
    imgIndex:-1,// 款式第几个
    fabricsIndex:-1,// 面料第几个
    goodNum:1,//商品数量
    type:0,//0代表是加入购物车，1代表是直接购买
    height:'',
    weight:'',
    jiankuan:'',
    houbei:'',
    xiuchang:'',
    lingkou:'',
    showModal: false,// 是否显示弹窗
    // 包括样式、图片、价格、剩余量等
    goodMsg:{
    }


  },
  // 01 点击购物车，前往购物车页面
  navigatorToCart(){
    app.globalData.tabbarSwitched=true
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },
  // 02 点击确认款式
  pickChange(e){
    const value=e.detail.value
    const id=e.currentTarget.dataset.id
    const price=this.data.goodMsg.fabrics.price
    if(value==-1)wx.showToast({
      title: '非法选择',
      icon:'error'
    })
    else {
      if(id==1){
        this.setData({
          imgIndex:value,
        })
      }
      else {
        this.setData({
          fabricsIndex:value,
          'goodMsg.price':price[value]
        })
      }
    }
  },
  // 03 获取输入内容
  getInputContent(e){
    const id=e.currentTarget.dataset.id
    const value=e.detail.value
    if(id==1)this.setData({
      height:value
    })
    else if(id==2)this.setData({
      weight:value
    })
    else if(id==3)this.setData({
      jiankuan:value
    })
    else if(id==4)this.setData({
      houbei:value
    })
    else if(id==5)this.setData({
      xiuchang:value
    })
    else if(id==6)this.setData({
      lingkou:value
    })
  },

  // 04 增加商品数量
  addGoodNum(){
    const remainingNum=this.data.goodMsg.remainingNum
    const goodNum=this.data.goodNum
    if(remainingNum<goodNum+1)wx.showToast({
      title: '余量不足',
      icon:'error'
    })
    else this.setData({
      goodNum:goodNum+1
    })
  },
  // 05 减少商品数量
  reduceGoodNum(){
    const goodNum=this.data.goodNum
    if(goodNum==1)wx.showToast({
      title: '最少一个哦~',
      icon:'error'
    })
    else this.setData({
      goodNum:goodNum-1
    })
  },
  // 06 点击加入购物车,id:0为购物车，1为购买
  openCartModal(e) {  //先检查是否登录！！！
    const id=e.currentTarget.dataset.id
    let userData=app.globalData.userData
    this.setData({
      height:'',
      weight:'',
      jiankuan:'',
      houbei:'',
      xiuchang:'',
      lingkou:'',
      goodNum:1,
      imgIndex:-1,
      fabricsIndex:-1
    })
    if (userData.phone!=null) {
      // 用户已登录，可以打开购物车模态框
      this.setData({
        showModal: true,
        type:id
      });
    } else {
      // 用户未登录，显示提示
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      });
    }
  },
  // 08 确认加入购物车/购买，type:0为购物车，1为购买
  confirmAddCart(){
    
    const height=this.data.height
    const weight=this.data.weight
    const jiankuan=this.data.jiankuan
    const houbei=this.data.houbei
    const xiuchang=this.data.xiuchang
    const lingkou=this.data.lingkou
    const imgIndex=this.data.imgIndex
    const fabricsIndex=this.data.fabricsIndex

    const styles=this.data.goodMsg.style
    const price=this.data.goodMsg.price
    const goodNum=this.data.goodNum
    const images=this.data.goodMsg.picture
    const name=this.data.goodMsg.name
    const type=this.data.type
    const _id=this.data.goodMsg._id


    console.log(images)
    console.log(imgIndex)
    if(height==''||weight==''||jiankuan==''||houbei==''||xiuchang==''||lingkou==''||imgIndex==-1||fabricsIndex==-1)wx.showToast({
      title: '请完善款式',
      icon:'error'
    })
    else{
      // 加入购物车
      const cartData={
        style:styles[imgIndex],
        imageUrl:images[imgIndex],
        shengao:height,
        tizhong:weight,
        jiankuan:jiankuan,
        houbei:houbei,
        xiuchang:xiuchang,
        lingkou:lingkou,
        price:price,
        name:name,
        goodNum:goodNum,
        _id,
        userId:app.globalData.userData.phone
      }
      const token=app.globalData.token
      // 加入购物车
      if(type==0)wx.cloud.callFunction({
        name: 'addToCart',
        data: {
          token: token,
          cartData: cartData,
          _id:_id
        },
        success: (res) => {
          const { success, message } = res.result;
          if (success) {
            wx.showToast({
              title: '添加成功',
              icon:"success"
            })
            this.setData({
              showModal:false
            })
            console.log('数据添加成功:', message);
            // 处理成功后的逻辑...
          } else {
            console.error('数据添加失败:', message);
            // 处理失败后的逻辑...
          }
        },
        fail: (error) => {
          console.error('调用云函数失败:', error);
          // 处理调用失败后的逻辑...
        }
      });
      // 进入订单支付页
      else{
        const item=[{
          style:styles[imgIndex],
          imageUrl:images[imgIndex],
          shengao:height,
          tizhong:weight,
          jiankuan:jiankuan,
          houbei:houbei,
          xiuchang:xiuchang,
          lingkou:lingkou,
          price:price,
          name:name,
          goodNum:goodNum,
          _id,
          userId:app.globalData.userData.userId
        }]
        console.log(item)
        var itemString = JSON.stringify(item); 
        this.setData({
          showModal:false
        })
        wx.navigateTo({
          url: '/pages/checkout/checkout?items='+encodeURIComponent(itemString)+'&fromPage=cart'+'&fromPage=cart&totalPrice='+goodNum*price
        });
      }

    }
  },
  // 09 点击蒙版关闭
  cancelModel(){
    this.setData({
      showModal:false
    })
  },



  view3DModel:function(){
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },

  onLoad(options) {
    const item = JSON.parse(decodeURIComponent(options.item)); // 解码并解析字符串
    const type=options.type
    if(type==1)this.setData({
      goodMsg:item
    })
    console.log(this.data.goodMsg)
  },



  hideCartModal() {
    this.setData({
      showModal: false
    });
  },



  hideCartModal2() {
    this.setData({
      showModal2: false
    });
  },

  styleChange(event) {
    const selectedIndex = event.detail.value;
    const selectedStyle = this.data.styles[selectedIndex];

    this.setData({
      selectedStyle: selectedStyle
    });
  },

  inputHeight(event) {
    const height = event.detail.value;
    this.setData({
      height: height
    });
  },

  inputWeight(event) {
    const weight = event.detail.value;
    this.setData({
      weight: weight
    });
  },

  inputBackLength(event) {
    const backLength = event.detail.value;
    this.setData({
      backLength: backLength
    });
  },

  inputShoulderWidth(event) {
    const shoulderWidth = event.detail.value;
    this.setData({
      shoulderWidth: shoulderWidth
    });
  },

  inputSleeveLength(event) {
    const sleeveLength = event.detail.value;
    this.setData({
      sleeveLength: sleeveLength
    });
  },

  inputCollar(event) {
    const collar = event.detail.value;
    this.setData({
      collar: collar
    });
  },

  // 加入购物车-跳转到购物车cart2页面
  addToCart() {
    // 获取半弹窗里填入和选择的数据
    const selectedStyle = this.data.selectedStyle;
    const height = this.data.height;
    const weight = this.data.weight;
    const backLength = this.data.backLength;
    const shoulderWidth = this.data.shoulderWidth;
    const sleeveLength = this.data.sleeveLength;
    const collar = this.data.collar;
    const currentUserPhone = this.data.currentUserPhone;
  
    // 获取商品的id和name和price，假设它们在detail中
    const productId = this.data.detail.id;
    const productName = this.data.detail.name;
    const productPrice = this.data.detail.price; 
    // 进行表单验证
    if (selectedStyle === '点击选择') {
      wx.showToast({
        title: '请选择款式',
        icon: 'none',
      });
      return;
    }
    if (!height || !weight || !backLength || !shoulderWidth || !sleeveLength || !collar) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none',
      });
      return;
    }
    // 构造要保存到cart表中的数据对象
    const cartItem = {
      id: productId, // 商品ID
      name: productName, // 商品名称
      style:selectedStyle,//款式！
      price:productPrice,
      shengao: height, // 身高
      tizhong: weight, // 体重
      houbei: backLength, // 后背
      jiankuan: shoulderWidth, // 肩宽
      xiuchang: sleeveLength, // 袖长
      lingkou: collar, // 领口
      userId:currentUserPhone,
    };
  
    // 在这里执行将cartItem传输到CMS的代码，具体取决于您的CMS实现方式
    const cartCollection = db.collection("cart");

    cartCollection
      .add({
        data: cartItem,
        success: (res) => {
          console.log("购物车添加成功", res);
          // 清空购物车或其他操作
    
          // 页面跳转放在购物车添加成功的回调函数中
          wx.switchTab({              // 要跳转的TabBar页面路径 
            url: '/pages/cart2/cart2',   //!
            success: (res) => {
              // 跳转成功的回调函数
            },
            fail: (err) => {
              console.error("页面跳转失败", err);
            },
          });
        },
        fail: (err) => {
          console.error("购物车添加失败", err);
        },
      });
    // 关闭半弹窗
    this.hideCartModal();
  },

  //立即购买-跳转到确认订单ckeckout页面
  addToCheckout() {
    // 获取半弹窗里填入和选择的数据--学的上面转到cart的信息
    const selectedStyle = this.data.selectedStyle;
    const height = this.data.height;
    const weight = this.data.weight;
    const backLength = this.data.backLength;
    const shoulderWidth = this.data.shoulderWidth;
    const sleeveLength = this.data.sleeveLength;
    const collar = this.data.collar;
    const currentUserPhone = this.data.currentUserPhone;
    // 获取商品的id和name和price，假设它们在detail中
    const productId = this.data.detail.id;
    const productName = this.data.detail.name;
    const productPrice = this.data.detail.price; 
    // 默认数量为1
    const defaultQuantity = 1;
    // 进行表单验证
  if (selectedStyle === '点击选择') {
    wx.showToast({
      title: '请选择款式',
      icon: 'none',
    });
    return;
  }
  if (!height || !weight || !backLength || !shoulderWidth || !sleeveLength || !collar) {
    wx.showToast({
      title: '请填写完整信息',
      icon: 'none',
    });
    return;
  }
    const selectedItems = {
      id: productId, // 商品ID
      name: productName, // 商品名称
      style:selectedStyle,//款式！
      price:productPrice,
      shengao: height, // 身高
      tizhong: weight, // 体重
      houbei: backLength, // 后背
      jiankuan: shoulderWidth, // 肩宽
      xiuchang: sleeveLength, // 袖长
      lingkou: collar, // 领口
      goodNum: defaultQuantity, // 默认数量为1
      userId:currentUserPhone //把获取的全局变量用户手机号，存到该购物内容中，使得购物车能通过这个主标识分别不同用户
    };

    let existingSelectedItems = wx.getStorageSync('selectedItems') || [];

    if (!Array.isArray(existingSelectedItems)) {
      existingSelectedItems = [existingSelectedItems];
    }

    existingSelectedItems.push(selectedItems);

    wx.setStorageSync('selectedItems', existingSelectedItems);

    wx.navigateTo({
      url: '/pages/checkout/checkout'
    });

    this.hideCartModal2();
  },
  // 分享按钮点击事件
  onShareAppMessage() {
    return {
      title: '分享标题', // 分享标题
      path: '/pages/home/home', // 分享页面的路径
      imageUrl: '/images/share-image.png', // 分享封面图
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  onShareTimeline(){

  },
});
