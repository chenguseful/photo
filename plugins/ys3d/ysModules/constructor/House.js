import _3d from '../../three.js'
import state from  '../state.js'

const House = function (option) {
    this.init(option || {
        width: 1800,
        height: 200,
        depth: 1000,
        wallDepth: 10,
    })
}
// 自运行初始化 无需调用
House.prototype.init = function (option) {
    const house = new _3d.Group()
    house.name = 'house'
    this.parent =  option.parent || state.scene //场景或厂库父对象
    this.parent.add(house)
    this.house = house // 当前仓库
    this.width = option.width
    this.height = option.height
    this.depth = option.depth
    this.wallDepth = option.wallDepth
}
// 创建平面
House.prototype.createPlane = function (option,callback) { //使用Geometry而非bufferGeometry是防止创建bsp失败
    const plane = new _3d.Mesh(new _3d.PlaneGeometry(option.width,option.height), option.material)
    cb(callback, plane)
    return plane
}
//创建立方体
House.prototype.createBox = function (option, callback) { //使用Geometry而非bufferGeometry是防止创建bsp失败
    const box = new _3d.Mesh(new _3d.BoxGeometry(option.width,option.height, option.depth), option.material)
    cb(callback, box)
    return box
}
// 创建bsp对象 在 wall 挖去 door_window
House.prototype.createBsp = function (wall, door_window, material,callback) {
    if(wall.geometry.type.includes( 'BufferGeometry')) return console.error('请使用geometry而不是bufferGeometry创建对象')
    let BSP = new _3d.ThreeBSP(wall) // 内置的方法必须使用的是geometry，而buffergeometer会报错少面
    door_window.forEach(e => {
        let less_bsp = new _3d.ThreeBSP(e)
        BSP = BSP.subtract(less_bsp)
    })
    let result = BSP.toMesh(material)
    result.name = wall.name
    result.material.flatshading = _3d.FlatShading
    result.geometry.computeFaceNormals()//重新计算几何体侧面法向量
    result.geometry.computeVertexNormals()
    result.material.needsUpdate = true //更新纹理
    result.geometry.buffersNeedUpdate = true
    result.geometry.uvsNeedUpdate = true
    cb(callback, result)
    return result
}
// 读取配置文件 生成机房
House.prototype.readConfig = function (option) {
    forIt(this, this.house, option)
}
const forIt = (T, parent, option) => {
    option.forEach(e => {
        let object
        if(e.type === 'group') {
            object = new _3d.Group()
        }else if(e.type === 'plane') {
            object = T.createPlane({
                width: e.width,
                height: e.height,
                material: e.material,
            })
        }else if(e.type === 'box') {
            object = T.createBox({
                width: e.width,
                height: e.height,
                depth: e.depth,
                material: e.material,
            })

        }else if(e.type === 'bsp') {
            const list = []
            e.bsp.forEach((e, i) => {
                if(i === 0) return
                list.push(getOne(T,e))
            })
            object = T.createBsp(getOne(T, e.bsp[0]), list, e.material)
        }else if(e.type === 'others') {
            object = e.object
        }
        object.name = e.name || ''
        e.position ? object.position.set(e.position[0], e.position[1], e.position[2]) : ''
        parent.add(object)

        cb(e.callback, object)
        if(e.children) {
            forIt(T, object, e.children)
        }
    })
}
const cb = (callback, box)=> {
    if (callback && typeof callback === 'function') callback(box)
}
const getOne = (T, e) => {
    let one
    if(e.type === 'box') {
        one = T.createBox({
            width: e.width,
            height: e.height,
            depth: e.depth
        })

    }else if(e.type === 'plane') {
        one = T.createPlane({
            width: e.width,
            height: e.height
        })
    }else if(e.type === 'others') {
        one = e.object
    }
    one.name = e.name
    if(e.position) one.position.set(e.position[0], e.position[1], e.position[2])
    return one
}
export default  House