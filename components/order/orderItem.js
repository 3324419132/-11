// components/order/orderItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderList: {
      type: Array,
      value: [],
    }
  },
  

  /**
   * 组件的初始数据
   */
  data: {
    orderList:[]
  },
  lifetimes:{
    attached(){
      this.setData({
        orderList:this.properties.orderList
      })
    }
  },


  /**
   * 组件的方法列表
   */
  methods: {
    // 点击查看详情，进入详情页
    checkDetail(e){
      const item=e.currentTarget.dataset.item
      this.triggerEvent("checkDetail",{orderItem:item})
      
    },
  }
})
