import _3d from '../../three.js'
const U = undefined
const D = document
import state from  '../state.js'
/*绘制点线面等*/
const Draw = function(parent) {
    const T = this // 非app
    const el = state.el
    //配置项
    T.config = {
        enabled: true,
        drawPoint: false,
        drawLine: false,
        drawLineStraight: false,
        drawType: U, // point , line, lineStraight
        isDrawing: false,
        lineMaterial:  new _3d.LineBasicMaterial( { color:'red'}),
        lineStraightMaterial:  new _3d.LineBasicMaterial( { color:'red'}),
        fixPointPosition: {x : U, y : U, z : U,},
        fixLinePosition: {x : U, y : U, z : U,},
        fixLineStraightPosition: {x : U, y : U, z : U,},
        fixPolygonPosition: {x : U, y : U, z : U,},
        start: U,
        moving: U,
        stop: U
    }

    // points
    T.pointsGeometry = new _3d.BufferGeometry()
    T.pointsVertices = []
    T.points = new _3d.Points(T.pointsGeometry, new _3d.PointsMaterial({
        color: 'red',
        size: 1
    }))
    parent.add( T.points )

    // line
    T.lines = new _3d.Group()
    T.newLine  = null
    T.linePoints = []

    parent.add(T.lines)

    // drawLineStraight
    T.lineStraightsGroup = new _3d.Group()
    T.newLineStraight  = null
    T.lineStraightPoints = []

    parent.add(T.lineStraightsGroup)

    //Polygon
    T.polygonPoints = []
    T.polygonGroup = new _3d.Group()
    parent.add(T.polygonGroup)


    // event.button 0: LEFT,1:MIDDLE ,2: RIGHT

    D.oncontextmenu = () => false
    //开始
    el.addEventListener('mousedown',function (e) {
        if(!T.config.enabled) return
        e.preventDefault()
        if(e.button === 2 && T.config.drawType === 'lineStraight') {
            // 取消绘制线得单次绘制
            T.lineStraightPoints =  []
            return
        }
        if(e.button === 2 && T.config.drawType === 'polygon') {
            const geometry = new _3d.Geometry()
            geometry.vertices.push(...T.polygonPoints)
            T.polygonPoints.forEach((e, i) => {
                if(i >=  T.polygonPoints.length - 2 ) return
                geometry.faces.push(new _3d.Face3( 0, i+1, i+2 ))
            })
            geometry.computeFaceNormals()
            const material = new _3d.MeshBasicMaterial( {color: 'red',side: _3d.DoubleSide} );
            const mesh = new _3d.Mesh( geometry, material );
            T.polygonGroup.add( mesh )
            T.polygonPoints = []
            return
        }

        if(e.button !==0) return


        const objList =  state.app.getIntersectObject(parent, e, true).objectList
        if(objList &&　objList.length > 0) {
            const point = objList[0].point

            switch ( T.config.drawType ) {
                case 'point': {
                    T.pointsVertices.push(T.config.fixPointPosition.x ||  point.x, T.config.fixPointPosition.y || point.y,  T.config.fixPointPosition.z || point.z)
                    T.pointsGeometry.setAttribute( 'position', new _3d.Float32BufferAttribute( T.pointsVertices, 3 ))
                    break
                }
                case 'line': {
                    T.config.isDrawing = true
                    const geometry = new _3d.BufferGeometry()//创建一个几何
                    T.newLine =  new _3d.Line( geometry, T.config.lineMaterial)
                    T.lines.add(T.newLine)
                    break
                }
                case 'lineStraight': {
                    T.config.isDrawing = true
                    const geometry = new _3d.BufferGeometry();//创建一个几何
                    T.newLineStraight =  new _3d.Line( geometry, T.config.lineStraightMaterial)
                    T.lineStraightPoints.push(new _3d.Vector3(T.config.fixLineStraightPosition.x ||  point.x, T.config.fixLineStraightPosition.y || point.y,  T.config.fixLineStraightPosition.z || point.z))
                    T.lineStraightsGroup.add(T.newLineStraight)
                    break
                }

                case 'polygon': {
                    //画点
                    T.pointsVertices.push(T.config.fixPolygonPosition.x ||  point.x, T.config.fixPolygonPosition.y || point.y,  T.config.fixPolygonPosition.z || point.z)
                    T.pointsGeometry.setAttribute( 'position', new _3d.Float32BufferAttribute( T.pointsVertices, 3 ))

                    //取点画面
                    T.polygonPoints.push(new _3d.Vector3(T.config.fixPolygonPosition.x ||  point.x, T.config.fixPolygonPosition.y || point.y,  T.config.fixPolygonPosition.z || point.z))
                }
            }

            if(T.config.start) T.config.start(point)
        }

    }, false)

    //移动中
    el.addEventListener('mousemove',function (e) {
        if(!T.config.enabled) return
        e.preventDefault()
        if(e.button!== 0 ) return  //指定左击 生效

        const objList =  state.app.getIntersectObject(parent, e, true).objectList
        if(objList &&　objList.length > 0) {
            const point = objList[0].point
            switch ( T.config.drawType ) {
                case 'line': {
                    if( T.config.isDrawing ) {
                        T.linePoints.push(new _3d.Vector3(T.config.fixLinePosition.x ||  point.x, T.config.fixLinePosition.y || point.y,  T.config.fixLinePosition.z || point.z))
                        T.newLine.geometry.setFromPoints( T.linePoints)
                    }
                    break
                }
                case 'lineStraight': {
                    if(T.config.isDrawing ) {
                        T.lineStraightPoints[1] = new _3d.Vector3(T.config.fixLineStraightPosition.x ||  point.x, T.config.fixLineStraightPosition.y || point.y,  T.config.fixLineStraightPosition.z || point.z)
                        T.newLineStraight.geometry.setFromPoints( T.lineStraightPoints)
                    }
                    break
                }
            }

            if(T.config.moving && T.config.isDrawing ) T.config.moving(point)
        }
    }, false)

    //结束
    el.addEventListener('mouseup',function (e) {
        if(!T.config.enabled) return
        if(e.button !== 0 ) return  //指定左击 生效
        T.config.isDrawing = false
        switch ( T.config.drawType ) {
            case 'line': {
                T.linePoints = []
                break
            }
            case 'lineStraight': {
                const objList =  state.app.getIntersectObject(parent,e, true).objectList
                if(objList &&　objList.length > 0) {
                    const point = objList[0].point
                    T.lineStraightPoints[1] = new _3d.Vector3(T.config.fixLineStraightPosition.x ||  point.x, T.config.fixLineStraightPosition.y || point.y,  T.config.fixLineStraightPosition.z || point.z)
                    T.newLineStraight.geometry.setFromPoints( T.lineStraightPoints)
                }

                if(T.lineStraightPoints[1]) T.lineStraightPoints = [T.lineStraightPoints[1]]
                else T.lineStraightPoints =  []
                break
            }
        }

        if(T.config.stop) T.config.stop()
    }, false)
}

export default  Draw