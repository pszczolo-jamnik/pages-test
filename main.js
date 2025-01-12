
import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = true;
controls.minDistance = 0.1;
controls.maxDistance = 50;

// Handle file input
const fileInput = document.getElementById('fileInput');
const loader = new PLYLoader();

let currentPoints = null;

// fileInput.addEventListener('change', function(event) {
//     const file = event.target.files[0];
//     const reader = new FileReader();

    // reader.onload = function(event) {
loader.load(
    // URL.createObjectURL(file),
    'kdtree_a_2.ply',
    function(geometry) {
        // Remove previous points if they exist
        if (currentPoints) {
            scene.remove(currentPoints);
        }

        // Create points material
        const material = new THREE.PointsMaterial( { color: 0xD0D0D0, size: 0.0003, sizeAttenuation: true } );

        // Create points
        currentPoints = new THREE.Points(geometry, material);

        // Center the geometry
        geometry.computeBoundingBox();
        const center = geometry.boundingBox.getCenter(new THREE.Vector3());
        currentPoints.position.sub(center);

        // Auto-adjust camera distance based on bounding box
        const box = geometry.boundingBox;
        const maxDim = Math.max(
            box.max.x - box.min.x,
            box.max.y - box.min.y,
            box.max.z - box.min.z
        );
        camera.position.z = maxDim * 0.9;
        // controls.target.copy(currentPoints.position);
        // controls.target.copy(center);
        controls.target.set(0, 0, 0);
        controls.update();

        scene.add(currentPoints);
    },
    function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error) {
        console.error('Error loading PLY file:', error);
    }
);
    // };

    // reader.readAsArrayBuffer(file);
// });

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Required for damping
    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();