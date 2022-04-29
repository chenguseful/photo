import * as THREE from '../plugins/Three/build/three.module.js';
import {
    OrbitControls
} from '../plugins/Three/module/jsm/controls/OrbitControls.js';
import {
    GLTFLoader
} from '../plugins/Three/module/jsm/loaders/GLTFLoader.js';

$('.ar-identify').on('click', function (event) {
    $(this).hide();
    $('.load').show();
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

var container;
var camera, scene, renderer;
var controls, group;

function init() {
    container = document.getElementById('container');

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 2, 10);

    controls = new OrbitControls(camera, container);
    controls.target.set(0, 2, 0);
    controls.update();

    scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 6, 0);
    light.castShadow = true;
    light.shadow.camera.top = 2;
    light.shadow.camera.bottom = -2;
    light.shadow.camera.right = 2;
    light.shadow.camera.left = -2;
    light.shadow.mapSize.set(4096, 4096);
    scene.add(light);

    var point = new THREE.PointLight(0xffffff, 1, 100);
    point.position.set(0, 0, 0);
    scene.add(point);

    group = new THREE.Group();
    scene.add(group);

    loadModel()

    renderer = new THREE.WebGLRenderer({
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    animate()
    window.addEventListener('resize', onWindowResize, false);
}

function loadModel() {
    var loader = new GLTFLoader().setPath('../models/panda/');
    loader.load('scene.gltf', function (gltf) {
        const obj = gltf.scene
        obj.position.set(0, 2, 0)
        obj.scale.set(1, 1, 1)
        scene.add(obj);
        $('.load').hide()
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    renderer.render(scene, camera);
}