Page({
  data: {

    goodList: [], // 商品列表
    totalPrice: 0.0, // 选中的商品总价
    cartData: [], // 购物车数据，从CMS的cart表获取
    payways: [],
    // 其他数据...
  },
  onLoad(options) {
    // 获取上一页checkout传递过来的总价和订单号数据
    const totalPrice = options.totalPrice;
    const orderNumber = options.orderNumber;
    // 将数据保存在 data 中，方便页面使用
    this.setData({
      totalPrice: totalPrice,
      orderNumber: orderNumber
    });
    // 获取支付方式
    wx.cloud.database().collection('PayWays').get()
      .then(res => {
        console.log('成功', res)
        this.setData({
          "payways": res.data
        })
      })

  },
  OK(options) {
    // 获取已选择的商品信息
    const selectedItems = wx.getStorageSync('selectedItems');
    // 获取上一页传递过来的总价和订单号数据
    const totalPrice = options.totalPrice;
    const orderNumber = options.orderNumber;
    // 将数据保存在 data 中，方便页面使用
    this.setData({
      totalPrice: totalPrice,
      orderNumber: orderNumber
    });
    console.log('订单号：', orderNumber);
    // 遍历购物车列表，删除已选择的商品信息
    const goodList = this.data.goodList.filter(item => !selectedItems.some(selectedItem => selectedItem._id === item._id));

    // 更新购物车页面中的商品列表
    this.setData({
      "goodList": goodList
    });

    // 清除本地缓存中的已选择商品信息
    wx.removeStorageSync('selectedItems');
    wx.switchTab({
      url: '/pages/cart/cart',
      // success:function(res){
      //   console.log('跳转')
      // }
    });
    wx.showToast({
      icon: 'none',
      title: '已完成支付',
    })
    console.log('ok')

    //调用微信支付！！！！！！！！！
    wx.cloud.callFunction({
      name: 'Pay',
      data: {
        orderNumber: orderNumber,
        //PayName: selectedItems.name,
        //PayPrice: selectedItems.price,
        totalPrice: totalPrice
      },
      success: res => {
        console.log("获取支付参数成功", res)
        const payment = res.result.payment
        //调取支付
        wx.requestPayment({
          //ex6的快捷写法
          ...payment,
          success(res) {
            console.log('支付成功', res)
          },
          fail(err) {
            console.error('支付失败', err)
          }
        })
      },
      fail: res => {
        console.log("获取支付参数失败", res)
      }
    })
  },
  //点击选择框，更新支付方式的选择状态
  checkboxClick(event) {
    const index = event.target.dataset.index;
    const payways = this.data.payways;

    for (let i = 0; i < payways.length; i++) {
      if (i === index) {
        payways[i].checked = true;
      } else {
        payways[i].checked = false;
      }
    }

    wx.cloud.database().collection('PayWays').doc(payways[index]._id).update({
      data: {
        checked: false
      }
    }).then(res => {
      console.log('更新数据成功', res);
      this.setData({
        payways: payways
      });
    }).catch(err => {
      console.error('更新数据失败', err);
    });
  },
})
