import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

const light = new THREE.AmbientLight( 0x404040 ); 
scene.add( light );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.castShadow = true;
scene.add( directionalLight );


const cube = createCube(1, 1, 1);
const cylinder = createCylinder();
const plane = createPlane(10, 10);
const torus = createTorus(1);
const torus1 = createTorus(1);

plane.position.y = -2;
plane.rotation.x = 3.14/2;

cube.position.x = -2; 
torus.position.x = 2; 
torus1.position.x = 3; 
plane.receiveShadow = true;

scene.add(cube);
scene.add(torus);
scene.add(torus1);
scene.add(cylinder );
scene.add( plane );

camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 3;


// const light = new THREE.PointLight( 0xff0000, 1, 100 );
// light.position.set( 0, 5, 5);
// scene.add(light);

function createCube(w, h, d) {
    const geometry = new THREE.BoxGeometry( w, h, d );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    return cube; 
}

function createPlane(w, h) {
    const geometry = new THREE.PlaneGeometry( w, h );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ffff, side: THREE.DoubleSide} );
    const plane = new THREE.Mesh( geometry, material );
    return plane;
}

function createCylinder() {
    const geometry = new THREE.CylinderGeometry( 1, 1, 1, 100); 
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} ); 
    const cylinder = new THREE.Mesh( geometry, material );
    return cylinder; 
}

function createTorus(r) {
    const geometry = new THREE.TorusGeometry(r, .4, 100, 100); 
    const material = new THREE.MeshBasicMaterial( { color: 0xdddddd } ); 
    const torus = new THREE.Mesh( geometry, material ); 
    return torus; 
}


let t = 0; 


function animate() {
	requestAnimationFrame( animate );

	cube.rotation.y += 0.01;
	cube.scale.x += Math.sin(t)/2;

	cylinder.rotation.x += 0.01;
	torus.rotation.x += 0.01;
	torus.rotation.y += 0.01;

    torus.position.x += Math.cos(t)/2;
    torus.position.y += Math.sin(t^2)/2;

	torus1.rotation.x += 0.01;
	torus1.rotation.y += 0.01;

    torus1.position.x += Math.sin(t)/2;
    torus1.position.y += Math.cos(t^2)/2;

    camera.position.set(Math.sin(t/2)*5, Math.abs(Math.sin(t/5))*10, Math.cos(t/2)*5);  //
    //camera.up.set(0, Math.cos(t/2), 0);

    camera.up.set(0, Math.sin(t/5) + 1, 0);
    camera.lookAt(0, 0, Math.sin(t/2));

	renderer.render( scene, camera );
    t+=.1;
}

animate();
