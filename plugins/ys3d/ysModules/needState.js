import _3d from '../three.js'
import state from  './state.js'
const D = document
const raycaster = new _3d.Raycaster()
const raycasterMouse = new _3d.Vector2()
let raycasterObjectList = []
// 获取面积
const getMeshArea = mesh => {
    let area = 0
    let geometry = mesh.geometry.clone()
    if (geometry.isBufferGeometry) geometry = new _3d.Geometry().fromBufferGeometry(geometry)
    geometry.faces.forEach(e => {
        area += state.app.getTriangleArea(
            geometry.vertices[e.a],
            geometry.vertices[e.b],
            geometry.vertices[e.c])
    })
    return area
}
// 三维坐标转屏幕坐标
const objectToScreenCoords = vectorOrObject => {
    let o
    if (vectorOrObject instanceof _3d.Vector3)
        o = vectorOrObject
    else if (vectorOrObject instanceof _3d.Object3D)
        o = new _3d.Vector3(vectorOrObject.position.x, vectorOrObject.position.y, vectorOrObject.position.z)
    else
        console.error('the arguments is a object of Vector3 or Object3D ')
    const sv = o.project(state.camera)
    const a = state.renderer.getSize(new _3d.Vector2()).width / 2
    const b = state.renderer.getSize(new _3d.Vector2()).height / 2
    const x = Math.round(sv.x * a + a)
    const y = Math.round(-sv.y * b + b)
    return { x, y }
}
// 获取与射线相交的对象数组
const getIntersectObject = (parent, event, recursive) => {
    event.preventDefault()
    try {
        raycasterMouse.x = (((event.clientX || (event.touches[0]? event.touches[0].pageX : event.changedTouches[0].pageX)) - state.el.getBoundingClientRect().left) / state.el.offsetWidth) * 2 - 1
        raycasterMouse.y = -(((event.clientY || (event.touches[0]? event.touches[0].pageY : event.changedTouches[0].pageY)) - state.el.getBoundingClientRect().top) / state.el.offsetHeight) * 2 + 1
        raycaster.setFromCamera(raycasterMouse, state.camera)
        // intersectObjects(object,recursive)object — 用来检测和射线相交的物体。recursive — 如果为true，它还检查所有后代。否则只检查该对象本身。缺省值为false。
        raycasterObjectList = raycaster.intersectObjects((parent || state.scene).children, recursive)
    }
    catch (e) {/*鼠标越界*/}
    return {
        raycaster: raycaster,
        objectList: raycasterObjectList
    }
}
// 点击取点,用于测试取点
const getClickPoint = callback => {
    state.el.listen ? state.el.listen('tap',doIt) : '' // ys.event.js
    state.el.addEventListener('click',doIt,false)
    function doIt(e) {
        const objList = state.app.getIntersectObject(state.scene,e,true).objectList
        if(objList.length > 0){
            if(callback && typeof callback === 'function') callback(objList[0].point)
        }
    }
}
// 创建精灵文本
const createSpriteText = (text, options) => {
    if (!options) options = {}
    options.fontSize = options.fontSize || 12
    const el = state.el
    const average = el.offsetWidth > el.offsetHeight ? el.offsetHeight / 180 : el.offsetWidth / 360
    const canvas = D.createElement('canvas')
    canvas.width = text.length * (options.fontSize || 18) * average
    canvas.height = options.fontSize * average
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = options.backgroundColor || 'transparent'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.font = canvas.height + "px '微软雅黑'"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = options.color
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 * 1.15)
    const texture = new _3d.Texture(canvas)
    texture.needsUpdate = true
    const sprite = new _3d.Sprite(new _3d.SpriteMaterial({ map: texture, transparent: true }))
    sprite.scale.set(options.fontSize / average * text.length, options.fontSize / average, 1)
    return sprite
}
// 创建动态线
const createAnimateLine = option => {
    let curve
    if (option.kind === 'sphere') { // 由两点之间连线成贝塞尔曲线
        const sphereHeightPointsArgs = option.sphereHeightPointsArgs
        const pointList = state.app.getSphereHeightPoints(...sphereHeightPointsArgs) // v0,v3,n1,n2,p0
        curve = new _3d.CubicBezierCurve3(sphereHeightPointsArgs[0], pointList[0], pointList[1], sphereHeightPointsArgs[1])
    } else if(option.kind === 'migrate') { // 由多个点数组构成的曲线 通常用于道路
        const l = []
        option.pointList.forEach(e => l.push(new _3d.Vector3(e[0], e[1], e[2])))
        curve = new _3d.QuadraticBezierCurve3(l[0], l[1], l[2]) // 曲线路径
    } else { // 由多个点数组构成的曲线 通常用于道路
        const l = []
        option.pointList.forEach(e => l.push(new _3d.Vector3(e[0], e[1], e[2])))
        curve = new _3d.CatmullRomCurve3(l) // 曲线路径
    }
    if (option.type === 'pipe') { // 使用管道线
        // 管道体
        const tubeGeometry = new _3d.TubeGeometry(curve, option.number || 50, option.radius || 1, option.radialSegments)
        return new _3d.Mesh(tubeGeometry, option.material)
    } else { // 使用 meshLine
        const geo = new _3d.Geometry()
        geo.vertices = curve.getPoints(option.number || 50)
        const meshLine = new _3d.MeshLine()
        meshLine.setGeometry(geo)
        return new _3d.Mesh(meshLine.geometry, option.material)
    }
}
// 飞行
const flyTo = option => {
    state.app.updateTween = true
    option.position = option.position || [] // 相机新的位置
    option.controls = option.controls || [] // 控制器新的中心点位置(围绕此点旋转等)
    option.duration = option.duration || 1000 // 飞行时间
    option.easing = option.easing || _3d.TWEEN.Easing.Linear.None
    _3d.TWEEN.removeAll()
    const curPosition = state.camera.position
    const controlsTar = state.controls.target
    const tween = new _3d.TWEEN.Tween({
        x1: curPosition.x, // 相机当前位置x
        y1: curPosition.y, // 相机当前位置y
        z1: curPosition.z, // 相机当前位置z
        x2: controlsTar.x, // 控制当前的中心点x
        y2: controlsTar.y, // 控制当前的中心点y
        z2: controlsTar.z // 控制当前的中心点z
    }).to({
        x1: option.position[0], // 新的相机位置x
        y1: option.position[1], // 新的相机位置y
        z1: option.position[2], // 新的相机位置z
        x2: option.controls[0], // 新的控制中心点位置x
        y2: option.controls[1], // 新的控制中心点位置x
        z2: option.controls[2]  // 新的控制中心点位置x
    }, option.duration).easing(_3d.TWEEN.Easing.Linear.None) // TWEEN.Easing.Cubic.InOut //匀速
    tween.onUpdate(() => {
        state.controls.enabled = false
        state.camera.position.set(tween._object.x1, tween._object.y1, tween._object.z1)
        state.controls.target.set(tween._object.x2, tween._object.y2, tween._object.z2)
        state.controls.update()
        if (option.update instanceof Function) { option.update(tween) }
    })
    tween.onStart(() => {
        state.controls.enabled = false
        if (option.start instanceof Function) { option.start() }
    })
    tween.onComplete(() => {
        state.controls.enabled = true
        if (option.done instanceof Function) { option.done() }
    })
    tween.onStop(() => option.stop instanceof Function ? option.stop() : '')
    tween.start()
    _3d.TWEEN.add(tween)
    return tween
}

export  {
    getMeshArea,
    objectToScreenCoords,
    getIntersectObject,
    getClickPoint,
    createSpriteText,
    createAnimateLine,
    flyTo
}