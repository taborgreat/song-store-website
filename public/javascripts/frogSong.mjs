import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";
import { TWEEN } from "https://unpkg.com/three@0.139.0/examples/jsm/libs/tween.module.min.js";

// Create a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

//window size
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(newWidth, newHeight);
  renderer2d.setSize(newWidth, newHeight);
});

const listener = new THREE.AudioListener();
camera.add( listener );

const sound = new THREE.Audio( listener );
console.log(songData)
const audioLoader = new THREE.AudioLoader();
audioLoader.load( songData.fileUrl, function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
});

const analyser = new THREE.AudioAnalyser( sound, 32 );



let frog;
let lilypad;
let reed;
let tongue;

let tongueShooting = false;

let isPlaying = false; //bool to see if in song view mode

//load 3d models
const loader = new GLTFLoader();

loader.load("/3dmodels/model/FROG2.glb", function (glb) {
  frog = glb.scene;

  //rotate frog 180 degrees
  frog.position.y = 0.2;
  frog.rotation.y = Math.PI;
  frog.scale.set(1.5, 1.5, 1.5);

  scene.add(frog);
});

loader.load("/3dmodels/model/LILYPAD.glb", function (glb) {
  lilypad = glb.scene;
  lilypad.position.y = 0.12;
  lilypad.rotation.y = 3.14;
  lilypad.scale.set(1.5, 1.5, 1.5);

  scene.add(lilypad);
});

loader.load("/3dmodels/model/REED_MAIN.glb", function (glb) {
  reed = glb.scene;
  reed.position.set(-9, -4, 5);
  reed.scale.set(1.25, 1.25, 1.25);

  scene.add(reed);
});

loader.load("/3dmodels/model/TONGUE.glb", function (glb) {
  tongue = glb.scene;
  tongue.position.set(0, 0.5, 0);
  tongue.scale.set(1.25, 1.25, 1.25);

  scene.add(tongue);
});

//load 2d models

const textureLoader = new THREE.TextureLoader();


const buttonPlayTexture = textureLoader.load(
  "/3dmodels/textures/UI_PlayButton.png"
);
buttonPlayTexture.magFilter = THREE.NearestFilter;
buttonPlayTexture.minFilter = THREE.NearestFilter;

const buttonPauseTexture = textureLoader.load(
  "/3dmodels/textures/UI_PauseButton.png"
);
buttonPauseTexture.magFilter = THREE.NearestFilter;
buttonPauseTexture.minFilter = THREE.NearestFilter;

const waterTextureMap = textureLoader.load(
  "/3dmodels/textures/ANIM_waveTop.png"
);



const mouthOpenTexture = textureLoader.load("/3dmodels/textures/FROG_T2.png");
const mouthCloseTexture = textureLoader.load("/3dmodels/textures/FROG_T.png");

mouthOpenTexture.magFilter = THREE.NearestFilter;
mouthOpenTexture.minFilter = THREE.NearestFilter;
mouthOpenTexture.colorSpace = THREE.SRGBColorSpace;

mouthCloseTexture.magFilter = THREE.NearestFilter;
mouthCloseTexture.minFilter = THREE.NearestFilter;
mouthCloseTexture.colorSpace = THREE.SRGBColorSpace;

// Create a material for the mouth opening image
const mouthOpenFrogMaterial = new THREE.MeshBasicMaterial({
  map: mouthOpenTexture,
});

// Create a material for the default frog appearance
const defaultFrogMaterial = new THREE.MeshBasicMaterial({
  map: mouthCloseTexture,
}); // Use your default settings

//water tiles stuff
let currentWaterTile = 0;
const waterTilesHorizontal = 8;
const waterTilesVertical = 4;

const waterOffsetX =
  (currentWaterTile % waterTilesHorizontal) / waterTilesHorizontal;
const waterOffsetY =
  (waterTilesVertical -
    Math.floor(currentWaterTile / waterTilesHorizontal) -
    1) /
  waterTilesVertical;
waterTextureMap.offset.x = waterOffsetX;
waterTextureMap.offset.y = waterOffsetY;

waterTextureMap.repeat.set(1 / waterTilesHorizontal, 1 / waterTilesVertical);
waterTextureMap.magFilter = THREE.NearestFilter;
waterTextureMap.minFilter = THREE.NearestFilter;

scene.background = new THREE.Color(0x4d2c3a);

//2d text
const renderer2d = new CSS2DRenderer();
renderer2d.setSize(window.innerWidth, window.innerHeight);
renderer2d.domElement.style.position = "absolute";
renderer2d.domElement.style.top = "0";
document.body.appendChild(renderer2d.domElement);

const textDiv = document.getElementById("song-info");
const label = new CSS2DObject(textDiv);
label.position.set(0, -10, 0.1); // Adjust the position as needed

scene.add(label);

//camera

camera.position.set(0, 2.5, 9);
camera.rotation.set(-0.1, 0, 0);

//tween animations

function smoothCameraPan(targetPosition, duration) {
  const initialPosition = camera.position.clone();

  const finalPosition = targetPosition.clone();

  const tween = new TWEEN.Tween(initialPosition)
    .to(finalPosition, duration)
    .onUpdate(function () {
      camera.position.copy(initialPosition);
    });

  tween.start();
}

function smoothButton(targetPosition, duration) {
  const initialPosition = button_songsMesh.position.clone();
  const finalPosition = targetPosition.clone();

  const tween = new TWEEN.Tween(initialPosition)
    .to(finalPosition, duration)
    .onUpdate(function () {
      button_songsMesh.position.copy(initialPosition);
    });

  tween.start();
}

