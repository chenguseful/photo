import { EffectComposer } from '../../threeLibs/postprocessing/EffectComposer.js'
import { RenderPass } from '../../threeLibs/postprocessing/RenderPass.js'
import { UnrealBloomPass } from '../../threeLibs/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from '../../threeLibs/postprocessing/ShaderPass.js'
import { OutlinePass } from '../../threeLibs/postprocessing/OutlinePass.js'
import { AfterimagePass } from '../../threeLibs/postprocessing/AfterimagePass.js'
import { BokehPass } from '../../threeLibs/postprocessing/BokehPass.js'

import { FocusShader } from '../../threeLibs/shaders/FocusShader.js'
import { FXAAShader } from '../../threeLibs/shaders/FXAAShader.js'
import _3d from '../../_3d.js'
import state from  '../state.js'

const Composer = function (option) {
    const el = state.el
    const scene =  state.scene
    const camera  = state.camera
    const renderer  = state.renderer
    const composer = new EffectComposer(renderer)
    composer.setSize( el.offsetWidth,  el.offsetHeight )

    const renderScene = new RenderPass( scene, camera )
    composer.addPass(renderScene)
    this.renderScene = renderScene

  if(option.unrealBloom) {
        option.unrealBloom = typeof option.unrealBloom === 'boolean' ? {} : option.unrealBloom
        const  bloomPass = new UnrealBloomPass( new _3d.Vector2( el.offsetWidth,el.offsetHeight ),
            option.unrealBloom.strength || 0.2,
            option.unrealBloom.radius || 0.1,
            option.unrealBloom.threshold || 0.1 ) // resolution, strength, radius, threshold
       /*
        bloomPass.strength = option.unrealBloom.strength || 0.2
        bloomPass.radius =  option.unrealBloom.radius || 0
        bloomPass.threshold = option.unrealBloom.threshold || 0
        */
        bloomPass.renderToScreen = option.unrealBloom.renderToScreen


        composer.addPass( bloomPass )
        this.bloomPass = bloomPass
    }

    if(option.outline) {
        this.outlinePass = []
        if(option.outline.length > 0 ) {
            option.outline.forEach(e => {
                const outlinePass = new OutlinePass( new _3d.Vector2( el.offsetWidth,el.offsetHeight), scene, camera )

                outlinePass.edgeStrength = e.edgeStrength || 3 //粗
                outlinePass.edgeGlow = e.edgeGlow || 1 //发光
                outlinePass.edgeThickness = e.edgeThickness || 1 //光晕粗
                outlinePass.pulsePeriod = e.pulsePeriod  !== false //闪烁
                outlinePass.usePatternTexture = e.usePatternTexture || false
                if(outlinePass.usePatternTexture) {
                    outlinePass.patternTexture  = e.texture
                    e.texture.wrapS = _3d.RepeatWrapping
                    e.texture.wrapT = _3d.RepeatWrapping
                }
                outlinePass.visibleEdgeColor.set(  e.visibleEdgeColor || '#ff030f' )
                outlinePass.hiddenEdgeColor.set( e.hiddenEdgeColor || '#000' )

                composer.addPass( outlinePass )
                outlinePass.selectedObjects = []
                this.outlinePass.push(outlinePass)
            })
        }
    }

    if(option.focus) {
        option.focus = typeof option.focus === 'boolean' ? {} : option.focus
        const focusPass = new ShaderPass(FocusShader)
        focusPass.uniforms["screenWidth"].value =  el.offsetWidth
        focusPass.uniforms["screenHeight"].value = el.offsetHeight
        focusPass.uniforms["sampleDistance"].value =  option.focus.sampleDistance ||  5
        composer.addPass( focusPass )
        this.focusPass = focusPass
    }

    if(option.afterimage) {
        option.afterimage = typeof option.afterimage === 'boolean' ? {} : option.afterimage
        const afterimagePass = new AfterimagePass(option.afterimage.damp || 0.8)
        // afterimagePass.uniforms[ "damp" ].value = 0.05
        composer.addPass( afterimagePass )
        this.afterimagePass = afterimagePass
    }

    if(option.bokeh) {
        option.bokeh = typeof option.bokeh === 'boolean' ? {} : option.bokeh
        const bokehPass = new BokehPass( scene, camera, {
            focus: option.bokeh.focus || 1.0,
            aperture: option.bokeh.aperture || 0.001,
            maxblur: option.bokeh.maxblur ||  1.0,
            width:  el.offsetWidth,
            height: el.offsetHeight
        })

    /*
     bokehPass.uniforms[ "focus" ].value = 1.0;
     bokehPass.uniforms[ "aperture" ].value = 0.025;
     bokehPass.uniforms[ "maxblur" ].value = 1.0
     */
        composer.addPass( bokehPass )
        this.bokehPass = bokehPass
    }

    if(option.fxaa) {
        option.fxaa = typeof option.fxaa === 'boolean' ? {} : option.fxaa
        const fxaaPass = new ShaderPass( FXAAShader )
        const pixelRatio = renderer.getPixelRatio()
        fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( el.offsetWidth * pixelRatio )
        fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( el.offsetHeight * pixelRatio )
        this.fxaaPass = fxaaPass
        composer.addPass( fxaaPass )
    }


    this.render = () => composer.render()
    state.el.addEventListener('resize',() => composer.setSize( state.el.offsetWidth,  state.el.offsetHeight ))
}

export default Composer
