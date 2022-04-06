// 光照示例
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
import { GUI } from 'dat.gui'
const gui = new GUI();

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}

class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
  folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
  folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
  folder.open();
}

export default function scene08 (app) {
  app.camera.position.set(0, 10, 20);

  // 滚轮缩放画面, 鼠标拖拽调整视角
  const controls = new OrbitControls(app.camera, app.canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  {
    const planeSize = 40;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    app.add(mesh);
  }
  {
    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshStandardMaterial({color: '#8AC'});
    const mesh = new THREE.Mesh(cubeGeo, cubeMat);
    mesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    app.add(mesh);
  }
  {
    const sphereRadius = 3;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
    const sphereMat = new THREE.MeshStandardMaterial({color: '#CA8'});
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    mesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
    app.add(mesh);
  }

  /* 环境光, 颜色简单叠加, 没有立体感
  // color = materialColor * light.color * light.intensity;
  {
    const color = 0xFFFFFF;
    const intensity = 0;
    const light = new THREE.AmbientLight(color, intensity);
    app.add(light);

    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('ambientColor');
    gui.add(light, 'intensity', 0, 2, 0.01);
  }

  // 半球光, 用来表现天空和地面颜色映照到物体上的效果
  {
    const skyColor = 0xB1E1FF; // light blue
    const groundColor = 0xB97A20; // brownish orange
    const intensity = 0;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    app.add(light);

    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
    gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
    gui.add(light, 'intensity', 0, 2, 0.01);
  }

  // 方向光, 用来表现太阳光照
  // 方向光并不是从某个点发射出来的，而是从一个无限大的平面内，
  // 发射出全部相互平行的光线。
  // 注意 light 和 light.target 都要加到场景中
  {
    const color = 0xFFFFFF;
    const intensity = 0;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(0, 10, 0);
    light.target.position.set(-5, 0, 0);
    app.add(light);
    app.add(light.target);
    const helper = new THREE.DirectionalLightHelper(light);
    app.add(helper);

    function updateLight () {
      light.target.updateMatrixWorld()
      helper.update()
    }
    updateLight()

    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('sunColor');
    gui.add(light, 'intensity', 0, 2, 0.01);
    makeXYZGUI(gui, light.position, 'position', updateLight)
    makeXYZGUI(gui, light.target.position, 'target', updateLight)
  }

  // 点光源, 烛火
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(0, 10, 0);
    app.add(light);
    const helper = new THREE.PointLightHelper(light);
    app.add(helper);

    function updateLight () {
      helper.update()
    }
    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('pointColor');
    gui.add(light, 'intensity', 0, 2, 0.01);
    gui.add(light, 'distance', 0, 40).onChange(updateLight)
    makeXYZGUI(gui, light.position, 'point', updateLight)
  }

  // 聚光灯。可以看成是一个点光源被一个圆锥体限制住了光照的范围。
  // 实际上有两个圆锥，内圆锥和外圆锥。
  // 光照强度在两个锥体之间从设定的强度递减到 0
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.SpotLight(color, intensity);
    app.add(light);
    app.add(light.target);
    const helper = new THREE.SpotLightHelper(light);
    app.add(helper);

    function updateLight () {
      light.target.updateMatrixWorld()
      helper.update()
    }
    updateLight()

    gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
    gui.add(light, 'penumbra', 0, 1, 0.01);
    gui.add(light, 'distance', 0, 40).onChange(updateLight)
    makeXYZGUI(gui, light.position, 'spot', updateLight)
    makeXYZGUI(gui, light.target.position, 'spotTarget', updateLight)
  }
  */

  // 矩形光。例如长条的日光灯或者天花板上磨砂玻璃透进来的自然光。
  // 矩形光只能影响 MeshStandardMaterial 和 MeshPhysicalMaterial
  // 与方向光（DirectionalLight）和聚光灯（SpotLight）不同，
  // 矩形光不是使用目标点（target），而是使用自身的旋转角度来确定光照方向。
  //（RectAreaLightHelper）应该添加为光照的子节点，而不是添加为场景的子节点。
  // 最后，WebGLRenderer 中有一个设置项 physicallyCorrectLights，
  // 用于控制光照随着距离增加如何减弱。这个设置会影响点光源（PointLight）
  // 和聚光灯（SpotLight）。而矩形区域光（RectAreaLight）会自动启用这个特性。
  // 设置了此选项后, 只需控制光照的 power 属性, three.js
  // 就会自动进行物理计算, 表现出接近真实的光照效果
  {
    RectAreaLightUniformsLib.init(); // 作用未知
    const color = 0xFFFFFF;
    const intensity = 5;
    const width = 12;
    const height = 4;
    const light = new THREE.RectAreaLight(color, intensity, width, height);
    light.position.set(0, 10, 0);
    light.rotation.x = THREE.MathUtils.degToRad(-90);
    app.add(light);
    const helper = new RectAreaLightHelper(light);
    light.add(helper);

    gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    gui.add(light, 'intensity', 0, 10, 0.01);
    gui.add(light, 'width', 0, 20);
    gui.add(light, 'height', 0, 20);
    gui.add(new DegRadHelper(light.rotation, 'x'), 'value', -180, 180).name('x rotation');
    gui.add(new DegRadHelper(light.rotation, 'y'), 'value', -180, 180).name('y rotation');
    gui.add(new DegRadHelper(light.rotation, 'z'), 'value', -180, 180).name('z rotation');

    makeXYZGUI(gui, light.position, 'position');
  }

  app.animate()
}
