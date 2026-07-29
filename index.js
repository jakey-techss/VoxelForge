const container = document.getElementById("three-container");


let blocks = {};
let selectedBlock = "grass";
let blockCount = 0;


const WORLD_SIZE = 16;
const BUILD_ZONE = {

    minX: -8,
    maxX: 7,

    minZ: -8,
    maxZ: 7

};


const blockColors = {

    grass: 0x55aa55,
    dirt: 0x8b5a2b,
    stone: 0x777777,
    wood: 0x9b6b30,
    planks: 0xc89b55,
    glass: 0x88ccff,
    brick: 0xaa4444,
    metal: 0xaaaaaa,
    printer: 0x222222

};



// =========================
// THREE SETUP
// =========================


const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);



const camera =
    new THREE.PerspectiveCamera(
        70,
        container.clientWidth /
        container.clientHeight,
        0.1,
        1000
    );



camera.position.set(
    12,
    12,
    12
);


let cameraTarget = new THREE.Vector3(
    0,
    0,
    0
);


let moveSpeed = 0.25;



const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });


renderer.setSize(
    container.clientWidth,
    container.clientHeight
);


container.appendChild(renderer.domElement);





scene.add(
    new THREE.AmbientLight(
        0xffffff,
        .7
    )
);



let sun =
    new THREE.DirectionalLight(
        0xffffff,
        1
    );


sun.position.set(
    10,
    20,
    10
);


scene.add(sun);





// =========================
// CAMERA ROTATION
// =========================


let rotation = {

    yaw: -45,
    pitch: -35

};


let dragging = false;

let lastMouse = {
    x: 0,
    y: 0
};



renderer.domElement.addEventListener(
    "mousedown",
    e => {

        dragging = true;

        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;

    });



window.onmouseup = () => {

    dragging = false;

};



window.onmousemove = e => {


    if (!dragging)
        return;


    let dx =
        e.clientX - lastMouse.x;


    let dy =
        e.clientY - lastMouse.y;


    rotation.yaw -= dx * .3;

    rotation.pitch -= dy * .3;



    rotation.pitch =
        Math.max(
            -89,
            Math.min(
                -10,
                rotation.pitch
            )
        );


    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY;


};



function updateCamera() {


    let yaw =
        THREE.MathUtils.degToRad(
            rotation.yaw
        );


    let pitch =
        THREE.MathUtils.degToRad(
            rotation.pitch
        );


    let distance = 18;


    camera.position.x =
        Math.cos(yaw) *
        Math.cos(pitch) *
        distance;


    camera.position.y =
        Math.sin(-pitch) *
        distance;


    camera.position.z =
        Math.sin(yaw) *
        Math.cos(pitch) *
        distance;



    // movement offset
    if (keys.ArrowUp)
        cameraTarget.x -= moveSpeed;


    if (keys.ArrowDown)
        cameraTarget.x += moveSpeed;


    if (keys.ArrowLeft)
        cameraTarget.z += moveSpeed;


    if (keys.ArrowRight)
        cameraTarget.z -= moveSpeed;



    camera.lookAt(
        cameraTarget
    );

}



// zoom

renderer.domElement.onwheel = e => {

    camera.position.multiplyScalar(
        e.deltaY > 0 ? 1.1 : .9
    );

};






// =========================
// BLOCK SYSTEM
// =========================



const cubeGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );
const textureLoader = new THREE.TextureLoader();


function loadTexture(path) {

    let texture =
        textureLoader.load(path);

    texture.magFilter =
        THREE.NearestFilter;

    texture.minFilter =
        THREE.NearestFilter;

    return texture;

}



// Grass block

const textures = {

    grassTop:
        loadTexture(
            "textures/grass.png"
        ),

    grassSide:
        loadTexture(
            "textures/dirt.png"
        ),

    dirt:
        loadTexture(
            "textures/dirt.png"
        ),


    stone:
        loadTexture(
            "textures/stone.jpg"
        ),


    woodTop:
        loadTexture(
            "textures/wood.jpg"
        ),

    woodSide:
        loadTexture(
            "textures/wood.jpg"
        ),
    planks:
        loadTexture(
            "textures/planks.jpg"
        ),
    glass:
        loadTexture(
            "textures/glass.png"
        ),
    brick:
        loadTexture(
            "textures/Brick.webp"
        ),


};
const glassTexture =
    loadTexture(
        "textures/glass.png"
    );

glassTexture.magFilter =
    THREE.NearestFilter;

glassTexture.minFilter =
    THREE.NearestFilter;


function getBlockMaterial(type) {


    switch (type) {


        case "grass":

            return [

                // right
                new THREE.MeshLambertMaterial({
                    map: textures.grassSide
                }),

                // left
                new THREE.MeshLambertMaterial({
                    map: textures.grassSide
                }),

                // top
                new THREE.MeshLambertMaterial({
                    map: textures.grassTop
                }),

                // bottom
                new THREE.MeshLambertMaterial({
                    map: textures.dirt
                }),

                // front
                new THREE.MeshLambertMaterial({
                    map: textures.grassSide
                }),

                // back
                new THREE.MeshLambertMaterial({
                    map: textures.grassSide
                })

            ];



        case "dirt":

            return new THREE.MeshLambertMaterial({

                map: textures.dirt

            });
            case "brick":

            return new THREE.MeshLambertMaterial({

                map: textures.brick

            });
        case "planks":

            return new THREE.MeshLambertMaterial({

                map: textures.planks

            });



        case "stone":

            return new THREE.MeshLambertMaterial({

                map: textures.stone

            });

        case "glass":

            return new THREE.MeshPhysicalMaterial({

                map: textures.glass,

                color: 0x9ee7ff,

                transparent: true,

                opacity: 0.55,

                roughness: 0.1,

                metalness: 0,

                transmission: 0.2,

                side: THREE.DoubleSide

            });



        case "wood":

            return [

                new THREE.MeshLambertMaterial({
                    map: textures.woodSide
                }),

                new THREE.MeshLambertMaterial({
                    map: textures.woodSide
                }),

                new THREE.MeshLambertMaterial({
                    map: textures.woodTop
                }),

                new THREE.MeshLambertMaterial({
                    map: textures.woodTop
                }),

                new THREE.MeshLambertMaterial({
                    map: textures.woodSide
                }),

                new THREE.MeshLambertMaterial({
                    map: textures.woodSide
                })

            ];
    }

}

