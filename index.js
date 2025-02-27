import * as THREE from "three";
import {OrbitControls} from "three/addons/controls/OrbitControls.js";
const canvas = document.getElementById("canvas");
const canvas2d = document.getElementById("canvas2d");
canvas2d.width = 200;
canvas2d.height = 200;
let randX = 0;
let randZ = 0; 
const gameBox = document.getElementById("box");
const ctx = canvas2d.getContext("2d");
const renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.5, 100);
const controls = new OrbitControls(camera, renderer.domElement);
const scene = new THREE.Scene();
const light = new THREE.DirectionalLight(0xffffff, 3);
let angle = 0;
let score = 0;
const scoreText = document.getElementById("score");
scoreText.textContent = `Score: ${score}`;
let isGameOver = false;
let isThereAnApple = false;
let direction = "forward";
let snake = [{x: 0, z: 0}];
let x = 0;
let z = 0;
const platfrom = new THREE.Mesh(new THREE.BoxGeometry(20, .1, 20), new THREE.MeshStandardMaterial({color: 0xd3d3d3}));
platfrom.receiveShadow = true;
camera.position.set(0,2,6);
let causeOfDeath = "You Ran Into Yourself!";
light.position.set(5,2,5);
scene.background = new THREE.Color(0xd3d3d3);
scene.add(light);
scene.add(platfrom);
window.addEventListener("keydown", movement);

function movement(e){
  switch(e.key){
    case "ArrowUp":
    direction = "forward";
    
    break;
    case "ArrowDown":
    direction = "backward";
    
    break;
    case "ArrowLeft":
    direction = "left";
   
    break;
    case "ArrowRight":
    direction = "right";
    
    break;
  }
}
function draw2d(){
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
    
   snake2d();
    
    const appleX = (randX + 10) * (canvas2d.width / 20);
    const appleZ = (randZ + 10) * (canvas2d.height / 20);
   
    ctx.beginPath();
    ctx.rect(appleX, appleZ, 10, 10);
    ctx.fillStyle = "red";
    ctx.fill();
}

function snake2d(){
   
    const snakcpy = [...snake];
    const snak2d = snakcpy.map(part =>
    ({
        x: (part.x + 10) * (canvas2d.width / 20), 
        z: (part.z + 10) * (canvas2d.width / 20) 
    })
    )
    let newHead = {x: snak2d[0].x, z: snak2d[0].z};
    snak2d.forEach(part =>{
        ctx.beginPath();
        ctx.rect(part.x, part.z, 10, 10);
        ctx.fillStyle = "green";
        ctx.fill();   
    })
    snak2d.unshift(newHead);
    snak2d.pop();
}
function drawSnake() {
    const snakeMeshes = scene.getObjectsByProperty("name", "snake");
    
    // Remove excess meshes
    while (snakeMeshes.length > snake.length) {
        const mesh = snakeMeshes.pop();
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    }

    // Create new meshes if needed
    while (snakeMeshes.length < snake.length) {
       
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({color: 0x00ff00})
        );
        mesh.castShadow = true;
        mesh.name = "snake";
        scene.add(mesh);
    
        snakeMeshes.push(mesh);
    
    }
       
    // Update positions with spacing
    snake.forEach((segment, index) => {
        const mesh = snakeMeshes[index];
        if (mesh) {
            mesh.position.set(segment.x, 0.5, segment.z);
        }
    });
}
const wall1 = new THREE.Mesh(new THREE.BoxGeometry(.05,.5,20), new THREE.MeshStandardMaterial({color: 0xdddddd}));
wall1.name = "wall";
wall1.position.set(10, .2, 0);
scene.add(wall1);

const wall2 = new THREE.Mesh(new THREE.BoxGeometry(.05,.5,20), new THREE.MeshStandardMaterial({color: 0xdddddd}));
wall2.name = "wall";
wall2.position.set(-10, .2, 0);
scene.add(wall2);

const wall3 = new THREE.Mesh(new THREE.BoxGeometry(20,.5,.05), new THREE.MeshStandardMaterial({color: 0xdddddd}));
wall3.name = "wall";
wall3.position.set(0, .2, 10);
scene.add(wall3);

const wall4 = new THREE.Mesh(new THREE.BoxGeometry(20,.5,.05), new THREE.MeshStandardMaterial({color: 0xdddddd}));
wall4.name = "wall";
wall4.position.set(0, .2, -10);
scene.add(wall4);

light.castShadow = true;

let cameraAngle = 0;
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  if (isMobile()) {
    document.getElementById("mobileDpad").innerHTML += `<div id="mobileDpad">
      <button id="up"></button>
      <div id="x-axis">
      <button id="left"></button>
      <button id="right"></button>
      </div>
      <button id="down"></button>
     </div>
     
`
   document.getElementById("up").addEventListener("click", () => direction = "forward");
   document.getElementById("down").addEventListener("click", () => direction = "backward");
   document.getElementById("left").addEventListener("click", () => direction = "left");
   document.getElementById("right").addEventListener("click", () => direction = "right");
  } else {
    // Code to execute if the user is on a PC or other non-mobile device
    console.log("PC or non-mobile device detected");
  }
