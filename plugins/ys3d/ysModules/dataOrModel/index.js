import _3d from '../../_3d.js'
import single from '../singe.js'
import state from  '../state.js'
import { MTLLoader } from "../../threeLibs/loaders/MTLLoader.js"
import { OBJLoader2 } from "../../threeLibs/loaders/OBJLoader2.js"
import { MtlObjBridge } from "../../threeLibs/loaders/obj2/bridge/MtlObjBridge.js"
import { DRACOLoader } from '../../threeLibs/loaders/DRACOLoader.js'
import { GLTFLoader } from '../../threeLibs/loaders/GLTFLoader.js'
import { ColladaLoader } from '../../threeLibs/loaders/ColladaLoader.js'
import { FBXLoader } from '../../threeLibs/loaders/FBXLoader.js'
import { OBJExporter } from '../../threeLibs/exporters/OBJExporter.js'
import { GLTFExporter } from '../../threeLibs/exporters/GLTFExporter.js'
//加载模型
const load = (function () {
    return function (option) { //模型加载器还不能单例设计模式，防止冲突
        if(option.type === 'image') {
            const loader = single.textureLoader ? single.textureLoader : single.textureLoader =  new _3d.TextureLoader()
            return loader.load(option.url, option.onLoad, option.onProgress , option.onError)
        }else if(option.type === 'json') {
            return new _3d.ObjectLoader().load(option.url, option.onLoad, option.onProgress , option.onError)
        }else if(option.type === 'obj') {
            const objLoader = new OBJLoader2()
            new MTLLoader().load(option.mtlUrl || '', function (mtlParseResult) {
                mtlParseResult.preload()
                // objLoader.setLogging( true, true ) //打印日志
                objLoader.addMaterials( MtlObjBridge.addMaterialsFromMtlLoader( mtlParseResult ), true )
                objLoader.load( option.url, option.onLoad, option.onProgress , option.onError )
            })
        }else if(option.type === 'gltf' || option.type === 'glb') {
            const gltfLoader =  new GLTFLoader()
            const dracoLoader =  new DRACOLoader()
            dracoLoader.setDecoderPath( option.dracoUrl )
            gltfLoader.setDRACOLoader( dracoLoader )
            gltfLoader.load(option.url, option.onLoad, option.onProgress , option.onError)
        }else if(option.type === 'dae') {
            new ColladaLoader().load(option.url, option.onLoad, option.onProgress , option.onError)
        }else if(option.type === 'fbx') {
            new FBXLoader().load(option.url, option.onLoad, option.onProgress , option.onError)
        }
        else console.error('(T ^ T) 当前只支持 image, json, obj, gltf, glb, dae, fbx 格式， 其他的模型请自行引入加载器')


    }
})()

// 迭代加载
const iterateLoad = function (objFileList, onProgress, onAllLoad) {
    let  fileIndex = 0
    function iterateLoadForIt() {
        state.app.load({
            type: objFileList[fileIndex].type,
            dracoUrl: objFileList[fileIndex].dracoUrl,
            mtlUrl: objFileList[fileIndex].mtlUrl,
            url: objFileList[fileIndex].url,
            onLoad: function (object) {
                if(objFileList[fileIndex].onLoad) objFileList[fileIndex].onLoad(object)
                //
                fileIndex ++
                if(fileIndex < objFileList.length) {
                    iterateLoadForIt()
                }else {
                    if(onAllLoad) onAllLoad()
                }
            },
            onProgress: function (xhr) {
                if(objFileList[fileIndex].onProgress) objFileList[fileIndex].onProgress(xhr, fileIndex)
                if(onProgress) onProgress(xhr, fileIndex)
            }
        })
    }
    iterateLoadForIt()
}