function createBlock(x, y, z, type) {


    let key =
        `${x},${y},${z}`;


    if (blocks[key])
        return;



    let cube =
        new THREE.Mesh(

            cubeGeometry,

            getBlockMaterial(type)

        );
    if (type === "glass") {

        let edges =
            new THREE.EdgesGeometry(
                cubeGeometry
            );


        let line =
            new THREE.LineSegments(

                edges,

                new THREE.LineBasicMaterial({

                    color: 0x66ccff

                })

            );


        cube.add(line);

    }


    cube.position.set(
        x,
        y,
        z
    );


    cube.userData.type = type;


    scene.add(cube);


    blocks[key] = cube;


    blockCount++;

    updateStats();

}




function removeBlock(x, y, z) {

    if (y <= 0) {

        return;

    }

    let key =
        `${x},${y},${z}`;


    if (!blocks[key])
        return;



    scene.remove(
        blocks[key]
    );


    delete blocks[key];


    blockCount--;

    updateStats();

}




// =========================
// FLAT WORLD
// =========================


function generateWorld() {

    for (
        let x = -WORLD_SIZE / 2;
        x < WORLD_SIZE / 2;
        x++

    ) {

        for (
            let z = -WORLD_SIZE / 2;
            z < WORLD_SIZE / 2;
            z++
        ) {

            createBlock(
                x,
                -2,
                z,
                "dirt"
            );


            createBlock(
                x,
                -1,
                z,
                "dirt"
            );


            createBlock(
                x,
                0,
                z,
                "grass"
            );


        }
    }

}



generateWorld();








// =========================
// INVENTORY
// =========================


document
    .querySelectorAll(".item")
    .forEach(item => {


        item.onclick = () => {


            document
                .querySelectorAll(".item")
                .forEach(i =>
                    i.classList.remove("selected")
                );



            item.classList.add(
                "selected"
            );



            selectedBlock =
                item.dataset.block;



            document
                .getElementById(
                    "selectedBlock"
                )
                .innerText =
                selectedBlock.substring(0, 1).toUpperCase() + selectedBlock.substring(1);



        };



    });






// =========================
// VOXEL CLICKING
// =========================


const raycaster =
    new THREE.Raycaster();


const mouse =
    new THREE.Vector2();



renderer.domElement
    .oncontextmenu = e => e.preventDefault();



renderer.domElement
    .onmousedown = e => {


        if (e.button !== 0 &&
            e.button !== 2)
            return;


        let rect =
            renderer.domElement
                .getBoundingClientRect();



        mouse.x =
            ((e.clientX - rect.left)
                / rect.width) * 2 - 1;


        mouse.y =
            -((e.clientY - rect.top)
                / rect.height) * 2 + 1;



        raycaster.setFromCamera(
            mouse,
            camera
        );



        let hits =
            raycaster.intersectObjects(
                Object.values(blocks)
            );



        if (!hits.length)
            return;



        let hit =
            hits[0];



        let block =
            hit.object;



        let pos =
            block.position;



        if (e.button === 2) {


            removeBlock(
                pos.x,
                pos.y,
                pos.z
            );


        }



        if (e.button === 0) {


            let normal =
                hit.face.normal;



            let newX =
                pos.x + normal.x;


            let newY =
                pos.y + normal.y;


            let newZ =
                pos.z + normal.z;



            if (
                insideBuildZone(
                    newX,
                    newZ
                )
            ) {


                createBlock(

                    newX,
                    newY,
                    newZ,
                    selectedBlock

                );


            }
            else {


                showBuildAlert();


            }


        }


    };







// =========================
// ARROW MOVEMENT
// =========================

let keys = {};


window.addEventListener(
    "keydown",
    e => {

        keys[e.key] = true;

    });


window.addEventListener(
    "keyup",
    e => {

        keys[e.key] = false;

    });







function updateStats() {


    document
        .getElementById("blockCount")
        .innerText =
        blockCount;



}




// =========================
// LOOP
// =========================


function animate() {

    requestAnimationFrame(
        animate
    );


    updateCamera();


    renderer.render(
        scene,
        camera
    );


}


animate();





window.onresize = () => {


    camera.aspect =
        container.clientWidth /
        container.clientHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );


};
let alertTimeout;


function showBuildAlert() {


    let alert =
        document.getElementById(
            "build-alert"
        );


    alert.classList.add(
        "show"
    );


    clearTimeout(
        alertTimeout
    );


    alertTimeout =
        setTimeout(() => {


            alert.classList.remove(
                "show"
            );


        }, 2000);


}
function insideBuildZone(x, z) {


    return (

        x >= BUILD_ZONE.minX &&
        x <= BUILD_ZONE.maxX &&

        z >= BUILD_ZONE.minZ &&
        z <= BUILD_ZONE.maxZ

    );


}