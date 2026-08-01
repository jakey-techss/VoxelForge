const container = document.getElementById("three-container");


let blocks = {};
let blocksToMake = [];
let selectedBlock = "grass";
let blockCount = 0;
let connected = false

const socket = new WebSocket("ws://10.200.176.68/ws");
connectToPrinter()
function connectToPrinter() {
    document.getElementById("status").innerHTML = "Connecting To Printer..."
    document.getElementById("status").style.color = "var(--warning)"
    socket.onopen = () => {
        document.getElementById("status").innerHTML = "Ready"
        document.getElementById("status").style.color = "var(--success)"
        connected = true
        
    };
    socket.onmessage = (event) => {
        console.log(event.data);
    };
    socket.onclose = () => {
        document.getElementById("status").innerHTML = "Printer Disconnected"
        document.getElementById("status").style.color = "var(--error)"
    };
    socket.onerror = (error) => {
        document.getElementById("status").innerHTML = "Failed To Connect To Printer"
        document.getElementById("status").style.color = "var(--error)"
    };
}

const WORLD_SIZE = 16;
const BUILD_ZONE = {

    minX: -8,
    maxX: 7,

    minZ: -8,
    maxZ: 7

};



// =========================
// THREE SETUP
// =========================


const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x78c8ff);


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

// =========================
// DAY NIGHT SUN SYSTEM
// =========================
const moonLight =
    new THREE.DirectionalLight(
        0x8899ff,
        0.15
    );


scene.add(
    moonLight
);

const sunLight =
    new THREE.DirectionalLight(
        0xffffff,
        1
    );


sunLight.position.set(
    50,
    100,
    50
);


scene.add(
    sunLight
);



const sunTexture = new THREE.TextureLoader().load("textures/sun.png");
sunTexture.magFilter = THREE.NearestFilter;
sunTexture.minFilter = THREE.NearestFilter;

const minecraftSun = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({
        map: sunTexture,
        transparent: true,
        depthWrite: false
    })
);

scene.add(minecraftSun);


const sunMaterial =
    new THREE.MeshBasicMaterial({

        color: 0xffff88

    });




scene.add(
    minecraftSun
);
// =========================
// MOON
// =========================

const moonTexture = new THREE.TextureLoader().load("textures/moon.png");
moonTexture.magFilter = THREE.NearestFilter;
moonTexture.minFilter = THREE.NearestFilter;

const moon = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 18),
    new THREE.MeshBasicMaterial({
        map: moonTexture,
        transparent: true,
        depthWrite: false
    })
);

scene.add(moon);


const moonMaterial =
    new THREE.MeshBasicMaterial({

        color: 0xffffff,

    });




scene.add(
    moon
);
// =========================
// STAR FIELD
// =========================

let stars = [];


function createStars() {


    const starMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xffffff

        });



    for (
        let i = 0;
        i < 300;
        i++
    ) {


        let star =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.15,
                    6,
                    6
                ),

                starMaterial

            );



        star.position.set(

            Math.random() * 300 - 150,

            Math.random() * 150 + 50,

            Math.random() * 300 - 150

        );


        scene.add(
            star
        );


        stars.push(star);


    }


}
// =========================
// LOWER STAR FIELD
// =========================

let bottomStars = [];


function createBottomStars() {

    const bottomStarMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xffffff,

            transparent: true,

            opacity: 0.7

        });


    for (
        let i = 0;
        i < 200;
        i++
    ) {

        let star =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.12,
                    6,
                    6
                ),

                bottomStarMaterial

            );


        star.position.set(

            Math.random() * 300 - 150,

            Math.random() * -80 - 20,

            Math.random() * 300 - 150

        );


        scene.add(star);

        bottomStars.push(star);

    }

}


createBottomStars();



createStars();
// =========================
// REAL TIME DAY NIGHT CYCLE
// =========================


function updateDayNight() {
    minecraftSun.quaternion.copy(camera.quaternion);
    moon.quaternion.copy(camera.quaternion);


    const now = new Date();

    const hours =
        now.getHours() +
        now.getMinutes() / 60;

    // Shift by -6 hours
    const angle =
        ((hours - 6) / 24) * Math.PI * 2;


    let radius = 120;



    let sunX =
        Math.cos(angle)
        *
        radius;


    let sunY =
        Math.sin(angle)
        *
        radius;


    let sunZ =
        40;



    sunLight.position.set(

        sunX,
        sunY,
        sunZ

    );



    minecraftSun.position.set(

        sunX,
        sunY,
        sunZ

    );

    // Moon opposite the sun

    // Moon opposite the sun
    moon.position.set(
        -sunX,
        -sunY,
        -sunZ
    );

    // brightness

    const daylight = Math.max(0, Math.sin(angle));



    sunLight.intensity =
        daylight;

    let nightAmount =
        1 - Math.max(
            0,
            daylight * 4
        );


    stars.forEach(star => {

        star.visible =
            nightAmount > 0.2;

    });


    bottomStars.forEach(star => {

        star.visible =
            nightAmount > 0.2;

    });

    // sky colors
    const dayFactor = Math.max(0, Math.sin(angle));

    sunLight.intensity = 0.15 + dayFactor * 0.85;
    moonLight.intensity = 0.4 * (1 - dayFactor);
    if (dayFactor < 0.1) {


        // night

        scene.background =
            new THREE.Color(
                0x050820
            );


        sunLight.color.set(
            0x6677ff
        );


    }
    else if (dayFactor < 0.35) {


        // sunrise / sunset

        scene.background =
            new THREE.Color(
                0xffaa77
            );


        sunLight.color.set(
            0xffcc99
        );


    }
    else {


        // day

        scene.background =
            new THREE.Color(
                0x78c8ff
            );


        sunLight.color.set(
            0xffffff
        );


    }


}


