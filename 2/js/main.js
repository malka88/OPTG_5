var camera;

var planets = []; 
var planetsName = [];
var planetsInfo = [];
var moon;
var loader = new THREE.TextureLoader();
var clock = new THREE.Clock();
var earthCloud = createEarthCloud();
var al =  0.0;
var keyboard = new THREEx.KeyboardState();


function crPlanet(texPath, bumpPath, size, x, v1)
{
    var geometry = new THREE.SphereGeometry( size, 32, 32 );
    var tex = loader.load( texPath );
    var bump = loader.load( bumpPath);
    tex.minFilter = THREE.NearestFilter;
    var material = new THREE.MeshPhongMaterial({
        map: tex,
        bumpMap: bump,
        bumpScale: 0.05,
        side: THREE.DoubleSide
    });
    //создание объекта
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(x, 0, 0);
    //размещение объекта в сцене
    scene.add( sphere );

    var planet = {}; //создание
    planet.planet = sphere; //добавление поля planet
    planet.x = x;
    planet.v1 = v1;
    planet.a1 = 0.0;
    planet.r = size;

    planets.push(planet)
}

function crStars(texPath, size)
{
    //создание геометрии сферы
    var geometry = new THREE.SphereGeometry( size, 32, 32 );
    //загрузка текстуры
    var tex = loader.load(texPath);
    tex.minFilter = THREE.NearestFilter;
    //создание материала
    var material = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide
    });
    //создание объекта
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(0, 0, 0);
    //размещение объекта в сцене
    scene.add( sphere );
}

function crMoon(texPath, bumpPath, size, v1)
{
    var geometry = new THREE.SphereGeometry( size, 32, 32 );
    //загрузка текстуры
    var tex = loader.load(texPath);
    var bump = loader.load( bumpPath);
    tex.minFilter = THREE.NearestFilter;
    //создание материала
    var material = new THREE.MeshBasicMaterial({
        map: tex,
        bumpMap: bump,
        bumpScale: 0.05,
        side: THREE.DoubleSide
    });
    //создание объекта
    var sphere = new THREE.Mesh( geometry, material );
    //размещение объекта в сцене
    scene.add( sphere );

    var planet = {}; //создание
    planet.planet = sphere; //добавление поля planet
    planet.r = 6;
    planet.v1 = v1;
    planet.a1 = 0.0;

    moon = planet;
}

function init()
{
    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    

    camera.position.set(0, 180, 0);

    camera.lookAt(new THREE.Vector3( 0, 0.0, 0));


    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(  0x000000ff, 1);
    container.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize, false );

    var light = new THREE.PointLight( 0xffffff );
    light.position.set( 0, 150, 0 );
    scene.add( light );

    var light = new THREE.AmbientLight( 0x202020 ); // soft white light
    scene.add( light );

    crStars("Planets/sunmap.jpg", 10);
    crStars("Planets/starmap.jpg", 500);

    crPlanet( "Planets/mercurymap.jpg", "Planets/mercury/mercurybump.jpg", 2, 20, 2);
    crPlanet( "Planets/venusmap.jpg", "Planets/venus/venusbump.jpg", 3, 30, 1.5);
    crPlanet( "Planets/earthmap1k.jpg", "Planets/earth/earthbump1k.jpg", 4, 40, 1.1);
    crPlanet( "Planets/marsmap1k.jpg", "Planets/mars/marsbump1k.jpg", 3.5, 55, 1.3);
    crMoon( "Planets/earth/moon/moonmap1k.jpg", "Planets/earth/moon/moonbump1k.jpg", 1.5, 1.2 )
   
    line();
}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function render() 
{
    renderer.render( scene, camera ); 
}

