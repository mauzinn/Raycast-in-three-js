import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js'
import * as CANNON from 'https://cdn.skypack.dev/cannon-es'
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js'
let GuiStatus = true
let GuiStatus2 = false
const form = document.querySelector('.form')
const form2 = document.querySelector('.form2')

function sendAlert(title, message) {
    const alerts = document.querySelector('.alerts')

    alerts.innerHTML = `
        <article class="alert">
            <div>
                <h3>${title}</h3>
                <p>${message}</p>
            </div>

            <div class="bar"></div>
        </article>
        `

    setTimeout(() => {
        alerts.innerHTML = ''
    }, 4800)
}

function init() {


    //Configurations
        const world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0)
        })
        const distorcion = 2
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )
        let loader = new GLTFLoader()
        let selected = ''

        const renderer = new THREE.WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight)
        document.body.appendChild(renderer.domElement)

        camera.position.x = 10
        camera.position.y = 10
        camera.position.z = 10
        camera.lookAt(scene.position)

        //Light
            const light = new THREE.AmbientLight(0xffffff, 0.3)
            scene.add(light)
            const sunLight = new THREE.DirectionalLight(0xfff5e1, 1)
            scene.add(sunLight)

    

    //Map
        //Ground
            const groundGeometry = new THREE.BoxGeometry(60, 1, 60)
            const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x0FF00, wireframe: true })
            const ground = new THREE.Mesh(groundGeometry, groundMaterial)

            const groundBody = new CANNON.Body({
                shape: new CANNON.Box(new CANNON.Vec3(60 / distorcion, 1 / distorcion, 60 / distorcion)),
                type: CANNON.Body.STATIC
            })

            scene.add(ground)
            world.addBody(groundBody)


        //Sphere
            function AddSphere(ray, x, y, z) {
                const sphereGeometry = new THREE.SphereGeometry(ray, 20, 20)
                const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
                sphere.castShadow = true

                const sphereBody = new CANNON.Body({
                    shape: new CANNON.Sphere(ray),
                    mass: ray * distorcion,
                    position: new CANNON.Vec3(x, y, z)
                })

                scene.add(sphere)
                world.addBody(sphereBody)

                function physicsLoad() {
                    requestAnimationFrame(physicsLoad)

                    sphere.position.copy(sphereBody.position)
                    sphere.quaternion.copy(sphereBody.quaternion)
                }

                physicsLoad()

                sendAlert('THREE.JS', 'Objeto "esfera" carregado com sucesso!')
            }

            form.addEventListener('submit', (e) => {
                e.preventDefault()

                AddSphere(Number(e.srcElement[0].value), Number(e.srcElement[1].value), Number(e.srcElement[2].value), Number(e.srcElement[3].value))
            })



    //OrbitControls
        const OrbitControl = new OrbitControls(camera, renderer.domElement)
        OrbitControl.minDistance = 5
        OrbitControl.maxDistance = 60
        OrbitControl.enablePan = false

        const raycaster = new THREE.Raycaster()
        const pointer = new THREE.Vector2()

        function onPointerMove( event ) {
            pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
            pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1

            raycaster.setFromCamera( pointer, camera )
            const intersects = raycaster.intersectObjects( scene.children )

            if (intersects[0]) {
                if (selected) {
                    selected.material.transparent = false
                    selected.material.opacity = 1
                }
                selected = intersects[0].object
                console.log(world)
            }
        }



    //Mudar cor
        form2.addEventListener('submit', (e) => {
            e.preventDefault()

            selected.material.color.set(eval(e.srcElement[0].value))
        })




    //Load all
        function LoadALL() {
            requestAnimationFrame(LoadALL)

            world.step(1 / 60)

            OrbitControl.update()

            if (selected) {
                OrbitControl.target.set(selected.position.x, selected.position.y, selected.position.z)
                selected.material.transparent = true
                selected.material.opacity = 0.2
            }

            renderer.render( scene, camera )
        }

        LoadALL()

        window.addEventListener('click', onPointerMove )
}

window.addEventListener('load', init())




//Gui 1 open or close

function guiOpenOrClose(status) {
    const guiclose = document.querySelector('.gui-close')

    if (status) {
        guiclose.style.display = "block"
    } else {
        guiclose.style.display = "none"
    }
}

const buttonCloseGui = document.querySelector('.close-gui')

buttonCloseGui.addEventListener('click', () => {
    GuiStatus = !GuiStatus

    guiOpenOrClose(GuiStatus)
})




//Gui 2 open or close

function guiOpenOrClose2(status) {
    const guiclose = document.querySelector('.gui-close2')

    if (status) {
        guiclose.style.display = "block"
    } else {
        guiclose.style.display = "none"
    }
}

const buttonCloseGui2 = document.querySelector('.close-gui2')

buttonCloseGui2.addEventListener('click', () => {
    GuiStatus2 = !GuiStatus2

    guiOpenOrClose2(GuiStatus2)
})