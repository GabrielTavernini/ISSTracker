var calculateSunPosition = function(){	
	var date = new Date();
	var Year = date.getUTCFullYear();
	var Month = date.getUTCMonth() + 1;
	var Day = date.getUTCDate();
	var Hour = date.getUTCHours();
	var Minute = date.getUTCMinutes();
	var Second = date.getUTCSeconds();
  
	console.log(Hour, Minute, Second, Day, Month, Year);
	
	var JD = (367*Year) -Math.floor(7.0*(Year+Math.floor((Month+9.0)/12.0))/4.0)+Math.floor(275.0*Month/9.0)+Day+1721013.5+Hour/24.0+Minute/1440.0+Second/86400.0;
	d = JD - 2451543.5;
	var w = 282.9404 + (4.70935 * Math.pow(10, -5) * d);
    var a = 1.000000;
    var e = 0.016709 - (1.151 * Math.pow(10, -9) * d);
	var M = (356.0470 + 0.9856002585 * d) % 360;
	M >= 0 ? M = M : M = 360 + M;
	var oblecl = 23.4393 - (3.563 * Math.pow(10, -7) * d);
	var L = w + M;
	var E = M + (180/Math.PI) * e * Math.sin(M * Math.PI/180) * (1 + e * Math.cos(M * Math.PI/180));
	var x = Math.cos(E * Math.PI/180) - e;
	var y = Math.sin(E * Math.PI/180) * Math.sqrt(1 - e*e);
	var v = Math.atan2(y, x) * 180/Math.PI;
	var long = v + w;
	var x = Math.cos(long * Math.PI/180);
	var y = Math.sin(long * Math.PI/180);
	var z = 0;
	var xE = x;
	var yE = y*Math.cos(oblecl * Math.PI/180) +z*Math.sin(oblecl * Math.PI/180);
	var zE = y*Math.sin(oblecl * Math.PI/180) +z*Math.cos(oblecl * Math.PI/180);
	var RA = (Math.atan2(yE,xE) * 180/Math.PI)%360;   // OK
	var Decl = Math.atan2(zE,Math.sqrt(xE*xE + yE*yE)) * 180/Math.PI;  // trolig OK
	var GMST0 = (L+180);
	var UT = d-Math.floor(d);
	var SideRealTime = GMST0+UT*360+0;  // ok 
	var HourAngle = SideRealTime - RA;
	x=Math.cos(HourAngle*Math.PI/180) * Math.cos(Decl*Math.PI/180);
	y=Math.sin(HourAngle*Math.PI/180) * Math.cos(Decl*Math.PI/180);
	z=Math.sin(Decl*Math.PI/180);
	// 
	var EarthLat = Math.atan2(z,Math.sqrt(x*x +y*y)) * 180/Math.PI;
	var EarthLon = (0*180+RA-GMST0-UT*360) % 360;


	//Understandable stuff
	phi = EarthLat * Math.PI / 180; //° North
	theta = EarthLon * Math.PI / -180;
	rho = 5;
	
	var x = Math.cos(phi) * Math.cos(theta) * rho;
	var z = Math.cos(phi) * Math.sin(theta) * rho;
	var y = Math.sin(phi) * rho;

	// sun.position.x = x;
	// sun.position.y = y;
	// sun.position.z = z;

	lights[0].position.x = x * 20;
	lights[0].position.y = y * 20;
	lights[0].position.z = z * 20;

	lights[1].position.x = x * -20;
	lights[1].position.y = y * -20;
	lights[1].position.z = z * -20;
}




