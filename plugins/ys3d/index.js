/**
 * @author跃焱邵隼
 * @host www.wellyyss.cn
 * @qq group 169470811
 */
import state from "./ysModules/state.js"
import single from './ysModules/singe.js'
import _3d from './three.js'
import * as normal from './ysModules/normal.js'
import * as points from './ysModules/points.js'
import * as needState from './ysModules/needState.js'
import * as constructor from './ysModules/constructor/index.js'
import * as dataOrModel from './ysModules/dataOrModel/index.js'
import * as usualShader from './ysModules/shader/usual.js'
import listen from "./ysModules/registEvent.js"
const Ys3dApp = (function(W,D,U) {
    let app,renderer,scene,camera,controls,el
    const App = function (element, options) {
        app = this
        app._3d = _3d
        app.renderer = null
        app.scene = null
        app.camera = null
        app.controls = null
        app.el = null
        app.init(element, options)
        app.onresize()
        app.renderOrder = 1
    }

    //基础属性与方法
    App.prototype = {
        init(element, options) {
            options = options || {}
            el = element // 1
            const width = el.offsetWidth
            const height = el.offsetHeight
            const asp = width / height

            // scene
            scene = new _3d.Scene() // 2

            // camera
            camera = new _3d.PerspectiveCamera(45, asp, 1, 100000)
            camera.position.set(30, 30, 30) // 3
            camera.lookAt(0,0,0)

            // renderer
            renderer = new _3d.WebGLRenderer({ antialias: true, alpha: true }) // 4
            renderer.setPixelRatio(W.devicePixelRatio)
            renderer.setSize(width, height)
            el.append(renderer.domElement)
            renderer.setClearColor(options.clearColor || '#000')

            // 辅助
            if (options.axes) scene.add(new _3d.AxesHelper(10))// 坐标轴辅助红x 绿y 蓝z
            if (options.gridHelper) scene.add(new _3d.GridHelper(100, 100))// 网格参考线
            if (options.updateTween) app.updateTween = true

            //按序渲染
            renderer.sortObjects = options.sortObjects

            // to the instance
            state.app = app
            state.renderer =  app.renderer = renderer
            state.scene =  app.scene = scene
            state.camera =  app.camera = camera
            state.el = app.el = el
        },
        setRenderer(newRenderer) {
            renderer =  app.renderer  = state.renderer = newRenderer
        },
        setCamera(newCamera) {
            camera = app.camera =  state.camera = newCamera
        },
        setScene(newScene) {
            scene = app.scene  = state.scene = newScene
        },
        setControls(newControls) {
            controls = app.controls  = state.controls = newControls
        },
        render(callback) {
            callback()
            app.frameId = requestAnimationFrame(() =>  {
                app.render(callback)
                if(app.updateTween) _3d.TWEEN.update()
                if(single.css2dRenderer) single.css2dRenderer.cssRenderer.render(scene, camera)
                if(single.css3dRenderer) single.css3dRenderer.cssRenderer.render(scene, camera)
            })
        },
        destroy () {
            cancelAnimationFrame(app.frameId) //销毁requestAnimationFrame
            renderer.forceContextLoss() //销毁context
            scene.dispose()
            controls.dispose()
            renderer = null
            scene = null
            camera = null
        },
        initOrbitControls(dom) {
            controls = new _3d.OrbitControls(camera, dom || renderer.domElement)
            controls.enableDamping = true  // 使动画循环使用时阻尼或自转 意思是否有惯性
            // controls.dampingFactor = 0.25; // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
            controls.enableZoom = true  // 是否可以缩放
            controls.autoRotate = true  // 开启自转
            controls.autoRotateSpeed = 0.3 //自传速度
            // controls.minDistance = 0   // 设置相机距离原点的最近距离
            // controls.maxDistance = 1000; // 设置相机距离原点的最远距离
            controls.enablePan = true   // 是否开启右键拖拽
            // controls.maxPolarAngle = Math.PI / 2.2// 禁止入地
            state.controls =  app.controls = controls
            return controls
        },
        onresize() {
            W.addEventListener('resize', function() {
                if(camera instanceof _3d.PerspectiveCamera) {
                    camera.aspect = el.offsetWidth / el.offsetHeight
                    renderer.setSize(el.offsetWidth, el.offsetHeight) // 重新获取
                    camera.updateProjectionMatrix()
                    renderer.render(scene, camera)
                }
                if(single.css2dRenderer) single.css2dRenderer.cssRenderer.setSize( el.offsetWidth, el.offsetHeight )
                if(single.css3dRenderer) single.css3dRenderer.cssRenderer.setSize( el.offsetWidth, el.offsetHeight )
            }, false)
        }
    }
    //注册一般方法
    Object.assign(App.prototype, normal)
    //间接注册需要app对象的方法
    Object.assign(App.prototype, needState)
    //调用constructor实例
    Object.assign(App.prototype, constructor)
    //点云
    Object.assign(App.prototype, points)

    // dataOrModel
    Object.assign(App.prototype, dataOrModel)

    // shader
    Object.assign(App.prototype, usualShader)

    //4 注册自定义事件
    HTMLElement.prototype.listen = listen

    return App
})(window,document,undefined)
export default Ys3dApp