// =========================
// VIEW CUBE
// =========================

// =========================
// CLOUD SYSTEM
// =========================


let clouds = [];


const cloudMaterial =
    new THREE.MeshLambertMaterial({

        color: 0xffffff,

        transparent: true,

        opacity: 0.85,

        depthWrite: false

    });



function createCloud(x, y, z) {

    let cloud = new THREE.Group();

    let cloudShape = [
        [-2, 0, 0],
        [-1, 0, 0],
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0],

        [-1, 0.5, 0],
        [0, 0.5, 0],
        [1, 0.5, 0]
    ];


    cloudShape.forEach(offset => {

        let cube =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.9,
                    0.9,
                    1.9
                ),
                cloudMaterial
            );


        cube.position.set(
            offset[0],
            offset[1],
            offset[2]
        );


        cloud.add(cube);

    });


    cloud.position.set(
        x,
        y,
        z
    );


    scene.add(cloud);

    clouds.push(cloud);

}
function generateClouds() {


    for (
        let i = 0;
        i < 25;
        i++
    ) {


        createCloud(

            Math.random() * 120 - 60,

            35 + Math.random() * 20,

            Math.random() * 120 - 60

        );


    }


}
// =========================
// LOW CLOUD SYSTEM
// =========================

let lowClouds = [];


function createLowCloud(x, y, z) {


    let cloud =
        new THREE.Group();



    let parts = [

        [-3, 0, 0],
        [-2, 0, 0],
        [-1, 0, 0],
        [0, 0, 0],
        [1, 0, 0],
        [2, 0, 0],

        [-1, 0.5, 0],
        [0, 0.5, 0],
        [1, 0.5, 0]

    ];

    const lowCloudMaterial =
        new THREE.MeshLambertMaterial({

            color: 0xffffff,

            transparent: true,

            opacity: 0.55,

            depthWrite: false

        });

    parts.forEach(offset => {


        let cube =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    1.95,
                    0.68,
                    1.95
                ),


                lowCloudMaterial

            );


        cube.position.set(

            offset[0],
            offset[1],
            offset[2]

        );


        cloud.add(cube);


    });



    cloud.position.set(
        x,
        y,
        z
    );


    scene.add(
        cloud
    );


    lowClouds.push(cloud);

}
function generateLowClouds() {


    for (
        let i = 0;
        i < 15;
        i++
    ) {


        createLowCloud(

            Math.random() * 100 - 50,

            8 + Math.random() * 8,

            Math.random() * 100 - 50

        );


    }


}


generateLowClouds();
function updateLowClouds() {


    lowClouds.forEach(cloud => {


        cloud.position.z += 0.015;


        if (cloud.position.z > 60) {


            cloud.position.z = -60;


        }


    });


}


generateClouds();
function updateClouds() {


    clouds.forEach(cloud => {


        cloud.position.x += 0.01;



        // wrap around world

        if (cloud.position.x > 80) {


            cloud.position.x = -80;


        }


    });


}

const cubeScene =
    new THREE.Scene();


const cubeCamera =
    new THREE.PerspectiveCamera(
        40,
        1,
        0.1,
        100
    );


cubeCamera.position.set(
    0,
    0,
    5
);



const cubeRenderer =
    new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });


cubeRenderer.setSize(
    120,
    120
);


document
    .getElementById("view-cube")
    .appendChild(
        cubeRenderer.domElement
    );





const viewCubeGeometry =
    new THREE.BoxGeometry(
        2,
        2,
        2
    );



const cubeFaceMaterial = {

    transparent: true,

    opacity: 0.35,

    side: THREE.DoubleSide

};


