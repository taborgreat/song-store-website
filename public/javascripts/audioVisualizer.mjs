import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// Create a scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer();

let frog;
let lilypad;
let materialFrog = new THREE.MeshStandardMaterial({ color: 0xff0000,  opacity:0.7, });

const loader = new GLTFLoader();

loader.load(
	'/3dmodels/model/FROG2.glb',
	function(glb)
	{
		frog = glb.scene;
    frog.scale.set(10, 10, 10);
	
		frog.traverse((child) => {
			if (child.isMesh) {
				// Check if the child is a mesh (has a material)
				child.material = materialFrog;
				
			}
		});
		
		scene.add(frog);
	}
)
/*
loader.load(
	'/3dmodels/model/LILYPAD.glb',
	function(glb)
	{
		lilypad = glb.scene;
		lilypad.scale.set(10,10,10)
		
		scene.add(lilypad);
	}
)
*/

// Create a raycaster to detect clicks
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

// Add a click event listener
window.addEventListener('click', onClick);

function onClick(event) {
  // Calculate the mouse coordinates based on the event
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set the ray's origin and direction based on the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Find objects intersected by the ray
  var intersects = raycaster.intersectObjects(scene.children, true);

  // If there are intersections, the clickable object was clicked
  if (intersects.length > 0) {
    console.log(intersects)
  }
}


renderer.setSize(window.innerWidth/2, window.innerHeight/2);
document.body.appendChild(renderer.domElement);



const light = new THREE.PointLight( 0xffffff, 20, 100 );
light.position.set( 30, 30, 30 );
scene.add(light);
const light2 = new THREE.AmbientLight( 0x404040, 0.04 ); // soft white light
scene.add( light2 );



// Create an AudioContext and Analyser
const audioListener = new THREE.AudioListener();
camera.add(audioListener);

// Create an Audio source and connect it to the AudioContext
const audioLoader = new THREE.AudioLoader();
const audioSource = new THREE.Audio(audioListener);
audioListener.add(audioSource);


const playButton = document.getElementById('playButton');

playButton.addEventListener('click', () => {
audioLoader.load(songData.fileUrl, function (buffer) {
  audioSource.setBuffer(buffer);
  audioSource.setLoop(true);
  audioSource.setVolume(1); // Adjust the volume as needed
  audioSource.play();
})});
// Create an AudioAnalyser
const analyser = new THREE.AudioAnalyser(audioSource, 32);



const stars = [];

function addStar (){
	const geometry=new THREE.SphereGeometry(0.5,25,25);
	const material = new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xffffff})
	const star = new THREE.Mesh(geometry,material);

	const [x,y,z] = Array(3).fill().map(()=>THREE.MathUtils.randFloatSpread(150))
	star.position.set(x,y,z);
	const orbitSpeed = (Math.random() * (0.01 - 0.001) + 0.0004);

	stars.push({ star, orbitSpeed });
	scene.add(star);
}

Array(200).fill().forEach(addStar);

// Animation function
function animate() {
  requestAnimationFrame(animate);

  // Get the average frequency
const averageFrequency = analyser.getAverageFrequency();
  const getFrequencyData = analyser.getFrequencyData();

  stars.forEach(({ star, orbitSpeed }) => {
	const currSpeed = orbitSpeed/6 ;
    const angle = Date.now() * currSpeed;
    const radius = 85; // Adjust this to control the orbit radius
    star.position.x = radius * Math.cos(angle);
    star.position.y = radius * Math.sin(angle);
	star.scale.set(1+orbitSpeed/3, 1+orbitSpeed/3,1+orbitSpeed/3)
  });

  frog.rotation.x -= (0.1 * averageFrequency) / 150;
  frog.rotation.z -= averageFrequency / 100000;
  /*
  lilypad.rotation.x -= (0.1 * averageFrequency) / 150;
  lilypad.rotation.z -= averageFrequency / 100000;
  */
  
  
  frog.scale.set(1 + getFrequencyData[0] / 15, 1 + getFrequencyData[1] / 15, 1 + getFrequencyData[2] / 15);
  materialFrog.color.set(
	getFrequencyData[4],
    (frog.scale.y)/1.5,
	100 - averageFrequency
  )
  

  /*

  

  // Modify the sphere's vertices and color based on the audio data
  sphere.scale.set(1 + averageFrequency / 1000, 1 + averageFrequency / 200, 1 + averageFrequency / 200);
  sphere.rotation.x += averageFrequency / 1000;
  sphere.rotation.y += averageFrequency / 1000;
  sphere.castShadow;
 

  */

  renderer.render(scene, camera);
}

// Camera setup
camera.position.z = 60;

// Start the animation
animate();