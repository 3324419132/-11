// components/empty/emptyItem.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: {
      type: Boolean,
      value: true,
    },
    imageUrl:{
      type:String,
      value:''
    },
    title:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow:true,
    imageUrl:'',
    title:'',
  },
  lifetimes:{
    attached(){
      this.setData({
        isShow:this.properties.isShow,
        imageUrl:this.properties.imageUrl,
        title:this.properties.title
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