const cubeMaterials = [

    new THREE.MeshBasicMaterial({
        color: 0xff5555,
        ...cubeFaceMaterial
    }),

    new THREE.MeshBasicMaterial({
        color: 0xff5555,
        ...cubeFaceMaterial
    }),

    new THREE.MeshBasicMaterial({
        color: 0x55ff55,
        ...cubeFaceMaterial
    }),

    new THREE.MeshBasicMaterial({
        color: 0x55ff55,
        ...cubeFaceMaterial
    }),

    new THREE.MeshBasicMaterial({
        color: 0x5599ff,
        ...cubeFaceMaterial
    }),

    new THREE.MeshBasicMaterial({
        color: 0x5599ff,
        ...cubeFaceMaterial
    })

];




const viewCube =
    new THREE.Mesh(
        viewCubeGeometry,
        cubeMaterials
    );


cubeScene.add(viewCube);
function createFaceLabel(text, position, rotation) {


    const canvas =
        document.createElement("canvas");


    canvas.width = 256;
    canvas.height = 256;


    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        256,
        256
    );


    ctx.fillStyle = "white";


    ctx.font =
        "bold 55px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        text,
        128,
        128
    );



    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    const material =
        new THREE.MeshBasicMaterial({

            map: texture,

            transparent: true,

            depthTest: false

        });



    const plane =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                .8,
                .8
            ),

            material

        );



    plane.position.copy(
        position
    );


    plane.rotation.copy(
        rotation
    );


    plane.renderOrder = 10;


    cubeScene.add(
        plane
    );


}



// cube labels
// TOP (+Y)

createFaceLabel(

    "TOP",

    new THREE.Vector3(
        0,
        1.01,
        0
    ),

    new THREE.Euler(
        -Math.PI / 2,
        0,
        0
    )

);



// FRONT (+Z)

createFaceLabel(

    "FRONT",

    new THREE.Vector3(
        0,
        0,
        1.01
    ),

    new THREE.Euler(
        0,
        0,
        0
    )

);



// RIGHT (+X)

createFaceLabel(

    "RIGHT",

    new THREE.Vector3(
        1.01,
        0,
        0
    ),

    new THREE.Euler(
        0,
        Math.PI / 2,
        0
    )

);
function createAxisLine(
    color,
    direction
) {


    const points = [

        new THREE.Vector3(
            0,
            0,
            0
        ),

        direction

    ];


    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );


    const material =
        new THREE.LineBasicMaterial({

            color: color,

            linewidth: 3

        });



    const line =
        new THREE.Line(
            geometry,
            material
        );


    cubeScene.add(line);


}



// X axis

createAxisLine(
    0xff0000,
    new THREE.Vector3(
        2,
        0,
        0
    )
);


// Y axis

createAxisLine(
    0x00ff00,
    new THREE.Vector3(
        0,
        2,
        0
    )
);


// Z axis

createAxisLine(
    0x0000ff,
    new THREE.Vector3(
        0,
        0,
        2
    )
);





