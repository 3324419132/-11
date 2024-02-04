//某个用户的购物车
const app=getApp()
Page({
  data: {
    indexList:[],// 选择情况
    total: 0, // 选中的商品总数量
    totalPrice: 0.0, // 选中的商品总价
    cartData: [], // 购物车数据，从CMS的cart表获取
    pageName:'cart',// 页面名称
    isAllSelected:false,// 是否全选了
    detailList:[]
  },
  // 01 点击减少/增加商品按钮，id：1减少，2增加
  numChangeClick(e) {
    const index=e.currentTarget.dataset.index
    const id=e.currentTarget.dataset.id
    let list=this.data.cartData
    let item=list[index]
    // 是减少的且当前为1
    if(item.goodNum==1&&id==1)wx.showToast({
      title: '至少选择1个',
      icon:'error'
    })
    // 是增加的但当前余量不足,暂不考虑
    // else if(item.goodNum==item.remainingNum&&id==2){}
    else{
      if(id==1)item.goodNum=item.goodNum-1
      else item.goodNum=item.goodNum+1
      console.log(item)
      list[index]=item
      console.log(list)
      this.setData({
        cartData:list
      })
      this.totallize()
      // 调用云函数
      wx.cloud.callFunction({
        name: 'updateCartData', // 云函数名称
        data: {
          userId: app.globalData.userData.phone,
          token: app.globalData.token,
          _id: item._id,       // 商品在购物车中的唯一标识
          goodNum: item.goodNum // 更新后的商品数量
        },
        success: (res) => {
          const { success, message } = res.result;
          if (success) {
            console.log('更新商品数量成功:', message);
            // 处理更新成功后的逻辑...
          } else {
            console.error('更新商品数量失败:', message);
            // 处理更新失败后的逻辑...
          }
        },
        fail: (error) => {
          console.error('调用云函数失败:', error);
          // 处理调用失败后的逻辑...
        }
      });
    }
  },
  // 02 自动计算总价
  totallize() {
    const cartData = this.data.cartData;
    const indexList=this.data.indexList
    let total = 0;
    let totalPrice = 0.0;
    for(var i=0;i<cartData.length;i++){
      if(indexList[i]){
        total+=cartData[i].goodNum
        totalPrice+=cartData[i].goodNum*cartData[i].price
      }
    }
    this.setData({
      total:total,
      totalPrice:totalPrice.toFixed(2)
    })
  },
  // 03 点击选择框,勾选对应订单
  checkboxClick(e) {
    const index=e.currentTarget.dataset.index
    let indexList=this.data.indexList
    indexList[index]=indexList[index]?false:true
    this.setData({
      indexList:indexList
    })
    // 计算价格
    this.totallize()
    // 判断是否全选
    this.isAllSelected()
  },
  // 04 判断是否全部勾选了
  isAllSelected(){
    const indexList=this.data.indexList
    if(indexList.every(element => element === true))this.setData({
      isAllSelected:true
    })
    else this.setData({
      isAllSelected:false
    })
  },
  // 05 点击全选/全不选
  selectAll(){
    console.log("dsds")
    const isAllSelected=this.data.isAllSelected
    const len=this.data.indexList.length
    if(isAllSelected){
      this.setData({
        indexList:Array(len).fill(false),
        isAllSelected:false
      })
    }
    else {
      this.setData({
        indexList:Array(len).fill(true),
        isAllSelected:true
      })
    }
    this.totallize()
  },
  // 06 点击结算进入结算页
  toCheckout() {
    if (this.data.totalPrice == 0) {   
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
    } 
    else if(app.globalData.userData.phone==undefined){
      wx.showToast({
        title: '请先登录',
        icon:'error'
      })
    }
    else{
      const indexList=this.data.indexList
      const cartData=this.data.cartData
      // 使用 map 方法遍历 indexList 数组，根据对应元素是否为 true 进行过滤
      const filteredData = indexList.map((value, index) => {
        // 如果 indexList 中对应位置为 true，则返回 cartData 中对应位置的元素，否则返回 null
        return value ? cartData[index] : null;
      });
      // 使用 filter 方法过滤掉为 null 的元素
      const selectedItems = filteredData.filter(item => item !== null);
      // 存储选中的商品信息到本地缓存
      // wx.setStorageSync('selectedItems', selectedItems);
      console.log(selectedItems)
      var itemString = JSON.stringify(selectedItems); 
      // 跳转到订单确认页面
      wx.navigateTo({
        url: '/pages/checkout/checkout?items='+encodeURIComponent(itemString)+'&fromPage=cart'+'&fromPage=cart&totalPrice='+this.data.totalPrice
      });

    }
  },
  // 07 调用获取数据
  getCartData(){
    const userId=app.globalData.userData.phone
    const token=app.globalData.token
     // 调用云函数
     wx.cloud.callFunction({
      name: 'getCartData',
      data: {
        userId: userId,
        token: token,
      },
      success: (res) => {
        const { success, message, data } = res.result;
        if (success) {
          // 更新页面数据
          this.setData({
            cartData: data,
            indexList:Array(data.length).fill(false),
            detailList:Array(data.length).fill(false)
          });
          console.log('获取购物车数据成功:', data);
        } else {
          console.error('获取购物车数据失败:', message);
        }
      },
      fail: (error) => {
        console.error('调用云函数失败:', error);
      }
    });
  },

  // 08 切换商品详情的显示和隐藏状态
  toggleDetail(event) {
    const index = event.currentTarget.dataset.index;
    let detailList=this.data.detailList
    detailList[index]=detailList[index]?false:true
    console.log(this.data.detailList)
    this.setData({
      detailList
    })
  },

  // 09 点击删除按钮，弹出确认对话框
  confirmDelete(e) {
    const index = e.currentTarget.dataset.index;
    const cartData=this.data.cartData
    const userId=app.globalData.userData.phone
    const token=app.globalData.token
    // 使用 wx.showModal 显示确认对话框
    wx.showModal({
      title: '确认删除',
      content: '是否将该商品从购物车中移除？',
      confirmText: '是',
      cancelText: '否',
      success: (res) => {
        if (res.confirm) {
          // 用户点击了确认按钮，执行删除操作
          wx.cloud.callFunction({
            name: 'deleteCartData',
            data: {
              userId: userId,
              token: token,
              _id:cartData[index]._id
            },
            success: (res) => {
              const { success, message, data } = res.result;
              if (success) {
                // 更新页面数据
                wx.showToast({
                  title: '删除成功',
                  icon:'success'
                })
                this.setData({
                  cartData:cartData.splice(index)
                })
              } else {
                console.error('删除数据失败:', message);
              }
            },
            fail: (error) => {
              console.error('调用云函数失败:', error);
            }
          });
        }
        // 如果用户点击了取消按钮，可以不执行任何操作，对话框会自动关闭
      },
    });
  },


  onLoad() {
    console.log("sda")
    this.getCartData()
  },



  // 删除购物车中的商品--并且弹窗中选择了“是”--即真的删除
  deleteItem(index) {                                                   //！！
    //const index = e.currentTarget.dataset.index; // 获取点击的商品索引  //！！！
    const goodList = this.data.goodList;
    const itemToDelete = goodList[index]; // 获取要删除的商品信息，包括 _id

    // 在goodList中移除对应索引的商品
    goodList.splice(index, 1);
    // 更新页面数据，重新渲染购物车列表
    this.setData({
      goodList: goodList
    });
    // 更新本地缓存中的购物车数据
    wx.setStorageSync('cart', goodList);
    // 删除 CMS 中的 cart 表中的对应数据
    const db = wx.cloud.database();
    db.collection('cart').doc(itemToDelete._id).remove({
      success: (res) => {
        console.log('删除成功', res);
      },
      fail: (err) => {
        console.error('删除失败', err);
      }
    });

    // 如果需要进行其他操作（例如更新总价等），在此处添加相关逻辑
  },

  onShow(options) {  //wz+
    if(app.globalData.tabbarSwitched){
      this.getCartData()
      app.globalData.tabbarSwitched=false
    }
  },

  refreshData() {  //wz+
    // 获取CMS的cart表数据
    wx.cloud.database().collection('cart')
    .where({   
        userId: this.data.currentUserPhone
    })
    .get()
    .then(res => {   //调用后台cart表数据
        console.log('请求到的数据', res);
        const goodList = res.data.map(item => ({
            ...item,
            checked: false, // 默认未选中
            goodNum: 0, // 默认数量为 0
        }));
        this.setData({
            goodList: goodList
        });
    });
  },

  

  // 点击增加按钮
  plusClick(event) {
    const index = event.target.dataset.index;
    const goodList = this.data.goodList;
    goodList[index].goodNum++;

    this.setData({
      "goodList": goodList
    });
    this.totallize();
  },





  // 全选
  SelectAll() {
    const goodList = this.data.goodList;
    const isSelectAll = this.data.isSelectAll;
    for (let i = 0; i < goodList.length; i++) {
      goodList[i].checked = !isSelectAll;
    }
    this.setData({
      "isSelectAll": !isSelectAll,
      "goodList": goodList
    });
    this.totallize();
  },


  
/**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    console.log('onPullDownRefresh')
  },

})