function spawnApple(){
    const apple = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMaterial({color: 0xff0000}));
    randX = (Math.floor( Math.random() * 18 - 9)) + .5; 
    randZ = (Math.floor( Math.random() * 18 - 9)) + .5; 
    apple.position.set(randX, .5, randZ);
     
    scene.add(apple);
    apple.name = "apple";
    isThereAnApple = true;
}
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
})

let justAte = false;
const SEGMENT_SPACING = 1.0; // Each segment is 1 unit cube
let MOVE_SPEED;
const MIN_DISTANCE = 1.0; // Minimum distance between segments
const walls = scene.getObjectsByProperty("name", "wall");


function animate() {
    if(isMobile()){
        MOVE_SPEED = 0.15 + (score * 0.001);
    } else{
        MOVE_SPEED = 0.1 + (score * 0.001);
    }
    
    if(!isGameOver){
    requestAnimationFrame(animate);
    drawSnake();
    draw2d();
    scoreText.textContent = `Score: ${score}`;
     const headMeshes = scene.getObjectsByProperty("name", "snake");
    // Calculate new head position
    let newHead = {x: snake[0].x, z: snake[0].z};
    
    switch(direction) {
        case "forward":
            if(z > -9.5) {
                z -= MOVE_SPEED;
                newHead.z = z;
            }
            break;
        case "backward":
            if(z < 9.5) {
                z += MOVE_SPEED;
                newHead.z = z;
            }
            break;
        case "left":
            if(x > -9.5) {
                x -= MOVE_SPEED;
                newHead.x = x;
            }
            break;
        case "right":
            if(x < 9.5) {
                x += MOVE_SPEED;
                newHead.x = x;
            }
            break;
    }
    walls.forEach(wall => {
        if(new THREE.Box3().setFromObject(wall).intersectsBox(new THREE.Box3().setFromObject(headMeshes[0]))){
            isGameOver = true;
            causeOfDeath = "You ran into yourself";
            
        }
    })

    // Store previous positions before updating
    const positions = snake.map(segment => ({x: segment.x, z: segment.z}));
    
    // Add new head
    snake.unshift({...newHead});
    
    // Instead of directly copying positions, calculate proper spacing
    for(let i = 1; i < snake.length; i++) {
        const current = snake[i];
        const ahead = snake[i-1];
        
        // Calculate direction vector between segments
        const dx = ahead.x - current.x;
        const dz = ahead.z - current.z;
        
        // Calculate current distance between segments
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Only move segment if it's too far from the one ahead
        if (distance > MIN_DISTANCE) {
            // Calculate normalized direction
            const dirX = dx / distance;
            const dirZ = dz / distance;
            
            // Move segment towards the one ahead, maintaining exact unit distance
            current.x = ahead.x - dirX * MIN_DISTANCE;
            current.z = ahead.z - dirZ * MIN_DISTANCE;
        }
    }

  
    // Rest of your collision detection code remains the same
    const apple = scene.getObjectByName("apple");
    if(!isThereAnApple){
        spawnApple();
    } else if(apple){
        headMeshes.forEach((headMesh, index) => {
            if(headMesh && new THREE.Box3().setFromObject(headMesh).intersectsBox(new THREE.Box3().setFromObject(apple))){
                score++;
                isThereAnApple = false;
                scene.remove(apple);
                apple.geometry.dispose();
                apple.material.dispose();
                
                // Add 5 new segments at the tail position
                const lastSegment = snake[snake.length - 1];
                for(let i = 0; i < 5; i++) {
                    snake.push({...lastSegment});
                }
                
                justAte = true;
            }
           if(index > 1){
           if(new THREE.Box3().setFromObject(headMesh).containsBox(new THREE.Box3().setFromObject(headMeshes[0]))){

            causeOfDeath = "You ran into yourself";
            isGameOver = true;
           }
           if(index > 5){
           if(new THREE.Box3().setFromObject(headMesh).expandByScalar(.08).containsBox(new THREE.Box3().setFromObject(headMeshes[0]))){

            causeOfDeath = "You ran into yourself";
            isGameOver = true;
           }
        }
        }
            
        })
       
    }
    
    // Remove tail if didn't eat
    if(!justAte){
        snake.pop();
    } else {
        justAte = false;
    }
    
    
    renderer.render(scene, camera);
    controls.update();
        cameraAngle = THREE.MathUtils.lerp( cameraAngle, angle, 0.01 );
camera.position.setFromSphericalCoords( 2, 1, cameraAngle );
camera.position.add( headMeshes[0].position );
camera.lookAt( headMeshes[0].position );
    } else {
        cancelAnimationFrame(animate);
        console.log("gameOver");
        gameBox.innerHTML = `
    
     <p id="score"></p>

    <div id="gameOverMenu">
          <h1>${causeOfDeath}</h1>
          <p>Score: ${score}</p>
          <div id="btns">
      <button id="quitBtn">Quit</button>
      <button onclick="window.location.reload()">Restart</button>
    </div>
    
    `
        document.getElementById("quitBtn").addEventListener("click", qusit);
    }
}

if(!isGameOver){
    animate();
}
function qusit(){
    document.getElementById("gameOverMenu").style.animation = "trans2 1s linear 0s 1 forwards";
    document.body.style.animation = "toHome .5s linear .5s 1 forwards";
    setInterval(() => window.location.href = "./index.html", 1000);
    

}