import Ys3dApp from '../plugins/ys3d/index.js'

$('.ar-identify').on('click', function (event) {
    $(this).hide();
    $('.wrap img').show();
    event.preventDefault();
    html2canvas(document.body, {
        allowTaint: true,
        taintTest: false,
        useCORS: true
    }).then(canvas => {
        console.log(canvas)
        setTimeout(() => {
            init()
        }, 2000);
    })
})


function init() {
    const el = document.getElementById('person')
    const app = new Ys3dApp(el)
    const scene = app.scene
    const renderer = app.renderer
    const camera = app.camera
    const _3d = app._3d
    renderer.setClearAlpha(0); //清除自带颜色

    const controls = app.initOrbitControls(el)
    controls.autoRotate = false
    camera.position.set(0, 0, 1200)

    app.controls.enablePan = false;

    let allGroup = new _3d.Group()
    allGroup.scale.set(2, 2, 2)
    allGroup.position.set(0, 0, 0)
    scene.add(allGroup)

    initLight()
    loadModel()

    app.getClickPoint(p => {
        console.log(`${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}`)
    })

    app.render(() => {
        renderer.render(scene, camera)
        app.controls.update()
    })

    //灯光
    function initLight() {
        var ambient = new _3d.AmbientLight('#ffffff', 1); //环境光
        scene.add(ambient);
    }

    //导入模型
    function loadModel() {

        let objFileList = []
        objFileList = [{
            type: 'gltf',
            url: '../models/panda/scene.gltf',
            onLoad: function (object) {
                const obj = object.scene.clone()
                obj.position.set(0, 0, 0)
                obj.scale.set(80, 80, 80)
                allGroup.add(obj)
                $('.wrap img').hide();
            }
        }]
        app.iterateLoad(objFileList, () => {}, () => {})
        return this
    }
}