function updateViewCube() {


    viewCube.quaternion.copy(
        camera.quaternion.clone().invert()
    );

    cubeScene.add(viewCube);
    cubeCamera.lookAt(0, 0, 0);

    cubeRenderer.render(
        cubeScene,
        cubeCamera
    );


}


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
    metal:
        loadTexture(
            "textures/iron.png"
        ),


};
const glassTexture = loadTexture("textures/glass.png");

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
        case "metal":

            return new THREE.MeshLambertMaterial({

                map: textures.metal

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
class blockItem {
    constructor(id, type, location) {
        this.id = id
        this.type = type
        this.location = location
        blocksToMake.push(this)
    }

}
function applyGravity() {


    Object.values(blocks)
        .forEach(block => {


            let x =
                block.position.x;


            let y =
                block.position.y;


            let z =
                block.position.z;



            // ground cannot fall

            if (y <= 0)
                return;



            let below =
                `${x},${y - 1},${z}`;



            // no block below

            if (!blocks[below]) {


                let oldKey =
                    `${x},${y},${z}`;



                delete blocks[oldKey];

                let index = blocksToMake.findIndex((block) => {
                    return (block.location.x == x && block.location.y == y && block.location.z == z)
                })

                blocksToMake.splice(index, 1)

                block.position.y -= 1;

                new blockItem(self.crypto.randomUUID(), selectedBlock, { x: x, y: y - 1, z: z })


                let newKey =
                    `${x},${y - 1},${z}`;



                blocks[newKey] = block;




            }


        });


}




function removeBlock(x, y, z) {

    if (y <= 0) {

        return;

    }

    let index = blocksToMake.findIndex((block) => {
        return (block.location.x == x && block.location.y == y && block.location.z == z)
    })

    blocksToMake.splice(index, 1)

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
            blockCount--;


            createBlock(
                x,
                -1,
                z,
                "dirt"
            );
            blockCount--;


            createBlock(
                x,
                0,
                z,
                "grass"
            );
            blockCount--;


        }

    }
    updateStats();


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
                new blockItem(self.crypto.randomUUID(), selectedBlock, { x: newX, y: newY, z: newZ })


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

let gravityTimer = 0;

function animate() {

    requestAnimationFrame(
        animate
    );


    updateCamera();

    gravityTimer++;
    if (gravityTimer > 5) {

        applyGravity();

        gravityTimer = 0;

    }

    renderer.render(
        scene,
        camera
    );


    updateViewCube();
    updateClouds();
    updateLowClouds();
    updateDayNight();


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
const homePosition =
    new THREE.Vector3(
        12,
        12,
        12
    );



function resetCamera() {


    camera.position.copy(
        homePosition
    );


    cameraTarget.set(
        0,
        0,
        0
    );


    rotation.yaw = -45;

    rotation.pitch = -35;


}
document
    .getElementById("home-button")
    .onclick = resetCamera;
const cubeRaycaster =
    new THREE.Raycaster();


const cubeMouse =
    new THREE.Vector2();
cubeRenderer.domElement
    .addEventListener(
        "click",
        e => {


            let rect =
                cubeRenderer.domElement
                    .getBoundingClientRect();



            cubeMouse.x =
                ((e.clientX - rect.left)
                    / rect.width) * 2 - 1;



            cubeMouse.y =
                -((e.clientY - rect.top)
                    / rect.height) * 2 + 1;



            cubeRaycaster
                .setFromCamera(
                    cubeMouse,
                    cubeCamera
                );



            let hit =
                cubeRaycaster
                    .intersectObject(
                        viewCube
                    );



            if (!hit.length)
                return;



            let normal =
                hit[0].face.normal;



            if (normal.y > .5) {

                camera.position.set(
                    0,
                    25,
                    0
                );

            }


            if (normal.z > .5) {

                camera.position.set(
                    0,
                    10,
                    25
                );

            }


            if (normal.x > .5) {

                camera.position.set(
                    25,
                    10,
                    0
                );

            }



            cameraTarget.set(
                0,
                0,
                0
            );


        });

const loadingMessages = [

    "Generating toolpaths...",
    "Optimizing voxel layers...",
    "Compressing block data...",
    "Sending data to printer...",
    "Heating print head...",
    "Calculating supports...",
    "Aligning build platform...",
    "Preparing first layer...",
    "Calibrating printer...",
    "Checking block integrity...",
    "Building chunks...",
    "Crafting masterpiece...",
    "Mining diamonds...",
    "Feeding creepers...",
    "Summoning Steve..."
];

let printTimer;

function startPrinting(totalSeconds, data) {

    document
        .getElementById("printOverlay")
        .classList.remove("hidden");

    let elapsed = 0;

    updateLoadingMessage();

    printTimer = setInterval(() => {

        elapsed++;

        let percent = Math.min(100,
            elapsed / totalSeconds * 100);

        document
            .getElementById("progressBar")
            .style.width = percent + "%";

        document
            .getElementById("progressPercent")
            .textContent =
            Math.floor(percent) + "%";

        let remaining =
            totalSeconds - elapsed;

        let mins =
            Math.floor(remaining / 60);

        let secs =
            remaining % 60;

        document
            .getElementById("remainingTime")
            .textContent =
            `${mins}:${secs.toString().padStart(2, "0")}`;

        if (elapsed % 4 === 0)
            updateLoadingMessage();

        if (elapsed >= totalSeconds) {

            clearInterval(printTimer);

            document
                .getElementById("loadingMessage")
                .textContent =
                "Print Complete!";

            setTimeout(() => {

                document
                    .getElementById("printOverlay")
                    .classList.add("hidden");

            }, 1500);

        }

    }, 1000);

}

function updateLoadingMessage() {

    document
        .getElementById("loadingMessage")
        .textContent =
        loadingMessages[
        Math.floor(
            Math.random() * loadingMessages.length
        )
        ];

}

document
    .getElementById("cancelPrint")
    .onclick = () => {

        clearInterval(printTimer);
        socket.send("CancelPrint")
        document
            .getElementById("printOverlay")
            .classList.add("hidden");

    };
document.getElementById("exportModel").addEventListener("click", () => {
    connectToPrinter()
            //if (connected) {
                let layers = []

                blocksToMake.forEach((block) => {
                    if (layers[block.location.y - 1] == null || layers[block.location.y - 1] == undefined) {
                        layers.push([])
                        layers[block.location.y - 1].push(block)
                    } else {
                        layers[block.location.y - 1].push(block)
                    }
                })
                layers.forEach((layr) => {
                    layr.sort((a, b) => {
                        return a.location.x - b.location.x
                    })
                })
                console.log(layers)
                layers.forEach((layr) => {
                    layr = JSON.stringify(layr)
                })
                layers = JSON.stringify(layers)
                startPrinting(1000, layers)
                console.log(layers)
                socket.send("StartPrint")
            //}
            

        })