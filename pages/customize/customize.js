Page({
  data: {
    toastContent: "1. 可定制项包括主体花色（即衣服主体色调）、衣襟花色、袖子花色、扣子样式、领口花色、衣服材质；\r\n2. 选择样式时，可点击图片，进行预览；\r\n 3. 定制需要支付额外的费用，首次免费；\r\n4. 材质等配置不同，价格可能不同，属于正常情况；\r\n5. 如有额外需求可联系客服，qq:3324419132，微信：xxxx；\r\n5. 点击左上角“?”可再次查看",
    customizeData: [
      {
        "name":"方案1",
        "price":195,
        "num":1
      },
      {
        "name":"红色小棉袄",
        "price":220,
        "num":2
      },
      {
        "name":"中式小棉袄",
        "price":415,
        "num":2
      },
      {
        "name":"方案2",
        "price":305,
        "num":1
      }
    ],
    totalPrice:0,
    total:0,
    editStatus: false,
    placeHoldeName: '',
    option2: [
      { text: '默认排序', value: 'a' },
      { text: '好评排序', value: 'b' },
      { text: '销量排序', value: 'c' },
    ],
    value2: 'a',
    indexList: [0, 1, 1, 2, 3,0],
    rangeList:[
      ["花色1","花色2","花色3","花色4"],
      ["花色1","花色2","花色3","花色4"],
      ["花色1","花色2","花色3","花色4"],
      ["花色1","花色2","花色3","花色4"],
      ["扣子1","扣子2","扣子3","扣子4","扣子5"],
      ['全棉','棉麻'],
    ],
    imageUrlList:[
      "/images/customize/hi.png",
      "/images/newPart/1.png",
      "/images/newPart/2.png",
      "/images/newPart/3.png",
      "/images/newPart/4.png",
    ]
  },

  // 点击添加方案
  showAddPage() {
    this.setData({
      editStatus: true,
      placeHoldeName: this.generateRandomName()
    })
  },

  // 点击关闭添加页面
  closeCustomizeData() {
    this.setData({
      editStatus: false
    })
  },

  // 点击图片预览
  previewImage(e) {
    const imageUrl = e.currentTarget.dataset.url;
    console.log(imageUrl)
    wx.previewImage({
      current: imageUrl,
      urls: [imageUrl]
    });
  },

  // 点击显示定制规则
  showRules() {
    wx.showModal({
      title: '小棉袄定制规则',
      content: this.data.toastContent,
      showCancel: false,
      complete: (res) => {
        if (res.confirm) {
          wx.setStorageSync('customizeHistoryStatus', true)
        }
      }
    });
  },

  // 生成随机名称
  generateRandomName() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 6;
    let randomName = '方案';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomName += characters[randomIndex];
    }

    return randomName;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      placeHoldeName: this.generateRandomName()
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    const HistoryStatus = wx.getStorageSync('customizeHistoryStatus');
    if (HistoryStatus == null || HistoryStatus == false) {
      wx.showModal({
        title: '小棉袄定制规则',
        content: this.data.toastContent,
        showCancel: false,
        complete: (res) => {
          if (res.confirm) {
            wx.setStorageSync('customizeHistoryStatus', true)
          }
        }
      });
    }
  },

  // 以下为其他生命周期函数和事件处理函数，保持不变
});
