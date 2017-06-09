window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.FEScene = function FEScene(container, CustomShaders) {

    var self = this;
    self.TerminUtils = null;
    self.spaceBall = new TERMINALIA.Trackball();
    self.renderer = null;
    self.camera = null;
    self.cameraOrtho = null;
    self.orbit_controls = null;
    self.scene = null;
    self.sceneOrtho = null;
    self.stats = null;
    self.container = null;
    self.reflectionMap = null;
    self.pinsGroup = null;
    self.glarePlaneSize = 312;
    self.customShaders = CustomShaders;
    self.cameraAnimation = null;
    self.worldAnimation = null;
    self.world = null;
    self.circuitPivot = null;
    self.stageAnimation = new TimelineMax({repeat: 0, paused: true});
    self.worldSize = 6000;
    self.currentState = 'StageStart';
    self.animationCreated = false;
    self.pinScaleFactor = 0.3;
	self.test_pin = null;

    init(container)

    //CONSTRUCTOR
    function init(container) {
        self.container = container;
        self.renderer = new THREE.WebGLRenderer({ antialias: true });
        self.renderer.setClearColor(new THREE.Color(0x0555fa))
        self.renderer.setPixelRatio(window.devicePixelRatio);
        self.renderer.autoClear = true;
        self.renderer.setSize(self.container.offsetWidth, self.container.offsetHeight);
        self.container.appendChild(self.renderer.domElement);
        self.TerminUtils =  new TERMINALIA.TerminUtils();

        self.spaceBall.enabled = false;

        self.container.addEventListener('mousedown', function(event) {
            if (event.button === 0) {
                self.spaceBall.onMouseDown(event.clientX, event.clientY);
            }
        }, false);
        self.container.addEventListener('mouseup', function(event) {
            self.spaceBall.onMouseUp();
        }, false);
        self.container.addEventListener('mousemove', function(event) {
            self.spaceBall.onMouseMove(event.clientX, event.clientY);
        }, false);
        self.container.addEventListener('touchstart', function(event) {
            self.spaceBall.onMouseDown(event.touches[0].clientX, event.touches[0].clientY);
        }, false);
        self.container.addEventListener('touchend', function(event) {
            self.spaceBall.onMouseUp();
        }, false);
        self.container.addEventListener('touchmove', function(event) {
            self.spaceBall.onMouseMove(event.touches[0].clientX, event.touches[0].clientY);
        }, false);

        initScene();
    }

    //INIT THE SCENE
    function initScene() {
        self.scene = new THREE.Scene();
        self.sceneOrtho = new THREE.Scene();
        self.pinsGroup = new THREE.Group();
        initOrbitCamera();
        //initOrthoCamera();
        addCubeMap('../libs/terminalia/assets/textures/cubemaps/parliament2/', '.jpg');
        addAssets();
        addPins();
        ///addOrthoAssets();
        //addInfoFlags();
        addHUD();

    }

    //###########################################################################################################
    // CAMERAS
    //###########################################################################################################

    //Init borbit camera
    function initOrbitCamera() {
        self.camera = new THREE.PerspectiveCamera( 40, self.container.offsetWidth/self.container.offsetHeight, 0.1, 50000 );
        self.camera.position.set(3.70, 1.85, 5.55);
        self.camera.updateProjectionMatrix();
        self.orbit_controls = new THREE.OrbitControls(self.camera, self.renderer.domElement);
        self.orbit_controls.maxPolarAngle = Math.PI/2 - 0.1;
        self.orbit_controls.enableZoom = true;
        self.orbit_controls.target.set(0, 0, 0);
    }

    //Init ortho camera
    function initOrthoCamera() {
        var width = self.container.offsetWidth;
        var height = self.container.offsetHeight;
        self.cameraOrtho = new THREE.OrthographicCamera( - width / 2, width / 2, height / 2, - height / 2, 1, 10 );
        self.cameraOrtho.position.z = 10;
    }

    //Render routine
    function render() {
        /*
        self.renderer.clear();
        self.renderer.render(self.scene, self.camera);
        self.renderer.clearDepth();
        self.renderer.render(self.sceneOrtho, self.cameraOrtho);
        */

        if (self.currentState === 'StageFinal') {
            self.orbit_controls.enabled = false;
            self.spaceBall.enabled = true;
        }
        else {
            self.orbit_controls.enabled = true;
            self.spaceBall.enabled = false;
        }

        self.renderer.render(self.scene, self.camera);
        requestAnimationFrame(render);
        self.stats.update();
    }

    //###########################################################################################################
    // EVENTS
    //###########################################################################################################

    //Called when container is resized
    function resize() {
        var winHeight = window.innerHeight
        var footer = document.getElementsByTagName('footer')
        var footHeight = 0
        if (footer.length > 0) {
            footHeight = footer[0].offsetHeight
        }
        var newHeight = winHeight-footHeight
        self.camera.aspect = self.container.offsetWidth/newHeight;
        self.camera.updateProjectionMatrix();
        /*
        self.cameraOrtho.left = - self.container.offsetWidth / 2;
        self.cameraOrtho.right = self.container.offsetWidth / 2;
        self.cameraOrtho.top = self.container.offsetHeight / 2;
        self.cameraOrtho.bottom = - self.container.offsetHeight / 2;
        self.cameraOrtho.updateProjectionMatrix();
        updateOrthoAssetsSize();
        */
        self.renderer.setSize(self.container.offsetWidth, newHeight);
    }

    //Find object using raycaster when user click/tap on an object
    function findObjectOnClick(event) {
        event.preventDefault();
        var vector = new THREE.Vector3( ( event.clientX / container.offsetWidth ) * 2 - 1, - ( event.clientY / container.offsetHeight ) * 2 + 1, 0.5 );
        vector.unproject(self.camera);
        var raycaster = new THREE.Raycaster(self.camera.position,vector.sub(self.camera.position).normalize());
        var intersected = raycaster.intersectObjects(self.pinsGroup.children);

        var pinName = null
        if (intersected.length > 0) {
            for (var i=0; i<self.pinsGroup.children.length; i++) {
                if (intersected[0].object.name === self.pinsGroup.children[i].name) {
                    console.log(intersected[0].object.name, self.pinsGroup.children[i].name, i)
                    pinName = intersected[0].object.name;
                    switch (i) {
                        case 0:
                            startCameraAnimation([-5.01, 1.12, -4.63], 2);
                        break;

                        case 1:
                            startCameraAnimation([-3.19, 2.20, -5.73], 2);
                        break;

                        case 2:
                            startCameraAnimation([0.97, 4.74, 6.46], 2);
                        break;

                        case 3:
                            startCameraAnimation([5.98, 2.32, 2.59], 2);
                        break;
                    }
                    break;
                }
            }
        }
        return pinName
    }

    //###########################################################################################################
    // LIGTHS & ENVIRONMENT
    //###########################################################################################################

    //Add reflection cubemap
    function addCubeMap(path, format) {
        self.reflectionMap = self.TerminUtils.createCubeMapTexture(path, format);
        self.reflectionMap.format = THREE.RGBFormat;
    }

    //###########################################################################################################
    // ASSETS
    //###########################################################################################################

    function addAssets() {
        //addCar();
        addFECar();
        addCircuit(self.worldSize - 1, 0);
        addWorld(self.worldSize);
    }

    function addFECar() {
        //Car Group
        var carGroup = new THREE.Group();

        //Body
        var bodyMat = self.TerminUtils.createTextureReflectiveMaterial('../libs/terminalia/assets/textures/fe_car/Body_2048.jpg', self.reflectionMap, .5);
        var body = self.TerminUtils.loadObjModel("Body", '../libs/terminalia/assets/models/obj/fe_car/Body2.obj', bodyMat);
        carGroup.add(body);

        //Body Bottom
        var bodyBottomMat = new THREE.MeshLambertMaterial( { color: 0x2c2c2d, envMap: self.reflectionMap, combine: THREE.MixOperation, reflectivity: .3} );
        bodyBottomMat.side = THREE.DoubleSide;
        var bodyBottom = self.TerminUtils.loadObjModel("BodyBottom", '../libs/terminalia/assets/models/obj/fe_car/BodyBottom.obj', bodyBottomMat);
        carGroup.add(bodyBottom);

        //Front Wheels
        var frontWheelsMat = self.TerminUtils.createTextureMaterial('../libs/terminalia/assets/textures/fe_car/FrontWheels.jpg');
        var frontWheels = self.TerminUtils.loadObjModel("FrontWheels", '../libs/terminalia/assets/models/obj/fe_car/FrontWheels.obj', frontWheelsMat);
        carGroup.add(frontWheels);

        //Inside Wheels
        var insideWheelsColorMap = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/FrontWheels.jpg');
        var insideWheelsBumpMap = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/FrontWheelsBump.png');
        var insideWheelsMat = new THREE.MeshPhongMaterial({
            map: insideWheelsColorMap,
            bumpMap: insideWheelsBumpMap
        });
        var insideWheels = self.TerminUtils.loadObjModel("FrontWheels", '../libs/terminalia/assets/models/obj/fe_car/InsideWheels.obj', insideWheelsMat);
        carGroup.add(insideWheels);

        //Tires
        var tiresMat = new THREE.MeshLambertMaterial( { color: 0xe3f4f4, envMap: self.reflectionMap, combine: THREE.MixOperation, reflectivity: .7} );
        var frontTires = self.TerminUtils.loadObjModel("Tires", '../libs/terminalia/assets/models/obj/fe_car/Tires.obj', tiresMat);
        carGroup.add(frontTires);

        //BackTires
        var backTiresMat = new THREE.MeshLambertMaterial( { color: 0x000000, side: THREE.DoubleSide} );
        var backTires = self.TerminUtils.loadObjModel("Tires", '../libs/terminalia/assets/models/obj/fe_car/BackTires.obj', backTiresMat);
        carGroup.add(backTires);

        //Brakes
        var brakesMat = self.TerminUtils.createTextureReflectiveMaterial('../libs/terminalia/assets/textures/fe_car/Brake.jpg', self.reflectionMap, .3);
        brakesMat.side = THREE.DoubleSide;
        var brakes = self.TerminUtils.loadObjModel("Brake", '../libs/terminalia/assets/models/obj/fe_car/Brakes.obj', brakesMat);
        carGroup.add(brakes);

        //Cockpit
        var cockpitMat = new THREE.MeshLambertMaterial({color: 0x070707});
        cockpitMat.side = THREE.DoubleSide;
        var cockpit = self.TerminUtils.loadObjModel("Cockpit", '../libs/terminalia/assets/models/obj/fe_car/Cockpit.obj', cockpitMat);
        carGroup.add(cockpit);

        //Cockpit Head
        var cockPitHeadMat = new THREE.MeshLambertMaterial({color: 0x404142});
        var cockPitHead = self.TerminUtils.loadObjModel("Cockpit Secure", '../libs/terminalia/assets/models/obj/fe_car/CockpitHead.obj', cockPitHeadMat);
        carGroup.add(cockPitHead);

        //Cockpit Seat
        var cockpitSeatMat = new THREE.MeshLambertMaterial({color: 0x5d5f60});
        var cockpitSeat = self.TerminUtils.loadObjModel("Cockpit Seat", '../libs/terminalia/assets/models/obj/fe_car/CockpitSeat.obj', cockpitSeatMat);
        carGroup.add(cockpitSeat);

        //Cockpit Belts
        var cockpitBeltsMat = new THREE.MeshLambertMaterial({color: 0xc61b35});
        var cockpitBelts = self.TerminUtils.loadObjModel("Cockpit Belts", '../libs/terminalia/assets/models/obj/fe_car/CockpitBelts.obj', cockpitBeltsMat);
        carGroup.add(cockpitBelts);

        //Cockpit Buckles
        var cockpitBucklesMat = new THREE.MeshLambertMaterial( { color: 0xe3f4f4, envMap: self.reflectionMap, combine: THREE.MixOperation, reflectivity: .7} );
        var cockpitBuckles = self.TerminUtils.loadObjModel("Cockpit Belts Metal", '../libs/terminalia/assets/models/obj/fe_car/CockpitBuckles.obj', cockpitBucklesMat);
        carGroup.add(cockpitBuckles);

        //Engine
        var engineMat = new THREE.MeshLambertMaterial({color: 0x070707});
        var engine = self.TerminUtils.loadObjModel("Engine", '../libs/terminalia/assets/models/obj/fe_car/Engine.obj', engineMat);
        carGroup.add(engine);

        //Back Light
        var backLightMat = self.TerminUtils.createTextureMaterial('../libs/terminalia/assets/textures/fe_car/BackLight.jpg');
        var backLight = self.TerminUtils.loadObjModel("Back Light", '../libs/terminalia/assets/models/obj/fe_car/BackLight.obj', backLightMat);
        carGroup.add(backLight);

        //Suspensions
        var suspensionsMat = self.TerminUtils.createTextureMaterial('../libs/terminalia/assets/textures/fe_car/Carbon_512.jpg');
        var suspensions = self.TerminUtils.loadObjModel("Suspensions", '../libs/terminalia/assets/models/obj/fe_car/Suspensions.obj', suspensionsMat);
        carGroup.add(suspensions);

        //Shadow Plane
        var shadowPlaneMat = self.TerminUtils.createTextureMaterial('../libs/terminalia/assets/textures/fe_car/ShadowMap_1024_2.png');
        shadowPlaneMat.transparent = true;
		shadowPlaneMat.opacity = 0.5;
        var shadowPlane = self.TerminUtils.loadObjModel("ShadowPlane", '../libs/terminalia/assets/models/obj/fe_car/ShadowPlane.obj', shadowPlaneMat);
        carGroup.add(shadowPlane);

        self.scene.add(carGroup);
    }

    //Add assets to create the car
    function addCar() {
        //BODY
        var carGroup = new THREE.Group();

        var carBodyMat = self.TerminUtils.createTextureReflectiveMaterial('../libs/terminalia/assets/textures/car_body.png', self.reflectionMap, .5);
        var carBody = self.TerminUtils.loadObjModel("CarBody", '../libs/terminalia/assets/models/obj/carbody.obj', carBodyMat);
        carGroup.add(carBody);

        //MECHANICAL
        var carMechanicalMat = self.TerminUtils.createTextureReflectiveMaterial('../libs/terminalia/assets/textures/car_mechanical.png', self.reflectionMap, .5);
        var carMechanical = self.TerminUtils.loadObjModel("CarMechanical", '../libs/terminalia/assets/models/obj/carmechanical.obj', carMechanicalMat);
        carGroup.add(carMechanical);

        //WHEELS
        var carWheelsMat = self.TerminUtils.createTextureMaterial('../libs/terminalia/assets/textures/car_wheels.jpg');
        var carWheels = self.TerminUtils.loadObjModel("CarWheels", '../libs/terminalia/assets/models/obj/carwheels.obj', carWheelsMat);
        carGroup.add(carWheels);

        //TYRES
        var carTyresMat = new THREE.MeshLambertMaterial( { color: 0xcbcfd6, envMap: self.reflectionMap, combine: THREE.MixOperation, reflectivity: 1.0} );
        var carTyres = self.TerminUtils.loadObjModel("CarWheels", '../libs/terminalia/assets/models/obj/cartyres.obj', carTyresMat);
        carGroup.add(carTyres);

        //ADD SHADOW MAP
        var shadowMap = self.TerminUtils.createTexture("../libs/terminalia/assets/textures/car_shadow_bake.png");
        var shadowMapMaterial = new THREE.MeshBasicMaterial({map: shadowMap, color: 0xffffff});
        shadowMapMaterial.transparent = true;
        shadowMapMaterial.opacity = 0.7;
        var plane = self.TerminUtils.loadObjModel("ShadowPlane", '../libs/terminalia/assets/models/obj/ShadowPlane.obj', shadowMapMaterial);
        carGroup.add(plane);

        self.scene.add(carGroup);
    }

    //Add clickable pins
    function addPins() {

		//STAGE START
        var pin1_electricity = self.TerminUtils.createSprite('pin1_electricity', '../libs/terminalia/assets/textures/pins/pin_1-electricity.png');
        pin1_electricity.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin1_electricity.position.set(-0.6, 0.9, -0.5);
        self.pinsGroup.add(pin1_electricity);

        var pin1_engine = self.TerminUtils.createSprite('pin1_engine', '../libs/terminalia/assets/textures/pins/pin_1-engine.png');
        pin1_engine.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin1_engine.position.set(0.5, 0.9, -1.2);
        self.pinsGroup.add(pin1_engine);

        var pin1_info = self.TerminUtils.createSprite('pin1_info', '../libs/terminalia/assets/textures/pins/pin_1-info.png');
        pin1_info.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin1_info.position.set(0, 0.9, 0.4);
        self.pinsGroup.add(pin1_info);

        var pin_1_tyre = self.TerminUtils.createSprite('pin_1_tyre', '../libs/terminalia/assets/textures/pins/pin_1-tyre.png');
        pin_1_tyre.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin_1_tyre.position.set(0.9, 0.9, 1.2);
        self.pinsGroup.add(pin_1_tyre);

		//STAGE CIRCUIT
		var pin_2_grid = self.TerminUtils.createSprite('pin_2_grid', '../libs/terminalia/assets/textures/pins/pin_2-grid.png');
		pin_2_grid.scale.set(40, 40, 40);
		pin_2_grid.position.set(-190, 40, 80);
		self.pinsGroup.add(pin_2_grid);

		var pin_2_info = self.TerminUtils.createSprite('pin_2_info', '../libs/terminalia/assets/textures/pins/pin_2-info.png');
		pin_2_info.scale.set(40, 40, 40);
		pin_2_info.position.set(280, 40, 0);
		self.pinsGroup.add(pin_2_info);

		var pin_2_meter = self.TerminUtils.createSprite('pin_2_meter', '../libs/terminalia/assets/textures/pins/pin_2-meter.png');
		pin_2_meter.scale.set(40, 40, 40);
		pin_2_meter.position.set(-20, 30, 20);
		self.pinsGroup.add(pin_2_meter);

		var pin_2_solar = self.TerminUtils.createSprite('pin_2_solar', '../libs/terminalia/assets/textures/pins/pin_2-solar.png');
		pin_2_solar.scale.set(40, 40, 40);
		pin_2_solar.position.set(-120, 30, -100);
		self.pinsGroup.add(pin_2_solar);

		var pin_2_storage = self.TerminUtils.createSprite('pin_2_storage', '../libs/terminalia/assets/textures/pins/pin_2-storage.png');
		pin_2_storage.scale.set(40, 40, 40);
		pin_2_storage.position.set(-180, 30, -80);
		self.pinsGroup.add(pin_2_storage);

        for (var i=4; i<9; i++) {
            self.pinsGroup.children[i].material.opacity = 0;
        }

        self.scene.add(self.pinsGroup);
    }

    //Add info flags
    function addInfoFlags() {
        var flagSize = new THREE.Vector3(1.5, 1.5, 1.5);
        var powerFlag = self.TerminUtils.createSprite('Sprite4', '../libs/terminalia/assets/textures/bandiera_power.png');
        powerFlag.scale.set(flagSize.x, flagSize.y, flagSize.z);
        powerFlag.position.set(0, 1.2, 1);
        self.scene.add(powerFlag);

        var speedFlag = self.TerminUtils.createSprite('Sprite4', '../libs/terminalia/assets/textures/bandiera_speed.png');
        speedFlag.scale.set(flagSize.x, flagSize.y, flagSize.z);
        speedFlag.position.set(0, 1.2, -2);
        self.scene.add(speedFlag);
    }

    //Add circuit buildings
    function addCircuit(size, offset) {
        if (offset === 0)
                offset = 1;

		var ambientLight = new THREE.AmbientLight(0xfaebd7, 2.0);
        self.scene.add(ambientLight);

        //We add here a light because custom toon shader needs a light
        var dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
        dirLight.position.set(0, 10, 25);
        self.scene.add(dirLight);
        var helper = new THREE.DirectionalLightHelper( dirLight);
        //self.scene.add(helper);


        var toonShader = self.customShaders['LucaUberToonShader'];
        var toonShaderUniforms = THREE.UniformsUtils.clone(toonShader.uniforms);

        var vs = toonShader.vertexShader;
        var fs = toonShader.fragmentShader;

        var toonMaterial = new THREE.ShaderMaterial({
            uniforms: toonShaderUniforms,
            vertexShader: vs,
            fragmentShader: fs,
        });

        //0x0555fc
        toonMaterial.uniforms.uMaterialColor1.value = new THREE.Color(0xB4CDF9);
        toonMaterial.uniforms.uMaterialColor2.value = new THREE.Color(0x4286F1);
        toonMaterial.uniforms.uMaterialColor3.value = new THREE.Color(0x0555F9);
        toonMaterial.uniforms.uTone1.value = 1.0;
        toonMaterial.uniforms.uTone2.value = 1.0;
        toonMaterial.uniforms.uDirLightPos.value = dirLight.position;
        toonMaterial.uniforms.uDirLightColor.value = dirLight.color;

        var circuitPivotMat = new THREE.MeshBasicMaterial();
        circuitPivotMat.transparent = true;
        circuitPivotMat.opacity = 0;
        self.circuitPivot = new THREE.Mesh(new THREE.SphereBufferGeometry(size, 20, 20), circuitPivotMat);
        self.circuitPivot.material.visible = false;

        var circuit = self.TerminUtils.loadObjModel('Circuit', '../libs/terminalia/assets/models/obj/berlin_circuit.obj', toonMaterial);
        circuit.scale.set(40, 40, 40);
        circuit.rotation.set(0, radians(180), 0);
        circuit.position.set(0, size * offset, 0);

        self.circuitPivot.add(circuit);
        self.circuitPivot.position.set(0, -size, 0);
        self.scene.add(self.circuitPivot);
    }

	function addWorldPins() {
		self.test_pin = self.TerminUtils.createSprite('pin_3_bio', '../libs/terminalia/assets/textures/pins/pin_3-bio.png');
		self.test_pin.scale.set(0.09, 0.09, 0.09);
		self.test_pin.position.set(-0.23, 0.65, 0.81);
		//self.world.add(self.test_pin);

        var pinsSize = 0.11;
        //DENMARK
		var pin_3_v2g = self.TerminUtils.createSprite('pin_3_v2g', '../libs/terminalia/assets/textures/pins/pin_3-v2g.png');
		pin_3_v2g.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_v2g.position.set(-0.009, 0.86, 0.61);
		self.world.add(pin_3_v2g);

        //SPAIN
		var pin_3_bio = self.TerminUtils.createSprite('pin_3_spain', '../libs/terminalia/assets/textures/pins/pin_3-bio.png');
		pin_3_bio.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_bio.position.set(-1.01, -0.26, 0.17);
		self.world.add(pin_3_bio);

        //ROME
		var pin_3_world = self.TerminUtils.createSprite('pin_3_rome', '../libs/terminalia/assets/textures/pins/pin_3-world.png');
		pin_3_world.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_world.position.set(0.079, 0.64, 0.82);
		self.world.add(pin_3_world);

        //MILAN
		var pin_3_smart = self.TerminUtils.createSprite('pin_3_milan', '../libs/terminalia/assets/textures/pins/pin_3-smart.png');
		pin_3_smart.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_smart.position.set(-0.03, 0.74, 0.75);
		self.world.add(pin_3_smart);

        //BERLIN
		var pin_3_germany = self.TerminUtils.createSprite('pin_3_berlin', '../libs/terminalia/assets/textures/pins/pin_3-germany.png');
		pin_3_germany.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_germany.position.set(0.05, 0.80, 0.69);
		self.world.add(pin_3_germany);

        //HONG KONG
		var pin_3_fe = self.TerminUtils.createSprite('pin_3_fe', '../libs/terminalia/assets/textures/pins/pin_3-fe.png');
		pin_3_fe.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_fe.position.set(0.95, 0.39, -0.32);
		self.world.add(pin_3_fe);

        //MEXICO
		var pin_3_solar = self.TerminUtils.createSprite('pin_3_solar', '../libs/terminalia/assets/textures/pins/pin_3-solar.png');
		pin_3_solar.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_solar.position.set(-0.91, 0.38, -0.41);
		self.world.add(pin_3_solar);
	}

    function addWorld(size) {
        var worldTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/world-tex-4096.jpg');
        worldTexture.magFilter = THREE.NearestFilter;
        worldTexture.minFilter = THREE.LinearMipMapLinearFilter;
        var worldMaterial = new THREE.MeshBasicMaterial({map: worldTexture});
        worldMaterial.transparent = true;
        worldMaterial.opacity = 0;
        self.world = self.TerminUtils.loadObjModel('World', '../libs/terminalia/assets/models/obj/World2.obj', worldMaterial);
        self.world.scale.set(size, size, size);
        self.world.position.set(0, -size, 0);
        self.scene.add(self.world);
        self.spaceBall.addRotationToObject(self.world);
    }

    //###########################################################################################################
    // ANIMATIONS
    //###########################################################################################################
    //Create and start a new animation passing a new position
    function startCameraAnimation(new_position, duration) {
        self.cameraAnimation = TweenMax.to(self.camera.position, duration, {x: new_position[0], y: new_position[1], z: new_position[2], onUpdate: function() {
            self.orbit_controls.update();
        }});
    }

    function startStageAnimation(stage) {
        //Before starting any animation we have to create the actual stageAnimation
        if (self.animationCreated === false) {
            addWorldPins();
            createStageAnimations();
            self.animationCreated = true;
        }

        switch(stage)
        {
            case 1:
            self.stageAnimation.tweenFromTo(self.currentState, 'StageStart')
            self.currentState = 'StageStart'
            break;

            case 2:
            self.stageAnimation.tweenFromTo(self.currentState, 'StageCircuit')
            self.currentState = 'StageCircuit'
            break;

            case 3:
            self.stageAnimation.tweenFromTo(self.currentState, 'StageFinal')
            self.currentState = 'StageFinal'
            break;
        }
    }

    function createStageAnimations() {
        //STAGE 1 is the ORIGIN (This animation never plays, it just gives an origin to the all animation)
        var newCameraPos = new THREE.Vector3(3.70, 1.85, 5.55);
        self.stageAnimation.addLabel("StageOrigin");
        self.stageAnimation.add(TweenLite.to(self.camera.position, 2, {x: newCameraPos.x, y: newCameraPos.y, z: newCameraPos.z, delay: 0, ease: Power1.easeInOut, onUpdate: function() {
            self.orbit_controls.update()
        }}), "StageOrigin");

        //STAGE 2
        newCameraPos = new THREE.Vector3(156, 320, 521);
        self.stageAnimation.addLabel("StageStart");
        //1. rotate circuit 360
        self.stageAnimation.add(TweenLite.to(self.circuitPivot.rotation, 2, {x: 0, y: radians(360), z: 0, delay: 0,  ease: Power4.easeInOut}), "StageStart");
        //2. show pins
        self.stageAnimation.add(TweenLite.to(self.pinsGroup.children[4].material, 0.5, {opacity: 1, onUpdate: function() {
            for (var i=5; i<9; i++) {
                self.pinsGroup.children[i].material.opacity = self.pinsGroup.children[4].material.opacity;
            }
        }}));
        //3. zoom out camera
        self.stageAnimation.add(TweenLite.to(self.camera.position, 2, {x: newCameraPos.x, y: newCameraPos.y, z: newCameraPos.z, delay: 0, ease: Power1.easeInOut, onUpdate: function() {
            self.orbit_controls.update()
        }}), "StageStart");

        //STAGE 3
        //newCameraPos = new THREE.Vector3(2650, 1476, 8081);
        newCameraPos = new THREE.Vector3(7621.50, -672.90, 12808.57);
        self.stageAnimation.addLabel("StageCircuit");
        //1. Make world visible by changing its opacity
        self.stageAnimation.add(TweenLite.to(self.world.children[0].children[0].material, 1, {opacity: 1}));
        //2. Move world under the circuit
        //self.stageAnimation.add(TweenLite.to(self.world.position, 1, {x: 0, y: -6000, z: 0, delay: 0, ease: Power1.easeInOut}), 'StageCircuit');

        //2.Show Mexico Pin
        //self.stageAnimation.add(TweenLite.to(self.world.children[7].material, 1, {opacity: 1}));
        //3. Rotate circuit behind the world
        self.stageAnimation.add(TweenLite.to(self.circuitPivot.rotation, 1, {x: radians(-30), y: 0, z: 0, delay: 1, ease: Power1.easeInOut}), 'StageCircuit');
        //4. Rotate world
        //self.stageAnimation.add(TweenLite.to(self.world.rotation, 2, {x: radians(-180), y: 0, z: radians(93.3), delay: 1}), 'StageCircuit');
        self.stageAnimation.add(TweenLite.to(self.world.rotation, 3, {x: radians(360), y: 0, z: radians(360), delay: 1, ease: Power1.easeInOut}), 'StageCircuit');
        //5. Move World
        self.stageAnimation.add(TweenLite.to(self.world.position, 2, {x: -4000, y: -1500, z: 0, delay: 1, ease: Power1.easeInOut}), 'StageCircuit');

        self.stageAnimation.add(TweenLite.to(self.camera.position, 2, {x: newCameraPos.x, y: newCameraPos.y, z: newCameraPos.z, delay: 0, ease: Power1.easeInOut, onUpdate: function() {
            self.orbit_controls.update()
        }}), 'StageCircuit');
        self.stageAnimation.addLabel("StageFinal");

        console.log("Animations created!");
    }

    //###########################################################################################################
    // ORTHOGRAPHIC LAYER
    //###########################################################################################################

    //Add ortho assets to the scene
    function addOrthoAssets() {
        var width = self.container.offsetWidth;
        var height = self.container.offsetHeight;

        var gradientMap = self.TerminUtils.createTexture("../libs/terminalia/assets/textures/test_gradient_ortho.png");
        var gradientMaterial = new THREE.MeshBasicMaterial({map: gradientMap});
        gradientMaterial.transparent = true;
        gradientMaterial.opacity = 1;

        var size =  (width / height) * self.glarePlaneSize;

        var orthoGlarePlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 1), gradientMaterial);
        orthoGlarePlane.scale.set(size, size, 1);
        orthoGlarePlane.position.set(-width/2 + size/2, height/2 - size/2, 1);
        self.sceneOrtho.add(orthoGlarePlane);
    }

    //Update ortho assets size when container is resized
    function updateOrthoAssetsSize() {
        var width = self.container.offsetWidth;
        var height = self.container.offsetHeight;

        var size = (width/height) * self.glarePlaneSize;

        for (var i=0; i<self.sceneOrtho.children.length; i++) {
            self.sceneOrtho.children[i].scale.set(size, size, 1);
            self.sceneOrtho.children[i].position.set(-width/2 + size/2, height/2 - size/2, 1);
        }
    }

    //###########################################################################################################
    // HUD & UI
    //###########################################################################################################

    //Add UI elements
    function addHUD() {
        self.stats = new Stats();
        self.container.appendChild(self.stats.domElement);
    }

    function rotateWorld(angle) {
        self.world.rotateX(radians(angle));
        self.circuitPivot.rotateX(radians(angle));
    }

    function radians(degrees) {
        return degrees * Math.PI / 180;
    }

    function getCameraPosition() {
        console.log(self.camera.position);
    }

	function movePins(x, y, z) {
		self.test_pin.position.x += x;
		self.test_pin.position.y += y;
		self.test_pin.position.z += z;

		console.log(self.test_pin.position);
	}

    this.render = render;
    this.resize = resize;
    this.findObjectOnClick = findObjectOnClick;
    this.startCameraAnimation = startCameraAnimation;
    this.startStageAnimation = startStageAnimation;
    this.getCameraPosition = getCameraPosition;
    this.createStageAnimations = createStageAnimations;
    this.rotateWorld = rotateWorld;
	this.movePins = movePins;
}