var loadAndMove = function(){
	if(!tleAcquired || !finishedLoading)
		return;

	var positionEci = satellite.propagate(satrec, new Date()).position;
	// var velocity = satellite.propagate(satrec, new Date()).velocity
	// var magnitude = Math.sqrt(Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2) + Math.pow(velocity.z, 2));
	// document.getElementsByClassName("speed")[0].innerHTML = magnitude.toPrecision(5) + "km/s";
	// console.log(magnitude);
	var gmst = satellite.gstime(new Date());

	var positionGd    = satellite.eciToGeodetic(positionEci, gmst);
	var longitude = positionGd.longitude;
	var latitude  = positionGd.latitude;
	var height    = positionGd.height;
	
	phi = latitude;// * Math.PI / 180; //° North
	theta = -longitude;// * Math.PI / -180;
	rho = 2.18;
	
	var x = Math.cos(phi) * Math.cos(theta) * rho;
	var z = Math.cos(phi) * Math.sin(theta) * rho;
	var y = Math.sin(phi) * rho;

	moon.position.x = x;
	moon.position.y = y;
	moon.position.z = z;

	moon.rotation.z = latitude;
	moon.rotation.y = longitude;

	if(track){
		camera.position.x = x * 2;
		camera.position.z = z * 2;
		camera.position.y = y * 2;
	}
	
	//console.log(myJson.iss_position.latitude * Math.PI / 180,  myJson.iss_position.longitude * Math.PI / -180);
	console.log(phi, theta)
	//console.log("P(Long): " + myJson.iss_position.longitude + " : " + phi + "\nT(Lat): " +  myJson.iss_position.latitude + " : " + theta);
}



window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize(){
	camera.aspect = (window.innerWidth - 20 )/ (window.innerHeight - 20);
	camera.updateProjectionMatrix();
	
    renderer.setSize( window.innerWidth - 20, window.innerHeight - 20);
}


var animate = function () {
	requestAnimationFrame( animate );
	
	if(count % 50 == 0 && finishedLoading){
		loadAndMove();
		sun ? calculateSunPosition() : null;
		count = 0;
	}	

	count += 1;
	angle += 0.01;
	controls.update();
	renderer.render( scene, camera );
};








// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // //      Variables &     // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // //     Initialization   // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // 







var finishedLoading = false;
var tleAcquired = false;
var track = true;
var sun = false;


// Initialize a satellite record
var satrec;
fetch('https://cors.io/?https://spaceflight.nasa.gov/realdata/sightings/SSapplications/Post/JavaSSOP/orbit/ISS/SVPOST.html', {mode: "cors"})
.then(function(response) {
	return response.text();	
})
.then(function(data) {
	//console.log(data);
	data = data.split("TWO LINE MEAN ELEMENT SET")[1];
	console.log(data.substring(8, 11));
	console.log(data.substring(16, 85));
	console.log(data.substring(90, 160));

	var tleLine1 = data.substring(16, 85);
	var tleLine2 = data.substring(90, 160);
	
	satrec = satellite.twoline2satrec(tleLine1, tleLine2);
	tleAcquired = true;
});

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, (window.innerWidth - 20)/(window.innerHeight - 20), 0.1, 1000 );
var controls = new THREE.OrbitControls( camera );
controls.enableKeys = false;
controls.noPan = true;
controls.addEventListener( 'start', () => {track = false;} );
//controls.enableDamping = true;


var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setClearColor( 0xffffff, 0);
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth - 20, window.innerHeight - 20 );
document.body.appendChild( renderer.domElement );

var lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 1.1, 0 );
lights[ 1 ] = new THREE.PointLight( 0xf0f0f0, 0.1, 0 );

//Position lights
calculateSunPosition();

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );


var geometry = new THREE.SphereGeometry(2, 64, 64);
//var material = new THREE.MeshPhongMaterial( { color: 0xf5deb3, side: THREE.DoubleSide, flatShading: true } );
var dayTexture = new THREE.TextureLoader().load( "img/mapday.jpg" );
dayTexture.wrapS = THREE.RepeatWrapping;
dayTexture.wrapT = THREE.RepeatWrapping;
dayTexture.repeat.set( 1, 1 );

var noDayTexture = new THREE.TextureLoader().load( "img/BlackMarble.jpg" );
noDayTexture.wrapS = THREE.RepeatWrapping;
noDayTexture.wrapT = THREE.RepeatWrapping;
noDayTexture.repeat.set( 1, 1 );


var material;
var dayMaterial = new THREE.MeshLambertMaterial( { map: dayTexture } );
var noDayMaterial = new THREE.MeshBasicMaterial( { map: noDayTexture } );

sun ? material = dayMaterial : material = noDayMaterial;
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
				child.material = new THREE.MeshBasicMaterial( { color: 0xbcbcbc } );
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

var rho, phi, theta;


camera.position.z = 8;
var count = 100;
var angle = 0;
animate();