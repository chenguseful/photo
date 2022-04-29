import _3d from '../../_3d.js'
import state from  '../state.js'
import {changeSceneShader} from '../shader/usual.js'

const setState = s => {
    state.app.setScene(s.scene)
    state.app.setCamera(s.camera)
    state.app.controls.object = s.camera
}
const SceneTransition = function(sceneA, sceneB, transitionParams) {
    const T = this
    const el = state.el
    const shader  = changeSceneShader()
    shader.uniforms.tMixTexture.value = transitionParams.texture
    //
    T.scene = new _3d.Scene()
    T.camera = new _3d.OrthographicCamera(el.offsetWidth / -2, el.offsetWidth / 2, el.offsetHeight / 2, el.offsetHeight / -2, -10, 10)
    //
    T.quadmaterial = new _3d.ShaderMaterial({
        uniforms: shader.uniforms,
        vertexShader: shader.vs,
        fragmentShader: shader.fs
    })
    const quadgeometry = new _3d.PlaneBufferGeometry(el.offsetWidth, el.offsetHeight)

    // 类似一种蒙层提供过度效果
    T.quad = new _3d.Mesh(quadgeometry, T.quadmaterial)
    T.scene.add(T.quad)

    T.init = function() {
        T.sceneA = sceneA
        setState(sceneA)
    }
    T.update = function(sceneA, sceneB, animate) {
        T.sceneA = sceneA
        T.sceneB = sceneB
        T.quadmaterial.uniforms.tDiffuse1.value = T.sceneB.fbo.texture
        T.quadmaterial.uniforms.tDiffuse2.value = T.sceneA.fbo.texture
        T.quadmaterial.uniforms.mixRatio.value = 0.0
        T.quadmaterial.uniforms.threshold.value = 0.1
        T.quadmaterial.uniforms.useTexture.value = transitionParams.useTexture
        T.quadmaterial.uniforms.tMixTexture.value = transitionParams.texture

        transitionParams.animate = animate
        transitionParams.transition = 0

        //并且 改变state状态
        setState(sceneB)

    }

    T.init()
    T.needChange = false
    T.render = function(delta, renderSelf, renderOver) {
        if (transitionParams.transition === 0) {
            T.sceneA.render(delta, false)
        } else if (transitionParams.transition >= 1) {
            renderSelf ? T.sceneB.render(delta, false) : ''
            transitionParams.animate = false // 停止
            renderOver ? renderOver() : ''
        } else {
            T.sceneA.render(delta, true)
            T.sceneB.render(delta, true)
            state.renderer.setRenderTarget(null)
            state.renderer.clear()
            state.renderer.render(T.scene, T.camera)
        }
        if (transitionParams.animate && transitionParams.transition <= 1) {
            transitionParams.transition = transitionParams.transition + transitionParams.transitionSpeed
            T.needChange = true
            T.quadmaterial.uniforms.mixRatio.value = transitionParams.transition
        }
    }
}

export  default SceneTransition
