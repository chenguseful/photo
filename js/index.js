import Ys3dApp from '../plugins/ys3d/index.js'

!(function () {
    // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            // 首先，如果有getUserMedia的话，就获得它
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator
                .msGetUserMedia;

            // 一些浏览器根本没实现它 - 那么就返回一个error到promise的reject来保持一个统一的接口
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // 否则，为老的navigator.getUserMedia方法包裹一个Promise
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
    const constraints = {
        video: {
            facingMode: 'environment'
        },
        audio: false
    };
    let promise = navigator.mediaDevices.getUserMedia(constraints);
    promise.then(stream => {
        let video = document.getElementById('video');
        // 旧的浏览器可能没有srcObject
        if ("srcObject" in video) {
            video.srcObject = stream;
        } else {
            // 防止再新的浏览器里使用它，应为它已经不再支持了
            video.src = window.URL.createObjectURL(stream);
        }
        video.onloadedmetadata = function (e) {
            video.play();
        };
    }).catch(err => {
        console.log(err.name + ": " + err.message);
    })
})();

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