function smoothTongueScale(targetScale, duration) {
  const initialScale = { value: tongue.scale.z }; // Use an object to store the initial scale
  const finalScale = { value: targetScale }; // Use an object to store the final scale

  const tween = new TWEEN.Tween(initialScale)
    .to(finalScale, duration)
    .onUpdate(() => {
      tongue.scale.z = initialScale.value;
    });

  tween.easing(TWEEN.Easing.Quadratic.Out);
  tween.start();
}



//add water
const waterGeometry = new THREE.PlaneGeometry(140, 30); // Adjust the dimensions as needed
const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x34746b });
const waterSurface = new THREE.Mesh(waterGeometry, waterMaterial);

waterSurface.position.set(0, -10, -20); // Adjust the position as needed
waterSurface.rotation.set(0, 0, 0);

scene.add(waterSurface);

const waterSpriteMaterial = new THREE.SpriteMaterial({ map: waterTextureMap });

// Add the sprites to the scene

for (let i = -70; i < 80; i += 5) {
  const waterSprite = new THREE.Sprite(waterSpriteMaterial);
  waterSprite.scale.set(5, 5, 5);
  waterSprite.position.set(i, 7, -20);
  scene.add(waterSprite);
}

// Create a raycaster to detect clicks
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

//buttons

const button_PlayMaterial = new THREE.MeshBasicMaterial({
  map: buttonPlayTexture,
  transparent: true,
});
const buttonGeometry = new THREE.PlaneGeometry(1, 1);

const button_PlayMesh = new THREE.Mesh(buttonGeometry, button_PlayMaterial);
button_PlayMesh.name = "playButton";

const button_PauseMaterial = new THREE.MeshBasicMaterial({
  map: buttonPauseTexture,
  transparent: true,
});





button_PlayMesh.position.set(0, -3, 0); // Set the position
scene.add(button_PlayMesh); // Add to the scene







document.addEventListener("mousemove", (event) => {
  // Calculate the mouse position in normalized device coordinates
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

  // Convert mouse position to a 3D position in the scene
  const frogCoords = new THREE.Vector3(-mouseX, -mouseY, -2); // 7 is the distance from the camera
  const lilyPadCoords = new THREE.Vector3(-mouseX, -mouseY, -20); // 7 is the distance from the camera

  // Make the frog look at the mouse
  if (!isPlaying && !tongueShooting) {
    lilypad.lookAt(lilyPadCoords);
    frog.lookAt(frogCoords);
  }
});

// Add a click event listener
window.addEventListener("click", onClick);

function onClick(event) {
  // Calculate the mouse coordinates based on the event
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const mousePosition = new THREE.Vector3(-mouse.x, -mouse.y, -2);
  let targetScale = -8;
  // Convert mouse coordinates to world coordinates


  // Set the frog position
  const frogPosition = frog.position;

  // Set the tongue position relative to the frog's center
  tongue.position.set(frogPosition.x, frogPosition.y + 0.4, frogPosition.z);

  // Make the tongue point towards the mouse position
  tongue.lookAt(mousePosition);
  if (!tongueShooting && !isPlaying) {
    smoothTongueScale(targetScale, 250);
    frog.scale.set(1.8 , 1.2, 1.8);
    tongueShooting = true;
      // Flip the tongue 180 degrees around the y-axis
  tongue.rotation.y -= Math.PI;
  frog.children.forEach((materials) => {
    materials.material = mouthOpenFrogMaterial; // Update with your texture or other properties
  });
    setTimeout(() => {
      tongueShooting = false;
      smoothTongueScale(0, 200);
      frog.children.forEach((materials) => {
        materials.material = defaultFrogMaterial;
        // Update with your texture or other properties
      });
      frog.scale.set(1.5, 1.5, 1.5);
    }, 280);
  }




 

  // Set the ray's origin and direction based on the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Find objects intersected by the ray
  var intersects = raycaster.intersectObjects(scene.children, true);

  // If there are intersections, the clickable object was clicked
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;


    if (clickedObject === button_PlayMesh) {
      if (!isPlaying) {
        button_PlayMesh.material= button_PauseMaterial;
        sound.play();

    } else {
      button_PlayMesh.material = button_PlayMaterial;
      sound.pause();
    }

    isPlaying = !isPlaying;
  }
}}

//lights
const light = new THREE.PointLight(0xffffff, 20, 100);
light.position.set(10, 10, 10);
scene.add(light);
const light2 = new THREE.AmbientLight(0x404040, 0.04); // soft white light
scene.add(light2);

smoothCameraPan(
  new THREE.Vector3(0, 2.5, 9), // Target position
  1000
);

function animate() {
  requestAnimationFrame(animate);

const data = analyser.getAverageFrequency();
console.log(data)

  TWEEN.update();

  if (isPlaying) {
    frog.lookAt(0, 0, -10);
    frog.scale.set(data/40+1.5,data/40+1.5,data/40+1.5)
    if(data > 100){
      const rotationAmount = data / 40;

    // Apply rotation based on the sound data
      frog.rotation.x += rotationAmount;
     frog.rotation.y += rotationAmount;
      frog.rotation.z += rotationAmount;
    }
  }

  // get the average frequency of the sound

  //animate water moving
  if (currentWaterTile < 32) {
    const waterOffsetX =
      (currentWaterTile % waterTilesHorizontal) / waterTilesHorizontal;
    const waterOffsetY =
      (waterTilesVertical -
        Math.floor(currentWaterTile / waterTilesHorizontal) -
        1) /
      waterTilesVertical;
    waterTextureMap.offset.x = waterOffsetX;
    waterTextureMap.offset.y = waterOffsetY;
    currentWaterTile += 1;
  } else {
    currentWaterTile = 0;
  }


  renderer.render(scene, camera);
  renderer2d.render(scene, camera);
}

// Start the animation
animate();
