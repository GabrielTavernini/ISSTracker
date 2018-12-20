
var finishedLoading = false;
var track = true;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera );
controls.enableKeys = false;
controls.addEventListener( 'start', () => {track = false;} );


var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor( 0xffffff, 0);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth - 20, window.innerHeight - 20 );
document.body.appendChild( renderer.domElement );


var lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

lights[ 0 ].position.set( 0, 200, 0 );
lights[ 1 ].position.set( 100, 200, 100 );
lights[ 2 ].position.set( - 100, - 200, - 100 );

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );

var geometry = new THREE.SphereGeometry(2, 64, 64);
//var material = new THREE.MeshPhongMaterial( { color: 0xf5deb3, side: THREE.DoubleSide, flatShading: true } );
var texture = new THREE.TextureLoader().load( "img/BlackMarble.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 1, 1 );
var material = new THREE.MeshBasicMaterial( { map: texture } );

var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

// var geometry = new THREE.SphereGeometry(0.25, 16, 16);
// var material = new THREE.MeshPhongMaterial( { color: 0xffff00, side: THREE.DoubleSide, flatShading: true } );
// var sun = new THREE.Mesh( geometry, material );
// scene.add( sun );






//3ds files dont store normal maps
var moon = new THREE.Object3D();
var loader = new THREE.TDSLoader( );
loader.load( 'model/isscombined.3ds', function ( object ) {
	object.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			if(child.name.substring(0,9) == "polySurfa"){
				child.scale.set(0.005, 0.005, 0.005);
				console.log(child.name);
				child.material = new THREE.MeshBasicMaterial( { color: 0xFFFFFF } );
				child.rotation.x = -0.5;
				child.rotation.y = -0.5;
				child.rotation.z = 0;
				moon.add(child.clone());
			}
			
		}
	} );

	scene.add( moon );
	finishedLoading = true;
	loadAndMove();
	controls.update();
	renderer.render( scene, camera );
} );
// var geometry = new THREE.SphereGeometry(0.05, 16, 16);
// var material = new THREE.MeshPhongMaterial( { color: 0xffffff, side: THREE.DoubleSide, flatShading: true } );
// var moon = new THREE.Mesh( geometry, material );
// scene.add( moon );

var rho = 2.128;
var phi = 0;
var theta = 0;


camera.position.z = 8;
var count = 100;
var angle = 0;



var calculateSunPosition = function(){	
	var date = new Date();
	var timestamp = new Date().setFullYear(date.getUTCFullYear(), 0, 1);
	var yearFirstDay = Math.floor(timestamp / 86400000);
	var today = Math.ceil((date.getTime()) / 86400000);
	var dayOfYear = today - yearFirstDay;
	let lat = 0;
	let lng = 0;

	//console.log(date.getTimezoneOffset());
	let y = (2*Math.PI/365)*(dayOfYear - 1 + (date.getUTCHours() -12)/24);
	let eqtime = 229.18*(0.000075+0.001868*Math.cos(y)-0.032077*Math.sin(y)-0.014615*Math.cos(2*y)-0.040849*Math.sin(2*y));
	let declin = 0.006918-0.399912*Math.cos(y)+0.070257*Math.sin(y)-0.006758*Math.cos(2*y)+0.000907*Math.sin(2*y)-0.002697*Math.cos(3*y)+0.00148*Math.sin(3*y);
	let time_offset = eqtime - 4*lng + 60*0;
	let tst = date.getUTCHours()*60 + date.getUTCMinutes() + time_offset;
	let ha = tst/4 - 180;
	let phi = Math.acos(Math.sin(lat)*Math.sin(declin)+Math.cos(lat)*Math.cos(declin)*Math.cos(ha));
	let theta = 180 - Math.acos(-(Math.sin(lat)*Math.cos(phi)-Math.sin(declin))/(Math.cos(lat)*Math.sin(phi)));
	let dir = Math.asin((-Math.sin(eqtime)*Math.cos(declin))/Math.sin((Math.sin(lat)*Math.sin(declin))+(Math.cos(lat)*Math.cos(declin)*Math.cos(eqtime))));
	
	console.log(dir);
	console.log(declin);
	return {phi, theta};
}




var loadAndMove = function(){
	fetch('http://api.open-notify.org/iss-now.json')
	.then(function(response) {
		return response.json();
	})
	.then(function(myJson) {
		phi = myJson.iss_position.latitude * Math.PI / 180; //° North
		theta = myJson.iss_position.longitude * Math.PI / -180;
		
		var x = Math.cos(phi) * Math.cos(theta) * rho;
		var z = Math.cos(phi) * Math.sin(theta) * rho;
		var y = Math.sin(phi) * rho;
		moon.position.x = x;
		moon.position.y = y;
		moon.position.z = z;
		
		// var dir = new THREE.Vector3();
		// dir.subVectors( new THREE.Vector3(x, y, z), new THREE.Vector3(0, 0, 0) ).normalize();
		if(track){
			camera.position.x = x * 2;
			camera.position.z = z * 2;
			camera.position.y = y * 2;
		}
		
		//controls.target = dir;
		
		console.log("P(Long): " + myJson.iss_position.longitude + " : " + phi + "\nT(Lat): " +  myJson.iss_position.latitude + " : " + theta);
		//var sunPos = calculateSunPosition();
		//console.log(sunPos);
		// var x = Math.cos(sunPos.phi* Math.PI / 180) * Math.cos(sunPos.theta* Math.PI / 180) * 2;
		// var z = Math.cos(sunPos.phi* Math.PI / 180) * Math.sin(sunPos.theta* Math.PI / 180) * 2;
		// var y = Math.sin(sunPos.phi* Math.PI / 180) * 2;
		// sun.position.x = x;
		// sun.position.y = y;
		// sun.position.z = z;
	});
}





var animate = function () {
	requestAnimationFrame( animate );
	
	if(count % 100 == 0 && finishedLoading){
		loadAndMove();
		count = 0;
	}	

	count += 1;
	angle += 0.01;
	controls.update();
	renderer.render( scene, camera );
};

animate();
//calculateSunPosition();


// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 50 );
// camera.position.z = 30;

// var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
// renderer.setClearColor( 0xffffff, 0);
// renderer.setPixelRatio( window.devicePixelRatio );
// renderer.setSize( window.innerWidth - 20, window.innerHeight - 20);
// document.body.appendChild( renderer.domElement );


// var lights = [];
// lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
// lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
// lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

// lights[ 0 ].position.set( 0, 200, 0 );
// lights[ 1 ].position.set( 100, 200, 100 );
// lights[ 2 ].position.set( - 100, - 200, - 100 );

// scene.add( lights[ 0 ] );
// scene.add( lights[ 1 ] );
// scene.add( lights[ 2 ] );

// var group = new THREE.Group();

// var geometry = new THREE.BufferGeometry();
// geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [], 3 ) );

// var lineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff, transparent: true, opacity: 0.5 } );
// var meshMaterial = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, side: THREE.DoubleSide, flatShading: true } );

// group.add( new THREE.LineSegments( geometry, lineMaterial ) );
// group.add( new THREE.Mesh( geometry, meshMaterial ) );

// scene.add( group );

// var prevFog = false;

// var render = function () {

// 	requestAnimationFrame( render );
// 	group.rotation.x += 0.005;
// 	group.rotation.y += 0.005;

// 	renderer.render( scene, camera );

// };

// window.addEventListener( 'resize', function () {

// 	camera.aspect = window.innerWidth / window.innerHeight;
// 	camera.updateProjectionMatrix();

// 	renderer.setSize( window.innerWidth, window.innerHeight );

// }, false );

// render();

