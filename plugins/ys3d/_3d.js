/**
 * @author跃焱邵隼
 * @host www.wellyyss.cn
 * @qq group 169470811
 */
import * as MeshLines  from "./threeLibs/lines/MeshLine.js"
import * as THREE from './threeLibs/three.module.js'
import * as TWEEN from './threeLibs/libs/tween.module.min.js'
import * as  OrbitControls from "./threeLibs/controls/OrbitControls.js"
import * as  CSS2DRenderers  from "./threeLibs/renderers/CSS2DRenderer.js"
import * as  CSS3DRenderers  from "./threeLibs/renderers/CSS3DRenderer.js"
import * as ThreeBSP from './threeLibs/libs/ThreeBSP.module.js'
import * as Water from  '../../plugins/ys3d/threeLibs/objects/Water2.js'
import * as RenderPass from  '../../plugins/ys3d/threeLibs/postprocessing/RenderPass.js'
import * as UnrealBloomPass from  '../../plugins/ys3d/threeLibs/postprocessing/UnrealBloomPass.js'
import * as  OutlinePass  from "./threeLibs/postprocessing/OutlinePass.js"
import * as EffectComposer from '../../plugins/ys3d/threeLibs/postprocessing/EffectComposer.js'

const _3d = {}
Object.assign(_3d, THREE)
Object.assign(_3d, MeshLines)
Object.assign(_3d, TWEEN)
Object.assign(_3d, OrbitControls)
Object.assign(_3d, CSS2DRenderers)
Object.assign(_3d, CSS3DRenderers)
Object.assign(_3d, ThreeBSP)
Object.assign(_3d, Water)
Object.assign(_3d, RenderPass)
Object.assign(_3d, UnrealBloomPass)
Object.assign(_3d, OutlinePass)
Object.assign(_3d, EffectComposer)

export default _3d


