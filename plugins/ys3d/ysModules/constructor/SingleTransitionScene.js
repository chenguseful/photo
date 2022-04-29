import _3d from '../../_3d.js'
import state from  '../state.js'
// 场景类
function SingleTransitionScene(name, callback, render) {
    const T = this
    const el = state.el
    const renderer = state.renderer
    //camera
    T.camera = new _3d.PerspectiveCamera( 45, el.offsetWidth / el.offsetHeight, 1, 100000 )

    // scene
    T.scene = new _3d.Scene()

    // name
    T.name = name

    // WebGLRenderTarget
    const renderTargetParameters = { minFilter: _3d.LinearFilter, magFilter: _3d.LinearFilter, format: _3d.RGBFormat, stencilBuffer: false }
    T.fbo = new _3d.WebGLRenderTarget( el.offsetWidth, el.offsetHeight, renderTargetParameters )


    T.render = function ( delta, rtt ) {
        render ? render(T) : ''
        if ( rtt ) {
            renderer.setRenderTarget( T.fbo )
            renderer.clear()
            renderer.render( T.scene, T.camera )
        } else {
            renderer.setRenderTarget( null )
            renderer.render( T.scene, T.camera )
        }
    }

    callback ? callback(T) : ''

    window.addEventListener('resize', function() {
        T.camera.aspect = el.offsetWidth / el.offsetHeight
        T.fbo.setSize(el.offsetWidth, el.offsetHeight)
        renderer.setSize(el.offsetWidth, el.offsetHeight) // 重新获取
        T.camera.updateProjectionMatrix()
    }, false)
}

export default SingleTransitionScene