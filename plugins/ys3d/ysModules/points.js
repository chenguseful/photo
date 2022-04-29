import _3d from '../three.js'
const D = document
const imageToBufferGeometry = option => {
    option = option || {}
    const canvas = D.createElement('canvas')
    const content = canvas.getContext('2d')
    canvas.width = option.width || 2048
    canvas.height = option.height ||  1024
    const img = new Image()
    img.src = option.url
    canvas.style.position = 'absolute'
    img.onload = function () {
        content.drawImage(img, 10, 10, canvas.width, canvas.height)
        const imgDate = content.getImageData(0,0,canvas.width, canvas.height)
        const worker = new Worker(option.workerPath + 'imageToPoints.js')
        worker.postMessage({imgDate, canvas: {width: canvas.width, height: canvas.height}, color: [0,0,0]}) //dom元素不能使用worker传递，因此我们传入需要的数据
        worker.onmessage = function (event) {
            const geometry = new _3d.BufferGeometry()
            geometry.setAttribute( 'position', new _3d.BufferAttribute( event.data.positions, 3 ))
            geometry.setAttribute( 'color', new _3d.BufferAttribute( event.data.colors, 3 ) )
            geometry.computeBoundingSphere()
            if(option.callback && typeof option.callback === 'function') option.callback(geometry)
        }
    }
}

const modelToBufferGeometry = option => {
    const geometry = new _3d.BufferGeometry()
    geometry.setAttribute( 'position', new _3d.BufferAttribute( modelToPoints(option.model), 3 ))
    geometry.computeBoundingSphere()
    if(option.callback && typeof option.callback === 'function') option.callback(geometry)
}

const modelToPoints  = model => {

    let count = 0
    let bufferName = 'position'

    model.traverse( function ( child ) {
        if ( child.isMesh ) {
            const geo = child.geometry.type === 'Geometry' ? new _3d.BufferGeometry().fromGeometry(child.geometry) : child.geometry
            const buffer = geo.attributes[ bufferName ]
            count += buffer.array.length
        }

    } )
    const combined = new Float32Array( count )

    let offset = 0
    model.traverse( function ( child ) {
        if ( child.isMesh ) {
            const geo = child.geometry.type === 'Geometry' ? new _3d.BufferGeometry().fromGeometry(child.geometry) : child.geometry
            const buffer = geo.attributes[ bufferName ]
            combined.set( buffer.array, offset )
            offset += buffer.array.length

        }

    })
    return combined

}

export  {
    imageToBufferGeometry,
    modelToBufferGeometry
}