function animate()
{
    var delta = clock.getDelta();

    for(var i = 0; i < planets.length; i++)
    {

        var m = new THREE.Matrix4();
        var m1 = new THREE.Matrix4();
        var m2 = new THREE.Matrix4();
        planets[i].a1 += planets[i].v1 * delta;

        //создание матрицы поворота (вокруг оси Y) в m1 и матрицы перемещения в m2
        m1.makeRotationY( planets[i].a1 );
        m2.setPosition(new THREE.Vector3(planets[i].x, 0, 0));

        //запись результата перемножения m1 и m2 в m
        m.multiplyMatrices( m1, m2 );
       
       
        m.multiplyMatrices( m, m1 );
        //установка m в качестве матрицы преобразований объекта object
        planets[i].planet.matrix = m;
        planets[i].planet.matrixAutoUpdate = false;
    }

    var mM = new THREE.Matrix4();
    var mM1 = new THREE.Matrix4();
    var mM2 = new THREE.Matrix4();
    var mM3 = new THREE.Matrix4();
    var mM4 = new THREE.Matrix4();
    moon.a1 += moon.v1 * delta;

    //создание матрицы поворота (вокруг оси Y) в m1 и матрицы перемещения в m2
    mM1.makeRotationY( planets[2].a1 );
    mM2.setPosition(new THREE.Vector3(planets[2].x, 0, 0)); 
    mM3.makeRotationY( moon.a1 );
    mM4.setPosition(new THREE.Vector3(moon.r, 0, 0));

    //запись результата перемножения m1 и m2 в m
    mM.multiplyMatrices( mM1, mM2 );  
    mM.multiplyMatrices( mM, mM3 );
    mM.multiplyMatrices( mM, mM4 );
    //установка m в качестве матрицы преобразований объекта object
    moon.planet.matrix = mM;
    moon.planet.matrixAutoUpdate = false; 

    if(keyboard.pressed("0"))
    {

        //получение матрицы позиции из матрицы объекта
        var m = new THREE.Matrix4();
        m.copyPosition(planets[0].planet.matrix);
        //получение позиции из матрицы позиции
        var pos = new THREE.Vector3(0, 0, 0);
        pos.setFromMatrixPosition(m);

        var x = pos.x + planets[0].r * 4 * Math.cos(al);
        var z = pos.z + planets[0].r * 4 * Math.sin(al);

        camera.position.set(x, 0, z);
        camera.lookAt(pos);

        for(var i = 0; i < keys.length; i++)
            keys[i] = false;
    }

    if(keyboard.pressed("1"))
    {

        //получение матрицы позиции из матрицы объекта
        var m = new THREE.Matrix4();
        m.copyPosition(planets[1].planet.matrix);
        //получение позиции из матрицы позиции
        var pos = new THREE.Vector3(0, 0, 0);
        pos.setFromMatrixPosition(m);

        var x = pos.x + planets[1].r * 4 * Math.cos(al);
        var z = pos.z + planets[1].r * 4 * Math.sin(al);

        camera.position.set(x, 0, z);
        camera.lookAt(pos);
    }

    if(keyboard.pressed("2"))
    {

        //получение матрицы позиции из матрицы объекта
        var m = new THREE.Matrix4();
        m.copyPosition(planets[2].planet.matrix);
        //получение позиции из матрицы позиции
        var pos = new THREE.Vector3(0, 0, 0);
        pos.setFromMatrixPosition(m);

        var x = pos.x + planets[2].r * 4 * Math.cos(al);
        var z = pos.z + planets[2].r * 4 * Math.sin(al);

        camera.position.set(x, 0, z);
        camera.lookAt(pos);
    }

    if(keyboard.pressed("3"))
    {

        //получение матрицы позиции из матрицы объекта
        var m = new THREE.Matrix4();
        m.copyPosition(planets[3].planet.matrix);
        //получение позиции из матрицы позиции
        var pos = new THREE.Vector3(0, 0, 0);
        pos.setFromMatrixPosition(m);

        var x = pos.x + planets[3].r * 4 * Math.cos(al);
        var z = pos.z + planets[3].r * 4 * Math.sin(al);

        camera.position.set(x, 0, z);
        camera.lookAt(pos);
    }

    requestAnimationFrame( animate ); 
    render();
    
}

function line()
{
    for(var j = 0; j < planets.length; j++) {
        var lineGeometry = new THREE.Geometry(); 
        var vertArray = lineGeometry.vertices; 
        
        for (var i = 0; i < 360; i++)
        {
            var x = planets[j].x*Math.cos(i * Math.PI/180.0);
            var z = planets[j].x*Math.sin(i * Math.PI/180.0);
            vertArray.push(new THREE.Vector3(x, 0, z)); 
        }
        var lineMaterial = new THREE.LineDashedMaterial( { color: 0xFFFFFF, dashSize: 1, gapSize: 1 } );        
        var line = new THREE.Line( lineGeometry, lineMaterial );
        line.computeLineDistances();
        scene.add(line)
    }
}

function createEarthCloud()
{
    // create destination canvas
    var canvasResult = document.createElement('canvas');
    canvasResult.width = 1024;
    canvasResult.height = 512;
    var contextResult = canvasResult.getContext('2d');
    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener("load", function()
    {
        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement('canvas');
        canvasMap.width = imageMap.width;
        canvasMap.height = imageMap.height;
        var contextMap = canvasMap.getContext('2d');
        contextMap.drawImage(imageMap, 0, 0);
        var dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height);
        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener("load", function()
        {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement('canvas');
            canvasTrans.width = imageTrans.width;
            canvasTrans.height = imageTrans.height;
            var contextTrans = canvasTrans.getContext('2d');
            contextTrans.drawImage(imageTrans, 0, 0);
            var dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width,
            canvasTrans.height);
            // merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData(canvasMap.width, canvasMap.height);
            for(var y = 0, offset = 0; y < imageMap.height; y++)
            for(var x = 0; x < imageMap.width; x++, offset += 4)
            {
                dataResult.data[offset+0] = dataMap.data[offset+0];
                dataResult.data[offset+1] = dataMap.data[offset+1];
                dataResult.data[offset+2] = dataMap.data[offset+2];
                dataResult.data[offset+3] = 255-dataTrans.data[offset+0];
            }
            // update texture with result
            contextResult.putImageData(dataResult,0,0)
            material.map.needsUpdate = true;
        });

        imageTrans.src = 'Planets/earth/earthcloudmaptrans.jpg';
    }, false);

    imageMap.src = 'Planets/earth/earthcloudmap.jpg';
    var geometry = new THREE.SphereGeometry(0.51, 32, 32);
    var material = new THREE.MeshPhongMaterial({
    map: new THREE.Texture(canvasResult),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
    });

    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}


init();
animate();