//导出模型
const exportModel = (function () {
    let exporter
    return function (type , object, options) {
        if(type === 'obj') {
            exporter = new OBJExporter()
            const result = exporter.parse( object )
            save( new Blob( [ result ], { type: 'text/plain' } ), new Date().getTime()+'_ys.obj' )
        }else if(type === 'gltf' || type === 'glb') {
            options = options || {}
            const  option = {
                trs: options.trs,
                onlyVisible: options.onlyVisible,
                truncateDrawRange: options.truncateDrawRange,
                binary: type === 'glb',
                forceIndices: options.forceIndices,
                forcePowerOfTwoTextures: options.forcePowerOfTwoTextures,
                maxTextureSize: options.maxTextureSize || Infinity // To prevent NaN value
            }
            exporter = new GLTFExporter()
            exporter.parse( object, function ( result ) {
                result instanceof ArrayBuffer ?
                    save( new Blob( [ result ], { type: 'application/octet-stream' } ), new Date().getTime()+'_ys.glb' )
                    :
                    save( new Blob( [ JSON.stringify( result, null, 2 ) ], { type: 'text/plain' } ), new Date().getTime()+'_ys.gltf' )
            }, option )
        }else console.error('(T ^ T) 当前只支持 导出 obj,gltf,glb 格式， 其他的模型请自行引入导出器')

    }
})()
const save = ( blob, filename ) =>{
    const  link = document.createElement( 'a' )
    link.style.display = 'none'
    document.body.appendChild( link ) // Firefox workaround, see #6594
    link.href = URL.createObjectURL( blob )
    link.download = filename
    link.click()
    link.remove()
}
//读取json数据
const readJson = option => {
    const worldGroup = new _3d.Object3D()
    const worldLine = new _3d.Object3D()
    const worldBlock = new _3d.Object3D()
    const worldLabel =  new _3d.Object3D()
    const M  = option.allScale || 1
    const center = option.center || [0,0]
    option.json.features.forEach(worldItem => {
        const length = worldItem.geometry.coordinates.length
        const multipleBool = length > 1
        const material1 = option.sideMaterial
        const material2 = option.frontMaterial
        // 同一个国家可能分了几个块。比如中国就有14多个。
        const oneCountryGeometry = new _3d.Geometry()
        let height = option.extrude.depth
        if(worldItem.properties) {
            height =  option.extrude.depth * (worldItem.properties.Floor || worldItem.properties.floor || 1)
        }
        worldItem.geometry.coordinates.forEach(worldChildItem =>{
            let part
            if (multipleBool) {
                if (worldChildItem.length && worldChildItem[0].length === 2) {
                    part =  shapeToExtrude(drawShape(worldChildItem,M,center),[material1,material2], option.extrude, height, worldItem.properties.name || worldItem.properties.NAME, option.lineSegmentMaterial, worldLine)
                }else if (worldChildItem.length && worldChildItem[0].length > 2) {
                    part =  shapeToExtrude(drawShape(worldChildItem[0],M,center),[material1,material2], option.extrude, height, worldItem.properties.name || worldItem.properties.NAME, option.lineSegmentMaterial, worldLine)
                }
            } else {
                let countryPos = worldChildItem.length > 1 ? worldChildItem : worldChildItem[0]
                if (countryPos) {
                    part = shapeToExtrude(drawShape(countryPos,M,center),[material1,material2], option.extrude, height, worldItem.properties.name || worldItem.properties.NAME, option.lineSegmentMaterial, worldLine)
                }
            }
            if(part) oneCountryGeometry.merge(part.geometry, part.matrix)
        })
        const  oneCountry = new _3d.Mesh(oneCountryGeometry,[material1,material2])
        oneCountry.name = worldItem.properties.name
        if (option.showLabel && worldItem.properties.cp) {
            const label = state.app.createSpriteText(oneCountry.name, {
                fontSize: 12,
                color: option.labelColor || '#fff'
            })
            label.position.set(worldItem.properties.cp[0] * M,worldItem.properties.cp[1]* M,option.labelHeight || 2)
            label.renderOrder = state.app.renderOrder ++
            worldLabel.add(label)
        }

        worldBlock.add(oneCountry)
    })

    worldGroup.add(worldBlock,worldLine,worldLabel)
    worldGroup.rotateX( -Math.PI / 2)
    return worldGroup
}
const shapeToExtrude = function (shapeObj,materialList,options, height, name, lineSegmentMaterial, worldLine) {
    const obj = {}
    Object.assign(obj, options)
    obj.depth = height
    const geo =  new _3d.ExtrudeGeometry(shapeObj, obj)
    if(lineSegmentMaterial) {
        const line = new _3d.LineSegments(new _3d.EdgesGeometry(geo),lineSegmentMaterial)
        line.name = name + '-line'
        worldLine.add(line)
    }
    return  new _3d.Mesh(geo,materialList)
}
const drawShape = function (pos, M,center) {
    const shape = new _3d.Shape()
    shape.moveTo((pos[0][0] - center[0]) * M, (pos[0][1] - center[1]) * M)
    pos.forEach(function (item) {
        shape.lineTo((item[0]- center[0]) * M, (item[1]- center[1]) * M)
    })
    return shape
}
//读取场景配置文件
const readSceneConfig = config => {
    const scene = new _3d.Scene()
    for(let key in config) {
        forIt(scene, config[key])
    }
    return scene
}
const forIt = function (parent, kind) {
    kind.forEach(e => {
        let object
        if(!e.object && !e.type ) {
            return console.error('对于一个对象，你必须要指定一个object属性，或者type属性，否则无法生成该对象')
        }
        else {
            if( e.object) { // others
                object = e.object
                initObject(object,parent, e)
            }
            else if( e.type ){
                if(e.type === 'group') {
                    object = new _3d.Group()
                    initObject(object,parent, e)
                }else if(e.type === 'model') {
                    state.app.load({
                        type: e.modelType,
                        url: e.url,
                        mtlUrl: e.mtlUrl,
                        dracoUrl: e.dracoUrl,
                        onLoad: obj => {
                            object = ['gltf','glb', 'dae'].includes(e.modelType) ? obj.scene : obj
                            initObject(object,parent, e, obj)
                        }
                    })

                }
            }
        }
    })
}
const initObject = function (object,parent, e, obj) {
    object.name = e.name || ''
    e.position ? object.position.set( e.position[0], e.position[1], e.position[2]) : ''
    e.scale? object.scale.set( e.scale[0], e.scale[1], e.scale[2]) : ''
    parent.add(object)
    e.callback &&  typeof e.callback === 'function' ? e.callback(object, obj) : ''

    // 等物体加载后才克隆
    initClone(object,parent, e)
    // 等物体加载后才遍历children 再开始进行
    if(e.children) forIt(object, e.children)

}

const initClone = function (object,parent, e) {
    if(e.clone && e.cloneAttribute) {
        e.cloneAttribute.forEach(m => {
            const obj = object.clone()
            obj.name = obj
            initObject(obj, parent, m)
            if(m.children) {
                forIt(obj, m.children)
            }
        })
    }
}




export {
    load,
    iterateLoad,
    exportModel,
    readJson,
    readSceneConfig
}