import _3d from '../three.js'
const D = document

const randomColor = () => `rgb(${parseInt(Math.random() * 256)},${parseInt(Math.random() * 256)},${parseInt(Math.random() * 256)})`
const isMobile = () => (navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null)
const initStatus = Stat => {
    const stats = Stat ? new Stat() : new Stats()
    stats.setMode(0) // 0: fps, 1: ms
    stats.domElement.style.position = 'fixed'
    stats.domElement.style.left = '0px'
    stats.domElement.style.top = '0px'
    stats.domElement.style.Zindex = '9999'
    D.body.appendChild(stats.domElement)
    return stats
}

// 地理坐标转2d平面
const geographicToPlaneCoords = (radius, lng, lat) => {
    return { x: (lat / 180) * radius, y: (lng / 180) * radius }
}

// 地理坐标转三维坐标
const geographicToVector3 = (radius, lng, lat) => new _3d.Vector3().setFromSpherical(new _3d.Spherical(radius, (90 - lat) * (Math.PI / 180), (90 + lng) * (Math.PI / 180)))

// 计算三角面积
const getTriangleArea = (v1, v2, v3) => new _3d.Vector3().crossVectors(v1.clone().sub(v2), v1.clone().sub(v3)).length() / 2

//计算网格对象体积
const getMeshVolume = mesh =>{
    let geometry = mesh.geometry.clone()
    if (geometry.isBufferGeometry) geometry = new _3d.Geometry().fromBufferGeometry(geometry)
    let V = 0
    geometry.faces.forEach(e => V += geometry.vertices[e.a].clone().cross(geometry.vertices[e.b]).dot(geometry.vertices[e.c]) / 6)
    return V
}

// 获取球体上的两点之间的制高点，用于绘制三维三次贝塞尔曲线
const getSphereHeightPoints = (v0, v3, n1, n2, p0) => {
    // 夹角
    const angle = (v0.angleTo(v3) * 180) / Math.PI / 10 // 0 ~ Math.PI
    const aLen = angle * (n1 || 10)
    const hLen = angle * angle * (n2 || 120)
    const temp = new _3d.Vector3() //仅仅防止报黄 无实际作用
    p0 = p0 || new _3d.Vector3(0, 0, 0) // 默认以 坐标原点为参考对象
    // 法线向量
    const rayLine = new _3d.Ray(p0, v0.clone().add(v3.clone()).divideScalar(2))
    // 顶点坐标
    const vtop = rayLine.at(hLen / rayLine.at(1, temp).distanceTo(p0), temp)
    // 计算制高点
    const getLenVector = (v1, v2, len) => v1.lerp(v2, len / v1.distanceTo(v2))
    // 控制点坐标
    return [getLenVector(v0.clone(), vtop, aLen), getLenVector(v3.clone(), vtop, aLen)]
}

// 添加htmlToCanvas
const createHtmlCanvas = (html2canvas, option) => {
    option.scale = option.scale || [1,1,1]
    option.position = option.position || [0,0,0]
    D.body.insertAdjacentHTML('beforeend', option.element)
    const element = D.body.lastChild
    element.style.zIndex = -1
    html2canvas(element,{ backgroundColor: 'transparent' }).then(canvas => {
        option.position = option.position || [0,0,0]
        let html
        if(option.type === 'plane') {
            html = new _3d.Mesh(new _3d.PlaneBufferGeometry(option.width || 100,option.height || 100,10), new _3d.MeshStandardMaterial({
                map: new _3d.CanvasTexture(canvas),
                /*blending: _3d.AdditiveBlending,*/
                transparent: true,
                side: _3d.DoubleSide
            }))
        }else {
            html = new _3d.Sprite( new _3d.SpriteMaterial( {
                map: new _3d.CanvasTexture(canvas),
                /* blending: _3d.AdditiveBlending,*/ // 混合模式 我们这里不采用混合模式 防止黑色背景看不到。
                transparent: true,
                sizeAttenuation: option.sizeAttenuation || true
            }))
        }
        html.scale.set(option.scale[0],option.scale[1],option.scale[2])
        html.position.set(option.position[0],option.position[1],option.position[2])
        html.name = option.name || 'canvas-sprite'
        option.parent.add(html)
        if(option.callback) option.callback(html)
        D.body.removeChild(element)
    })
}

const getCenterPosition = object => {
    let p
    if ( object.isMesh ) {
        object.geometry.computeBoundingBox()
        p = object.geometry.boundingBox.getCenter(new _3d.Vector3())//.multiplyScalar(1) //加上这个表示放大了几倍 1为放大倍数
    } else {
        p = new _3d.Box3().setFromObject(object).getCenter(new _3d.Vector3())
    }
    return p
}

const getCirclePoints = option => {
    const list = []
    for( let j = 0; j <  2 * Math.PI - .1; j +=  2 * Math.PI / ( option.number || 100) ) {
        list.push([parseFloat((Math.cos( j )*(option.radius || 10)).toFixed(2)), 0,  parseFloat((Math.sin( j )*(option.radius || 10)).toFixed(2))])
    }
    if(option.closed) list.push(list[0])
    return list
}

export {
    randomColor,
    isMobile,
    initStatus,
    getSphereHeightPoints,
    geographicToPlaneCoords,
    geographicToVector3,
    getTriangleArea,
    getMeshVolume,
    createHtmlCanvas,
    getCenterPosition,
    getCirclePoints
}