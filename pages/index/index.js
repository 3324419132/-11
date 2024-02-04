
import { registerGLTFLoader } from '../../gltf-loader';
import { createScopedThreejs } from '../../three';


var camera, scene, renderer, model;
let camera_parent;//可改变的相机
var requestAnimationFrame; // 动画回调函数

let angle = Math.PI / 180; //角度 用来复位模型
let angleUpDown = Math.PI / 180; //角度 用来复位模型

let tranAngle = 0;//平移左右
let tranAngleUpDown = 0;//平移上下

Page({
  data: {
    iconShow: 0,//旋转的四个按钮都能点击 1只能点击左右两个按钮，2只能点击上下两个按钮
  },
  onLoad: function () {
    let that = this;

    var query = wx.createSelectorQuery();
    query.select('#webgl').node().exec((res) => {

      var canvas = res[0].node;
      // 设置背景透明
      // var gl = canvas.getContext('webgl', {
      //   alpha: true
      // });

      if (canvas != undefined) {
        //  canvas.width 和canvas.style都需要设置，否则无法显示渲染
        canvas.width = canvas._width;
        canvas.height = canvas._height;
        requestAnimationFrame = canvas.requestAnimationFrame;
        that.init(canvas);
      }
    });
  },

  init: function (canvas) {
    let that = this;
    const THREE = createScopedThreejs(canvas)
    registerGLTFLoader(THREE)
    //设置相机
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.25, 100);

    camera.position.set(-5,50,30);//设置这里！！
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene = new THREE.Scene();

    camera_parent = new THREE.Object3D(); //将相机放一个三维物体里
    camera_parent.position.set(0, 0, 0);
    camera_parent.add(camera);
    scene.add(camera_parent);

    // var axes = new THREE.AxisHelper(30);//xyz轴的标线
    // scene.add(axes);

    //设置光线
    var light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0, 20, 0);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 20, 10);
    scene.add(light);
    // 加载本地模型
    var loader = new THREE.GLTFLoader();
    loader.load('http://s29qy3yb8.bkt.clouddn.com/3D.glb?e=1696867454&token=yMZbt_T0Fo4Ky7a2yvp77udFSjJRg5Xi3rrL64jv:MOMksATgqo1KLxAcFXkEuWJynQ8=', function (gltf) {
  // loader.load('https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb', function (gltf) {
      model = gltf.scene;
      scene.add(model);
    }, undefined, function (e) {
      console.error(e);
    });
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvas.width, canvas.height);
    //调用动画
    that.animate();
  },

  animate: function () {
    let that = this;
    requestAnimationFrame(that.animate);
    renderer.render(scene, camera);
  },


  /** 左右旋转 */
  // 单击旋转
  rotate: function (event) {

    this.setData({
      iconShow: 1
    })
    var type = event.currentTarget.dataset.index;
    if (type == "0") {
      camera_parent.rotateY((5 / 180) * Math.PI); //向左旋转
      angle = angle - (5 / 180) * Math.PI;
    } else {
      camera_parent.rotateY(-(5 / 180) * Math.PI); //向右旋转
      angle = angle + (5 / 180) * Math.PI;
    }
  },

  // 长按连续旋转
  rotateAnimate: function (event) {
    this.setData({
      iconShow: 1
    })
    let that = this;
    var type = event.currentTarget.dataset.index;
    if (type == "0") {
      camera_parent.rotateY((5 / 180) * Math.PI); //向左旋转
      angle = angle - (5 / 180) * Math.PI;
    } else {
      camera_parent.rotateY(-(5 / 180) * Math.PI); //向右旋转
      angle = angle + (5 / 180) * Math.PI;
    }

    let timerAnimate = setTimeout(function () {

      that.rotateAnimate(event);
    }, 100)

    //触摸停止，清除
    if (that.data.touchEnd == 0) {
      clearTimeout(timerAnimate);
    }

  },

  //触摸开始
  touchStart: function () {

    this.setData({
      "touchEnd": 1
    })
  },

  //触摸结束
  touchEnd: function () {
    this.setData({
      "touchEnd": 0
    })
  },



  /** 上下旋转 */
  // 单击旋转
  rotateUpDown: function (event) {
    this.setData({
      iconShow: 2
    })
    var type = event.currentTarget.dataset.index;
    if (type == "0") {
      camera_parent.rotateY((5 / 180) * Math.PI); //向上旋转
      angleUpDown = angleUpDown - (5 / 180) * Math.PI;
    } else {
      camera_parent.rotateX(-(5 / 180) * Math.PI); //向下旋转
      angleUpDown = angleUpDown + (5 / 180) * Math.PI;
    }
  },

  // 长按连续旋转
  rotateAnimateUpDwon: function (event) {

    let that = this;
    that.setData({
      iconShow: 2
    })
    var type = event.currentTarget.dataset.index;
    if (type == "0") {
      camera_parent.rotateX((5 / 180) * Math.PI); //向上旋转
      angleUpDown = angleUpDown - (5 / 180) * Math.PI;
    } else {
      camera_parent.rotateX(-(5 / 180) * Math.PI); //向下旋转
      angleUpDown = angleUpDown + (5 / 180) * Math.PI;
    }

    let timerAnimate = setTimeout(function () {

      that.rotateAnimateUpDwon(event);
    }, 100)

    //触摸停止，清除
    if (that.data.touchEnd == 0) {
      clearTimeout(timerAnimate);
    }


  },


  //复位
  correct: function () {

    // 复位上下旋转
    if (angleUpDown !== Math.PI / 180 & this.data.iconShow == 2) {
      camera_parent.rotateX(angleUpDown);
      angleUpDown = Math.PI / 180; //角度 用来复位模型
    }


    // 复位左右旋转
    if (angle !== Math.PI / 180 & this.data.iconShow == 1) {
      camera_parent.rotateY(angle);
      angle = Math.PI / 180; //角度 用来复位模型
    }

    this.setData({
      iconShow: 0
    })

  },


  /** 平移 */
  //复位
  restore: function () {

    // 复位上下平移
    if (tranAngleUpDown != 0) {
      camera_parent.translateY(tranAngleUpDown);
      tranAngleUpDown = 0;
    }

    // 复位左右平移
    if (tranAngle != 0) {
      camera_parent.translateX(tranAngle);
      tranAngle = 0;
    }

  },

  // 单击
  translateUpDown: function (event) {

    var type = event.currentTarget.dataset.index;

    if (type == "0") {

      camera_parent.translateY(-1);//沿着y轴正方向平移
      tranAngleUpDown = tranAngleUpDown + 1;
    } else {

      camera_parent.translateY(1);//沿着y轴反方向平移
      tranAngleUpDown = tranAngleUpDown - 1;
    }


  },


  // 长按平移 上下平移
  translateAnimateUpDwon: function (event) {

    let that = this;
    var type = event.currentTarget.dataset.index;

    if (type == "0") {
      camera_parent.translateY(-1);//沿着y轴正方向平移
      tranAngleUpDown = tranAngleUpDown + 1;
    } else {
      camera_parent.translateY(1);//沿着y轴反方向平移
      tranAngleUpDown = tranAngleUpDown - 1;
    }

    let timerAnimate = setTimeout(function () {

      that.translateAnimateUpDwon(event);
    }, 100)

    //触摸停止，清除
    if (that.data.touchEnd == 0) {
      clearTimeout(timerAnimate);
    }


  },


  // 单击 左右平移
  translate: function (event) {

    var type = event.currentTarget.dataset.index;

    if (type == "0") {

      camera_parent.translateX(-1);//沿着x轴正方向平移
      tranAngle = tranAngle + 1;
    } else {

      camera_parent.translateX(1);//沿着x轴反方向平移
      tranAngle = tranAngle - 1;
    }


  },

  // 长按平移 左右平移
  translateAnimate: function (event) {

    let that = this;
    var type = event.currentTarget.dataset.index;

    if (type == "0") {
      camera_parent.translateX(-1);//沿着x轴正方向平移
      tranAngle = tranAngle + 1;
    } else {
      camera_parent.translateX(1);//沿着x轴反方向平移
      tranAngle = tranAngle - 1;
    }

    let timerAnimate = setTimeout(function () {

      that.translateAnimate(event);
    }, 100)

    //触摸停止，清除
    if (that.data.touchEnd == 0) {
      clearTimeout(timerAnimate);
    }


  },


})
