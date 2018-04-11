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
    self.pinsStage1 = null;
    self.pinsStage2 = null;
    self.glarePlaneSize = 312;
    self.customShaders = CustomShaders;
    self.cameraAnimation = null;
    self.worldAnimation = null;
    self.world = null;
    self.worldPivot = null;
    self.circuitPivot = null;
    self.toonMaterial = null;
    self.circuitMaterial = null;
    self.landMaterial = null;
    self.stageAnimation = new TimelineMax({repeat: 0, paused: true});
    self.worldSize = 5200;
    self.currentState = 'StageStart';
    self.animationCreated = false;
    self.pinScaleFactor = 0.45;
	self.test_pin = null;
    self.debugMode = false;

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

        self.container.addEventListener('mousedown', function(event) {
            self.spaceBall.autoRotate = false;
            self.spaceBall.pinInterpolating = false;
            self.orbit_controls.autoRotate = false;
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
            self.spaceBall.autoRotate = false;
            self.spaceBall.pinInterpolating = false;
            self.orbit_controls.autoRotate = false;
            self.spaceBall.onMouseDown(event.touches[0].clientX, event.touches[0].clientY);
        }, false);
        self.container.addEventListener('touchend', function(event) {
            self.spaceBall.onMouseUp();
        }, false);
        self.container.addEventListener('touchmove', function(event) {
            event.preventDefault()
            self.spaceBall.onMouseMove(event.touches[0].clientX, event.touches[0].clientY);
        }, false);

        initScene();
    }

    //INIT THE SCENE
    function initScene() {
        self.scene = new THREE.Scene();
        self.sceneOrtho = new THREE.Scene();
        self.pinsStage1 = new THREE.Group();
        self.pinsStage2 = new THREE.Group();
        initOrbitCamera();
        //initOrthoCamera();
        addCubeMap('../libs/terminalia/assets/textures/cubemaps/vancouver/', '.jpg');
        addAssets();
        addPins();
        ///addOrthoAssets();
        //addInfoFlags();
        if (self.debugMode) {
            addHUD();
        }

        //Create fog
        self.scene.fog = new THREE.Fog(0x0555fa, 20, 2000);
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
        self.orbit_controls.enableZoom = false;
        self.orbit_controls.enablePan = false;
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
            self.orbit_controls.autoRotate = false;
            self.spaceBall.enabled = true;
        }
        else {
            self.orbit_controls.enabled = true;
            self.spaceBall.enabled = false;
        }

        if (self.spaceBall.pinInterpolating) {
            self.spaceBall.updateRotationPin();
        }

        if (self.spaceBall.autoRotate) {
            self.spaceBall.autoRotateAnimation();
        }

        if (self.orbit_controls.autoRotate) {
            self.orbit_controls.update();
        }

        self.renderer.render(self.scene, self.camera);
        requestAnimationFrame(render);
        if (self.debugMode) {
            self.stats.update();
        }
    }

    //###########################################################################################################
    // EVENTS
    //###########################################################################################################

    //Called when container is resized
    function resize() {
        var winHeight = window.innerHeight
        var footer = document.getElementsByTagName('footer')
        var footHeight = -20
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
        if (self.currentState === 'StageStart') {

            //Find object at click/tap
            intersected = self.TerminUtils.rayPickObject(event.clientX, event.clientY, container.offsetWidth, container.offsetHeight, self.camera, self.pinsStage1.children);

            if (intersected !== undefined)
            {
                switch(intersected.name) {
                    //STAGE START
                    case "pin_1_electricity":
                        self.pinsStage1.children[0].material.map = self.pinsStage1.children[0].material.active_map;
                        startCameraAnimation([-5.01, 1.12, -4.63], 2);
                    break;

                    case "pin_1_engine":
                        self.pinsStage1.children[1].material.map = self.pinsStage1.children[1].material.active_map;
                        startCameraAnimation([-3.19, 2.20, -5.73], 2);
                    break;

                    case "pin_1_info":
                        self.pinsStage1.children[2].material.map = self.pinsStage1.children[2].material.active_map;
                        startCameraAnimation([0.97, 4.74, 6.46], 2);
                    break;

                    case "pin_1_tyre":
                        self.pinsStage1.children[3].material.map = self.pinsStage1.children[3].material.active_map;
                        startCameraAnimation([5.98, 2.32, 2.59], 2);
                    break;

                    case "pin_1_new_car":
                        self.pinsStage1.children[4].material.map = self.pinsStage1.children[4].material.active_map;
                        startCameraAnimation([5.25, 2.39, -3.80], 2);
                    break;
                }

                //When a pin is active, set the others to default map
                for (var k=0; k<self.pinsStage1.children.length; k++) {
                    if (self.pinsStage1.children[k].name !== intersected.name) {
                        self.pinsStage1.children[k].material.map = self.pinsStage1.children[k].material.default_map;
                    }
                }
            }
        }
        //Stage Circuit
        else if (self.currentState === 'StageCircuit') {
            //Find object at click/tap
            intersected = self.TerminUtils.rayPickObject(event.clientX, event.clientY, container.offsetWidth, container.offsetHeight, self.camera, self.pinsStage2.children);

            if (intersected !== undefined)
            {
                switch(intersected.name)
                {
                    case "pin_2_grid":
                        self.pinsStage2.children[0].material.map = self.pinsStage2.children[0].material.active_map;
                        //startCameraAnimation([-656, 173, 367], 2);
                        startCameraAnimation([-565, 247, -464], 2);
                    break;

                    case "pin_2_info":
                        self.pinsStage2.children[1].material.map = self.pinsStage2.children[1].material.active_map;
                        //startCameraAnimation([730, 213, -139], 2);
                        startCameraAnimation([369, 281, 614], 2);
                    break;

                    case "pin_2_meter":
                        self.pinsStage2.children[2].material.map = self.pinsStage2.children[2].material.active_map;
                        //startCameraAnimation([12, 361, 684], 2);
                        startCameraAnimation([-779, 306, 113], 2);
                    break;

                    case "pin_2_solar":
                        self.pinsStage2.children[3].material.map = self.pinsStage2.children[3].material.active_map;
                        //startCameraAnimation([117, 660, 298], 2);
                        startCameraAnimation([714, 276, -69], 2);
                    break;

                    case "pin_2_santiago":
                    self.pinsStage2.children[4].material.map = self.pinsStage2.children[4].material.active_map;
                    //startCameraAnimation([-759, 213, 200], 2);
                    startCameraAnimation([638, 193, -392], 2);
                    break;
                }

                //When a pin is active, set the others to default map
                for (var k=0; k<self.pinsStage2.children.length; k++) {
                    if (self.pinsStage2.children[k].name !== intersected.name) {
                        self.pinsStage2.children[k].material.map = self.pinsStage2.children[k].material.default_map;
                    }
                }
            }
        }
        //Stage Final
        else {
            //Find object at click/tap
            intersected = self.TerminUtils.rayPickObject(event.clientX, event.clientY, container.offsetWidth, container.offsetHeight, self.camera, self.world.children);

            if (intersected !== undefined)
            {
                switch(intersected.name)
                {
                    case "pin_3_v2g":
                        self.world.children[1].material.map = self.world.children[1].material.active_map;
                        startWorldAnimation(181);
                    break;

                    case "pin_3_spain":
                        self.world.children[2].material.map = self.world.children[2].material.active_map;
                        startWorldAnimation(566);
                    break;

                    case "pin_3_rome":
                        self.world.children[3].material.map = self.world.children[3].material.active_map;
                        startWorldAnimation(206);
                    break;

                    case "pin_3_milan":
                        self.world.children[4].material.map = self.world.children[4].material.active_map;
                        startWorldAnimation(284);
                    break;

                    case "pin_3_berlin":
                        self.world.children[5].material.map = self.world.children[5].material.active_map;
                        startWorldAnimation(43);
                    break;

                    case "pin_3_fe":
                        self.world.children[6].material.map = self.world.children[6].material.active_map;
                        startWorldAnimation(-364);
                    break;

                    case "pin_3_solar":
                        self.world.children[7].material.map = self.world.children[7].material.active_map;
                        startWorldAnimation(756);
                    break;

                    case "pin_3_ny":
                        self.world.children[8].material.map = self.world.children[8].material.active_map;
                        startWorldAnimation(462);
                    break;

                    case "pin_3_ca":
                        self.world.children[9].material.map = self.world.children[9].material.active_map;
                        startWorldAnimation(583);
                    break;

                    case "pin_3_uy":
                        self.world.children[10].material.map = self.world.children[10].material.active_map;
                        startWorldAnimation(306);
                    break;
                }

                //When a pin is active, reset all the others
                for (var k=1; k<self.world.children.length; k++) {
                    if (self.world.children[k].name !== intersected.name) {
                        self.world.children[k].material.map = self.world.children[k].material.default_map;
                    }
                }
            }
        }
        if (intersected) return intersected.name
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
        addFECar();
        addCircuit(self.worldSize - 1, 0);
        addWorld(self.worldSize);
    }

    function addFECar() {
        var materials = [];

        //Car Group
        var carGroup = new THREE.Group();

        //Body
        var bodyTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/Body_2048_update4.jpg');
        var bodyMat = new THREE.MeshStandardMaterial({color: 0xffffff, map: bodyTexture, metalness: .6, roughness: .4, bumpScale: 0 });
        var body = self.TerminUtils.loadObjModel("Body", '../libs/terminalia/assets/models/obj/fe_car/Body3.obj', bodyMat);
        carGroup.add(body);
        materials.push(bodyMat);

        //Body Bottom
        var bodyBottomMat = new THREE.MeshStandardMaterial({color: 0x2c2c2d, metalness: 0, roughness: .9, bumpScale: 0 });
        var bodyBottom = self.TerminUtils.loadObjModel("BodyBottom", '../libs/terminalia/assets/models/obj/fe_car/BodyBottom.obj', bodyBottomMat);
        carGroup.add(bodyBottom);
        //materials.push(bodyBottomMat);

        //Front Wheels
        var frontWheelsTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/FrontWheelsBump3.jpg');
        var frontWheelsMat = new THREE.MeshStandardMaterial({color: 0xffffff, map: frontWheelsTexture, metalness: 0.7, roughness: .7, bumpScale: 0.01 });
        var frontWheelsLeft = self.TerminUtils.loadObjModel("FrontWheels", '../libs/terminalia/assets/models/obj/fe_car/FrontWheelsLeft.obj', frontWheelsMat);
        var frontWheelsRight = self.TerminUtils.loadObjModel("FrontWheels", '../libs/terminalia/assets/models/obj/fe_car/FrontWheelsRight.obj', frontWheelsMat);
        carGroup.add(frontWheelsLeft);
        carGroup.add(frontWheelsRight);
        materials.push(frontWheelsMat);

        //Inside Wheels
        var insideWheelsColorMap = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/FrontWheelsBump2.jpg');
        var insideWheelsBumpMap = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/FrontWheelsBump.png');
        var insideWheelsMat = new THREE.MeshStandardMaterial({color: 0xffffff, map: insideWheelsColorMap, bumpMap: insideWheelsBumpMap, metalness: 0.7, roughness: .7, bumpScale: 0.01 });
        var insideWheels = self.TerminUtils.loadObjModel("FrontWheels", '../libs/terminalia/assets/models/obj/fe_car/InsideWheels.obj', insideWheelsMat);
        carGroup.add(insideWheels);
        materials.push(insideWheelsMat);

        //Tires
        var tiresMat = new THREE.MeshStandardMaterial({color: 0xe3f4f4, metalness: 0.7, roughness: .3, bumpScale: 0.0});
        var frontTires = self.TerminUtils.loadObjModel("Tires", '../libs/terminalia/assets/models/obj/fe_car/Tires.obj', tiresMat);
        carGroup.add(frontTires);
        materials.push(tiresMat);

        //BackTires
        var backTiresMat = new THREE.MeshStandardMaterial({color: 0x2d2d2d, metalness: 0.7, roughness: .3, bumpScale: 0.0});
        var backTires = self.TerminUtils.loadObjModel("Tires", '../libs/terminalia/assets/models/obj/fe_car/BackTires.obj', backTiresMat);
        carGroup.add(backTires);

        //Brakes
        var brakesTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/Brake.jpg');
        var brakesMat = new THREE.MeshStandardMaterial({color: 0xffffff, map: brakesTexture, bumpMap: brakesTexture, metalness: 0.7, roughness: .3, bumpScale: 0.01 });
        var brakes = self.TerminUtils.loadObjModel("Brake", '../libs/terminalia/assets/models/obj/fe_car/Brakes.obj', brakesMat);
        carGroup.add(brakes);
        materials.push(brakesMat);

        //Cockpit
        var cockpitMat = new THREE.MeshStandardMaterial({color: 0x070707, metalness: 0.7, roughness: .3, bumpScale: 0.01 });
        var cockpit = self.TerminUtils.loadObjModel("Cockpit", '../libs/terminalia/assets/models/obj/fe_car/Cockpit.obj', cockpitMat);
        carGroup.add(cockpit);
        materials.push(cockpitMat);

        //Cockpit Head
        var cockPitHeadMat = new THREE.MeshStandardMaterial({color: 0x404142, metalness: 0.7, roughness: .3, bumpScale: 0.01 });
        var cockPitHead = self.TerminUtils.loadObjModel("Cockpit Secure", '../libs/terminalia/assets/models/obj/fe_car/CockpitHead.obj', cockPitHeadMat);
        carGroup.add(cockPitHead);
        materials.push(cockPitHeadMat);

        //Cockpit Seat
        var cockpitSeatMat = new THREE.MeshStandardMaterial({color: 0x5d5f60, metalness: 0.7, roughness: .3, bumpScale: 0.01 });
        var cockpitSeat = self.TerminUtils.loadObjModel("Cockpit Seat", '../libs/terminalia/assets/models/obj/fe_car/CockpitSeat.obj', cockpitSeatMat);
        carGroup.add(cockpitSeat);
        materials.push(cockpitSeatMat);

        //Cockpit Belts 0xc61b35
        var cockpitBeltsMat = new THREE.MeshStandardMaterial({color: 0xc61b35, metalness: 0, roughness: 0.8, bumpScale: 0.01 });
        var cockpitBelts = self.TerminUtils.loadObjModel("Cockpit Belts", '../libs/terminalia/assets/models/obj/fe_car/CockpitBelts.obj', cockpitBeltsMat);
        carGroup.add(cockpitBelts);
        materials.push(cockpitBeltsMat);

        //Cockpit Buckles
        //var cockpitBucklesMat = new THREE.MeshLambertMaterial( { color: 0xe3f4f4, envMap: self.reflectionMap, combine: THREE.MixOperation, reflectivity: .7} );
        var cockpitBucklesMat = new THREE.MeshStandardMaterial({color: 0xe3f4f4, metalness: 1, roughness: .1, bumpScale: 0.0 });
        var cockpitBuckles = self.TerminUtils.loadObjModel("Cockpit Belts Metal", '../libs/terminalia/assets/models/obj/fe_car/CockpitBuckles.obj', cockpitBucklesMat);
        carGroup.add(cockpitBuckles);
        materials.push(cockpitBucklesMat);

        //Engine
        var engine = self.TerminUtils.loadObjModel("Engine", '../libs/terminalia/assets/models/obj/fe_car/Engine.obj', cockpitMat);
        carGroup.add(engine);

        //Back Light
        var backLightTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/BackLight.jpg');
        var backLightMat = new THREE.MeshStandardMaterial({color: 0xffffff, map: backLightTexture, metalness: 0.1, roughness: 1, bumpScale: 0.01 });
        var backLight = self.TerminUtils.loadObjModel("Back Light", '../libs/terminalia/assets/models/obj/fe_car/BackLight.obj', backLightMat);
        carGroup.add(backLight);


        //Suspensions
        var suspensionsTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/Carbon_512_2.jpg');
        var suspensionsMat = new THREE.MeshStandardMaterial({color: 0xffffff, map: suspensionsTexture, metalness: 0.7, roughness: .3, bumpScale: 0.01 });
        var suspensions = self.TerminUtils.loadObjModel("Suspensions", '../libs/terminalia/assets/models/obj/fe_car/Suspensions.obj', suspensionsMat);
        carGroup.add(suspensions);
        materials.push(suspensionsMat);

        //Shadow Plane
        var shadowTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/fe_car/ShadowMap_1024_2.jpg');
        var shadowPlaneMat = new THREE.MeshBasicMaterial({map: shadowTexture});
        var shadowPlane = self.TerminUtils.loadObjModel("ShadowPlane", '../libs/terminalia/assets/models/obj/fe_car/ShadowPlane.obj', shadowPlaneMat);
        carGroup.add(shadowPlane);

        self.scene.add(carGroup);

        var cubemap = self.TerminUtils.createCubeMapTextureHDR('../libs/terminalia/assets/textures/cubemaps/uruguay_hdr_512/', '.hdr', self.renderer, materials);
    }

    //Add clickable pins
    function addPins() {

        //STAGE START
        /*
        self.test_pin = self.TerminUtils.createSprite('pin_1_electricity', '../libs/terminalia/assets/textures/pins/pin_1-electricity.png');
        self.test_pin.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        self.test_pin.position.set(-0.6, 0.9, -0.5);
        self.test_pin.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-electricity.png');
        self.test_pin.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-electricity_on.png');
        self.pinsStage1.add(self.test_pin);
        */


        var pin_1_electricity = self.TerminUtils.createSprite('pin_1_electricity', '../libs/terminalia/assets/textures/pins/pin_1-electricity.png');
        pin_1_electricity.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin_1_electricity.position.set(-0.6, 0.9, -0.5);
        pin_1_electricity.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-electricity.png');
        pin_1_electricity.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-electricity_on.png');
        self.pinsStage1.add(pin_1_electricity);

        var pin_1_engine = self.TerminUtils.createSprite('pin_1_engine', '../libs/terminalia/assets/textures/pins/pin_1-engine.png');
        pin_1_engine.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin_1_engine.position.set(0.5, 0.9, -1.2);
        pin_1_engine.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-engine.png');
        pin_1_engine.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-engine_on.png');
        self.pinsStage1.add(pin_1_engine);

        var pin_1_info = self.TerminUtils.createSprite('pin_1_info', '../libs/terminalia/assets/textures/pins/pin_1-info.png');
        pin_1_info.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin_1_info.position.set(0, 0.9, 0.9);
        pin_1_info.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-info.png');
        pin_1_info.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-info_on.png');
        self.pinsStage1.add(pin_1_info);

        var pin_1_tyre = self.TerminUtils.createSprite('pin_1_tyre', '../libs/terminalia/assets/textures/pins/pin_1-tyre.png');
        pin_1_tyre.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin_1_tyre.position.set(0.9, 0.9, 1.2);
        pin_1_tyre.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-tyre.png');
        pin_1_tyre.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-tyre_on.png');
        self.pinsStage1.add(pin_1_tyre);

        var pin_1_new_car = self.TerminUtils.createSprite('pin_1_new_car', '../libs/terminalia/assets/textures/pins/pin_1-new_car.png');
        pin_1_new_car.scale.set(self.pinScaleFactor, self.pinScaleFactor, self.pinScaleFactor);
        pin_1_new_car.position.set(0.6, 0.9, -0.5);
        pin_1_new_car.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-new_car.png');
        pin_1_new_car.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_1-new_car_on.png');
        self.pinsStage1.add(pin_1_new_car);

		//STAGE CIRCUIT
        var pinSize = 67;
        /*
        self.test_pin = self.TerminUtils.createSprite('pin_2_grid', '../libs/terminalia/assets/textures/pins/pin_2-grid.png');
		self.test_pin.scale.set(pinSize, pinSize, pinSize);
		self.test_pin.position.set(-56, 40, 121);
        self.test_pin.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-grid.png');
        self.test_pin.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-grid_on.png');
        self.pinsStage2.add(self.test_pin);
        */

		var pin_2_grid = self.TerminUtils.createSprite('pin_2_grid', '../libs/terminalia/assets/textures/pins/pin_2-grid.png');
		pin_2_grid.scale.set(pinSize, pinSize, pinSize);
		pin_2_grid.position.set(-299, 40, -170);
        pin_2_grid.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-grid.png');
        pin_2_grid.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-grid_on.png');
		self.pinsStage2.add(pin_2_grid);

		var pin_2_info = self.TerminUtils.createSprite('pin_2_info', '../libs/terminalia/assets/textures/pins/pin_2-info.png');
		pin_2_info.scale.set(pinSize, pinSize, pinSize);
		pin_2_info.position.set(105, 40, 72);
        pin_2_info.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-info.png');
        pin_2_info.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-info_on.png');
		self.pinsStage2.add(pin_2_info);

		var pin_2_meter = self.TerminUtils.createSprite('pin_2_meter', '../libs/terminalia/assets/textures/pins/pin_2-meter.png');
		pin_2_meter.scale.set(pinSize, pinSize, 40);
		pin_2_meter.position.set(-257, 40, -17);
        pin_2_meter.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-meter.png');
        pin_2_meter.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-meter_on.png');
		self.pinsStage2.add(pin_2_meter);

        /*
		var pin_2_solar = self.TerminUtils.createSprite('pin_2_solar', '../libs/terminalia/assets/textures/pins/pin_2-solar.png');
		pin_2_solar.scale.set(pinSize, pinSize, pinSize);
		pin_2_solar.position.set(278, 49, 87);
        pin_2_solar.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-solar.png');
        pin_2_solar.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-solar_on.png');
		self.pinsStage2.add(pin_2_solar);
        */
        /*
		var pin_2_storage = self.TerminUtils.createSprite('pin_2_storage', '../libs/terminalia/assets/textures/pins/pin_2-storage.png');
		pin_2_storage.scale.set(pinSize, pinSize, pinSize);
		pin_2_storage.position.set(100, 34, -2);
        pin_2_storage.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-storage.png');
        pin_2_storage.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-storage_on.png');
        self.pinsStage2.add(pin_2_storage);
        */
        /*
        var pin_2_santiago = self.TerminUtils.createSprite('pin_2_santiago', '../libs/terminalia/assets/textures/pins/pin_2-santiago.png');
		pin_2_santiago.scale.set(pinSize, pinSize, pinSize);
		pin_2_santiago.position.set(313, 49, -121);
        pin_2_santiago.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-santiago.png');
        pin_2_santiago.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_2-santiago_on.png');
        self.pinsStage2.add(pin_2_santiago);
        */

        for (var i=0; i<self.pinsStage2.children.length; i++) {
            self.pinsStage2.children[i].material.opacity = 0;
        }

        self.scene.add(self.pinsStage1);
        self.scene.add(self.pinsStage2);
    }

    function addWorldPins() {
        var pinsSize = 0.17;
        /*
        self.test_pin = self.TerminUtils.createSprite('test_pin', '../libs/terminalia/assets/textures/pins/pin_3-v2g.png');
		self.test_pin.scale.set(pinsSize, pinsSize, pinsSize);
		self.test_pin.position.set(-0.039, 0.88, 0.61);
        self.test_pin.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-v2g.png');
        self.test_pin.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-v2g_on.png');
        self.world.add(self.test_pin);
        */


        //DENMARK
		var pin_3_v2g = self.TerminUtils.createSprite('pin_3_v2g', '../libs/terminalia/assets/textures/pins/pin_3-v2g.png');
		pin_3_v2g.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_v2g.position.set(-0.039, 0.90, 0.61);
        pin_3_v2g.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-v2g.png');
        pin_3_v2g.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-v2g_on.png');
		self.world.add(pin_3_v2g);

        //CHILE
		var pin_3_bio = self.TerminUtils.createSprite('pin_3_spain', '../libs/terminalia/assets/textures/pins/pin_3-bio.png');
		pin_3_bio.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_bio.position.set(-1.04, -0.25, 0.17);
        pin_3_bio.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-bio.png');
        pin_3_bio.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-bio_on.png');
		self.world.add(pin_3_bio);

        //ROME
		var pin_3_world = self.TerminUtils.createSprite('pin_3_rome', '../libs/terminalia/assets/textures/pins/pin_3-world.png');
		pin_3_world.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_world.position.set(0.091, 0.64, 0.86);
        pin_3_world.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-world.png');
        pin_3_world.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-world_on.png');
		self.world.add(pin_3_world);

        //MILAN
		var pin_3_smart = self.TerminUtils.createSprite('pin_3_milan', '../libs/terminalia/assets/textures/pins/pin_3-smart.png');
		pin_3_smart.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_smart.position.set(-0.049, 0.74, 0.78);
        pin_3_smart.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-smart.png');
        pin_3_smart.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-smart_on.png');
		self.world.add(pin_3_smart);

        //BERLIN
		var pin_3_germany = self.TerminUtils.createSprite('pin_3_berlin', '../libs/terminalia/assets/textures/pins/pin_3-germany.png');
		pin_3_germany.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_germany.position.set(0.081, 0.80, 0.72);
        pin_3_germany.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-germany.png');
        pin_3_germany.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-germany_on.png');
		self.world.add(pin_3_germany);

        //HONG KONG
		var pin_3_fe = self.TerminUtils.createSprite('pin_3_fe', '../libs/terminalia/assets/textures/pins/pin_3-fe.png');
		pin_3_fe.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_fe.position.set(0.95, 0.39, -0.33);
        pin_3_fe.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-fe.png');
        pin_3_fe.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-fe_on.png');
		self.world.add(pin_3_fe);

        //MEXICO
		var pin_3_solar = self.TerminUtils.createSprite('pin_3_solar', '../libs/terminalia/assets/textures/pins/pin_3-solar.png');
		pin_3_solar.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_solar.position.set(-0.91, 0.38, -0.45);
        pin_3_solar.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-solar.png');
        pin_3_solar.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-solar_on.png');
		self.world.add(pin_3_solar);

        //NEW YORK
        var pin_3_NY = self.TerminUtils.createSprite('pin_3_ny', '../libs/terminalia/assets/textures/pins/pin_3-NY.png');
		pin_3_NY.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_NY.position.set(-0.87, 0.64, -0.009);
        pin_3_NY.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-NY.png');
        pin_3_NY.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-NY_on.png');
        self.world.add(pin_3_NY);

        var pin_3_CA = self.TerminUtils.createSprite('pin_3_ca', '../libs/terminalia/assets/textures/pins/pin_3-germany.png');
		pin_3_CA.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_CA.position.set(-0.71, 0.77, -0.30);
        pin_3_CA.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-germany.png');
        pin_3_CA.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin_3-germany_on.png');
        self.world.add(pin_3_CA);

        //URUGUAY
        var pin_3_uruguay = self.TerminUtils.createSprite('pin_3_uy', '../libs/terminalia/assets/textures/pins/pin3_uruguay.png');
		pin_3_uruguay.scale.set(pinsSize, pinsSize, pinsSize);
		pin_3_uruguay.position.set(-0.93, -0.38, 0.4);
        pin_3_uruguay.material.default_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin3_uruguay.png');
        pin_3_uruguay.material.active_map = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/pins/pin3_uruguay_on.png');
		self.world.add(pin_3_uruguay);

        for (var i=1; i<self.world.children.length; i++) {
            self.world.children[i].material.opacity = 0;
        }
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

		var ambientLight = new THREE.AmbientLight(0xffffff, .4);
        //self.scene.add(ambientLight);

        //We add here a light because custom toon shader needs a light
        var dirLight = new THREE.DirectionalLight(0xffffff, .7);
        dirLight.position.set(0, 100, 25);
        //self.scene.add(dirLight);
        var helper = new THREE.DirectionalLightHelper( dirLight);
        //self.scene.add(helper);

        var pointLight1 = new THREE.PointLight(0xffffff, .2, 23);
        pointLight1.position.x = 22;
        pointLight1.position.y = 0.5;
        pointLight1.position.z = 0;
        var pointLightHelper = new THREE.PointLightHelper(pointLight1, 1);
        self.scene.add(pointLight1);

        var pointLight2 = new THREE.PointLight(0xffffff, .2, 100);
        pointLight2.position.x = -22;
        pointLight2.position.y = .5;
        pointLight2.position.z = 0;
        var pointLight2Helper = new THREE.PointLightHelper(pointLight2, 1);
        self.scene.add(pointLight2);

        var pointLight3 = new THREE.PointLight(0xffffff, .4, 100);
        pointLight3.position.x = 15;
        pointLight3.position.y = 0;
        pointLight3.position.z = 2;
        var pointLight3Helper = new THREE.PointLightHelper(pointLight3, 1);
        self.scene.add(pointLight3);

        var pointLight4 = new THREE.PointLight(0xffffff, .4, 100);
        pointLight4.position.x = -15;
        pointLight4.position.y = 0;
        pointLight4.position.z = 2;
        var pointLight4Helper = new THREE.PointLightHelper(pointLight4, 1);
        self.scene.add(pointLight4);



        if (self.debugMode) {
            self.scene.add(pointLightHelper);
            self.scene.add(pointLight2Helper);
            self.scene.add(pointLight3Helper);
            self.scene.add(pointLight4Helper);
        }

        var toonShader = self.customShaders['LucaUberToonShader'];
        var toonShaderUniforms = THREE.UniformsUtils.clone(toonShader.uniforms);

        var vs = toonShader.vertexShader;
        var fs = toonShader.fragmentShader;

        self.toonMaterial = new THREE.ShaderMaterial({
            uniforms: toonShaderUniforms,
            vertexShader: vs,
            fragmentShader: fs,
            transparent: false
        });

        self.landMaterial = new THREE.MeshBasicMaterial({color: 0x0360fe});
        self.landMaterial.transparent = true;
        self.circuitMaterial = new THREE.MeshBasicMaterial({color: 0x4286F1});
        self.circuitMaterial.transparent = true;

        //0x0555fc
        self.toonMaterial.uniforms.uMaterialColor1.value = new THREE.Color(0xB4CDF9);
        self.toonMaterial.uniforms.uMaterialColor2.value = new THREE.Color(0x4286F1);
        self.toonMaterial.uniforms.uMaterialColor3.value = new THREE.Color(0x0555F9);
        self.toonMaterial.uniforms.uTone1.value = 1.0;
        self.toonMaterial.uniforms.uTone2.value = 1.0;
        self.toonMaterial.uniforms.uAlpha.value = 1.0;
        self.toonMaterial.uniforms.uDirLightPos.value = dirLight.position;
        self.toonMaterial.uniforms.uDirLightColor.value = dirLight.color;

        var circuitPivotMat = new THREE.MeshBasicMaterial();
        circuitPivotMat.transparent = true;
        circuitPivotMat.opacity = 0;
        self.circuitPivot = new THREE.Mesh(new THREE.SphereBufferGeometry(size, 20, 20), circuitPivotMat);
        self.circuitPivot.material.visible = false;

        var x_pos = -125;
        var z_pos = -125;
        var circuit = self.TerminUtils.loadObjModel('Circuit', '../libs/terminalia/assets/models/obj/roma_circuit.obj', self.circuitMaterial);
        circuit.scale.set(40, 40, 40);
        circuit.rotation.set(0, radians(0), 0);
        circuit.position.set(x_pos, (size * offset) + 1, z_pos);

        var circuit_land = self.TerminUtils.loadObjModel('Circuit', '../libs/terminalia/assets/models/obj/roma_circuit_land.obj', self.landMaterial);
        circuit_land.scale.set(40, 40, 40);
        circuit_land.rotation.set(0, radians(0), 0);
        circuit_land.position.set(x_pos, (size * offset) - 1.1, z_pos);

        var circuit_land_toon = self.TerminUtils.loadObjModel('Circuit', '../libs/terminalia/assets/models/obj/roma_circuit_toon.obj', self.toonMaterial);
        circuit_land_toon.scale.set(40, 40, 40);
        circuit_land_toon.rotation.set(0, radians(0), 0);
        circuit_land_toon.position.set(x_pos, (size * offset), z_pos);

        self.circuitPivot.add(circuit);
        self.circuitPivot.add(circuit_land);
        self.circuitPivot.add(circuit_land_toon);
        self.circuitPivot.position.set(0, -size, 0);
        self.scene.add(self.circuitPivot);
    }

    function addWorld(size) {

        var worldPivotMat = new THREE.MeshBasicMaterial();
        self.worldPivot = new THREE.Mesh(new THREE.SphereBufferGeometry(size, 20, 20), worldPivotMat);
        self.worldPivot.material.visible = false;
        self.worldPivot.position.set(0, -size, 0);
        self.scene.add(self.worldPivot);

        var worldTexture = self.TerminUtils.createTexture('../libs/terminalia/assets/textures/world-tex-4096.jpg');
        worldTexture.magFilter = THREE.NearestFilter;
        worldTexture.minFilter = THREE.LinearMipMapLinearFilter;
        var worldMaterial = new THREE.MeshBasicMaterial({map: worldTexture});
        worldMaterial.transparent = true;
        worldMaterial.opacity = 0;
        self.world = self.TerminUtils.loadObjModel('World', '../libs/terminalia/assets/models/obj/World2.obj', worldMaterial);
        self.world.scale.set(size, size, size);
        //self.world.position.set(0, -size, 0);
        self.spaceBall.addRotationToObject(self.world);
        self.worldPivot.add(self.world);
    }

    //Called when card has changed on screen
    function highlightPin(stage, pin) {
        switch(stage)
        {
            case 'StageStart':
                for (var i=0; i<self.pinsStage1.children.length; i++) {
                    if (self.pinsStage1.children[i].name !== pin) {
                        self.pinsStage1.children[i].visible = false;
                    }
                    else {
                        self.pinsStage1.children[i].visible = true;
                        self.pinsStage1.children[i].material.map = self.pinsStage1.children[i].material.active_map;
                    }
                }
            break;

            case 'StageCircuit':
                for (var i=0; i<self.pinsStage2.children.length; i++) {
                    if (self.pinsStage2.children[i].name !== pin) {
                        self.pinsStage2.children[i].visible = false;
                    }
                    else {
                        self.pinsStage2.children[i].visible = true;
                        self.pinsStage2.children[i].material.map = self.pinsStage2.children[i].material.active_map;
                    }
                }
            break;

            case 'StageFinal':
                for (var i=1; i<self.world.children.length; i++) {
                    if (self.world.children[i].name !== pin) {
                        self.world.children[i].visible = false;
                    }
                    else {
                        self.world.children[i].visible = true;
                        self.world.children[i].material.map = self.world.children[i].material.active_map;
                    }
                }
            break;
        }
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

    function startWorldAnimation(new_rot_x) {
        self.spaceBall.pinInterpolating = true;
        self.spaceBall.targetRot = new_rot_x;
    }

    function startStageAnimation(stage) {
        //Before starting any animation we have to create the actual stageAnimation
        if (self.animationCreated === false) {
            addWorldPins();
            createStageAnimations();
            self.animationCreated = true;
        }

        //Reset pins from active to default state
        resetPinsVisibility()

        switch(stage)
        {
            case 1:
            self.stageAnimation.tweenFromTo(self.currentState, 'StageStart', {onComplete: function() {
                var event = new CustomEvent("StageTimeLineEnded", {"detail": self.currentState});
                window.dispatchEvent(event);
            }});
            self.currentState = 'StageStart'
            break;

            case 2:
            self.stageAnimation.tweenFromTo(self.currentState, 'StageCircuit', {onComplete: function() {
                var event = new CustomEvent("StageTimeLineEnded", {"detail": self.currentState});
                window.dispatchEvent(event);
            }});
            self.currentState = 'StageCircuit'
            break;

            case 3:
            self.stageAnimation.tweenFromTo(self.currentState, 'StageFinal', {
                onComplete: function() {
                    var event = new CustomEvent("StageTimeLineEnded", {"detail": self.currentState});
                    window.dispatchEvent(event);
                }});
            self.currentState = 'StageFinal'
            break;
        }
    }

    function resetPinsVisibility(visibility) {
      for (var i=0; i<self.pinsStage1.children.length; i++) {
        self.pinsStage1.children[i].material.map = self.pinsStage1.children[i].material.default_map;
        if (visibility !== undefined) self.pinsStage1.children[i].visible = visibility;
      }
      for (var i=0; i<self.pinsStage2.children.length; i++) {
        self.pinsStage2.children[i].material.map = self.pinsStage2.children[i].material.default_map;
        if (visibility !== undefined) self.pinsStage2.children[i].visible = visibility;
      }
      for (var i=1; i<self.world.children.length; i++) {
        self.world.children[i].material.map = self.world.children[i].material.default_map;
        if (visibility !== undefined) self.world.children[i].visible = visibility;
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
        newCameraPos = new THREE.Vector3(-210, 442, 599);
        self.stageAnimation.addLabel("StageStart");
        //1. rotate circuit 360
        self.stageAnimation.add(TweenLite.to(self.circuitPivot.rotation, 2, {x: 0, y: radians(360), z: 0, delay: 0,  ease: Power4.easeInOut}), "StageStart");
        //2. show pins
        self.stageAnimation.add(TweenLite.to(self.pinsStage2.children[0].material, 0.1, {opacity: 1, onUpdate: function() {
            for (var i=0; i<self.pinsStage2.children.length; i++) {
                self.pinsStage2.children[i].material.opacity = self.pinsStage2.children[0].material.opacity;
            }
        }}));
        //3. zoom out camera
        self.stageAnimation.add(TweenLite.to(self.camera.position, 2, {x: newCameraPos.x, y: newCameraPos.y, z: newCameraPos.z, delay: 0, ease: Power1.easeInOut, onUpdate: function() {
            self.orbit_controls.update()
        }}), "StageStart");

        //STAGE 3
        newCameraPos = new THREE.Vector3(-678, 2891, 18251);
        self.stageAnimation.addLabel("StageCircuit");
        self.stageAnimation.add(TweenLite.to(self.scene.fog, 1, {far: 0}), "StageCircuit");
        //Hide circuit land depth
        //self.stageAnimation.add(TweenLite.to(self.toonMaterial.uniforms.uAlpha, 1, {value: 0.0}), "StageCircuit");
        self.stageAnimation.add(TweenLite.to(self.toonMaterial, 1, {opacity: 0}), "StageCircuit");
        //Hide circuit land
        self.stageAnimation.add(TweenLite.to(self.landMaterial, 1, {opacity: 0}), "StageCircuit");
        //Hide circuit
        self.stageAnimation.add(TweenLite.to(self.circuitMaterial, 1, {opacity: 0}), "StageCircuit");
        //Make world visible by changing its opacity
        self.stageAnimation.add(TweenLite.to(self.world.children[0].children[0].material, 1, {opacity: 1}));

        //Show pins
        self.stageAnimation.add(TweenLite.to(self.world.children[1].material, 1, {opacity: 1, onUpdate: function() {
            for (var i=2; i<self.world.children.length; i++) {
                self.world.children[i].material.opacity = self.world.children[1].material.opacity;
            }
        }}));
        //Rotate circuit behind the world
        self.stageAnimation.add(TweenLite.to(self.circuitPivot.rotation, 1, {x: radians(-30), y: 0, z: 0, delay: 1, ease: Power1.easeInOut}), 'StageCircuit');
        //Rotate world
        self.stageAnimation.add(TweenLite.to(self.worldPivot.rotation, 3, {x: radians(360), y: 0, z: radians(360), delay: 1, ease: Power1.easeInOut}), 'StageCircuit');
        //self.stageAnimation.add(TweenLite.to(self.world.rotation, 3, {x: radians(360), y: 0, z: radians(360), delay: 1, ease: Power1.easeInOut}), 'StageCircuit');
        //Move World
        self.stageAnimation.add(TweenLite.to(self.worldPivot.position, 2, {x: -3150, y: 0, z: 0, delay: 1, ease: Power1.easeInOut}), 'StageCircuit');
        //self.stageAnimation.add(TweenLite.to(self.world.position, 2, {x: -4000, y: -1500, z: 0, delay: 1, ease: Power1.easeInOut}), 'StageCircuit');

        //Put camera on the left of the screen
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

    function radians(degrees) {
        return degrees * Math.PI / 180;
    }

    function getCameraPosition() {
        console.log(self.camera.position);
    }

    function getWorldRotation() {
        console.log(self.spaceBall.currentAngle);
    }

	function movePins(x, y, z) {
		self.test_pin.position.x += x;
		self.test_pin.position.y += y;
		self.test_pin.position.z += z;

		console.log(self.test_pin.position);
	}

    function enableStage3AutoRotateAnimation(enabled) {
        self.spaceBall.pinInterpolating = false;
        self.spaceBall.autoRotate = enabled;
    }

    function enableStage1Stage2AutoRotateAnimation(enabled) {
        self.orbit_controls.autoRotate = enabled;
    }

    this.render = render;
    this.resize = resize;
    this.findObjectOnClick = findObjectOnClick;
    this.startCameraAnimation = startCameraAnimation;
    this.startStageAnimation = startStageAnimation;
    this.startWorldAnimation = startWorldAnimation;
    this.getCameraPosition = getCameraPosition;
    this.createStageAnimations = createStageAnimations;
    this.getWorldRotation = getWorldRotation;
    this.movePins = movePins;
    this.highlightPin = highlightPin;
    this.resetPinsVisibility = resetPinsVisibility;
    this.enableStage3AutoRotateAnimation = enableStage3AutoRotateAnimation;
    this.enableStage1Stage2AutoRotateAnimation = enableStage1Stage2AutoRotateAnimation;
}
