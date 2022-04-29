import single from "../singe.js"
import _3d from "../../three.js"

import Draw from "./Draw.js"
import CssRenderer from "./CssRenderer.js"
import SceneTransition from "./SceneTransition.js"
import SingleTransitionScene from "./SingleTransitionScene.js"
import Composer from './Composer.js'
import House from './House.js'

const draw =  parent => single.draw ? single.draw : (single.draw  = new Draw(parent))
const cssRenderer = type => {
    if(type === '2d') {
        single.css2dRenderer = single.css2dRenderer ? single.css2dRenderer :  (single.css2dRenderer = new CssRenderer( _3d.CSS2DRenderer, _3d.CSS2DObject))
        return single.css2dRenderer
    }else if(type === '3d') {
        single.css3dRenderer = single.css3dRenderer ? single.css3dRenderer :  (single.css3dRenderer = new CssRenderer( _3d.CSS3DRenderer, _3d.CSS3DObject))
        return single.css3dRenderer
    }
}
const sceneTransition = (sceneA, sceneB, transitionParams) => single.sceneTransition ? single.sceneTransition : (single.sceneTransition  = new SceneTransition(sceneA, sceneB, transitionParams))
const singleTransitionScene = (name, callback, render) => new SingleTransitionScene(name, callback, render)
const composer = option => new Composer(option)

const house = option =>  new House(option)

export {
    draw,
    cssRenderer,
    sceneTransition,
    singleTransitionScene,
    composer,
    house
}
