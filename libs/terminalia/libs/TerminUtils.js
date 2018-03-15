window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.TerminUtils = function TerminUtils() {

    var self = this;
    this.loadingManager = new THREE.LoadingManager();
    this.objLoader = new THREE.OBJLoader(this.loadingManager);
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.cubeTextureLoaderHDR = new THREE.HDRCubeTextureLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.raycaster = new THREE.Raycaster();
    this.hdrCubeRenderTarget = null;
    //this.rayCaster.ray.direction.set(0, -1, 0);

    self.loadingManager.onLoad = function() {
      var event = new CustomEvent("AssetsLoaded");
      window.dispatchEvent(event);
      console.log("ALL IS COMPLETE");
    }

    function loadObjModel(name, objFile, material) {
        var container = new THREE.Group();
        self.objLoader.load(objFile, function(object) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
					child.name = name;
                    child.material = material;
                }
            });
            container.add(object);
        });

        return container;
    }

    function raycastSprites(mouse, camera, callback) {
        self.rayCaster.setFromCamera(mouse, camera);
        var intersects = self.rayCaster.intersectObjects(scene.children);
        if (intersects.length > 0) {
            if (intersects[0].object.type === 'Sprite') {
                if (callback) {
                    callback(intersects[0].object);
                }
            }
        }
    }

    //Custom ray picking function that works with scaled objects
    function rayPickObject(x, y, width, height, camera, objects) {
        //Convert 2D mouse coords to NDC
        var vector = new THREE.Vector3( ( x / width ) * 2 - 1, - ( y / height ) * 2 + 1, 0.5 );
        vector.unproject(camera);

        self.raycaster.ray.set(camera.position, vector.sub(camera.position).normalize());
        self.raycaster.linePrecision = 0.2;

        //Find distance from camera for every object
        var intersected = undefined;
        var intersections = self.raycaster.intersectObjects(objects, true);
        for (var i=0; i<intersections.length; i++) {
            var I = intersections[i];
            I.distance = camera.position.distanceTo(I.point);
        }

        //Sort objects by their distance from camera
        intersections.sort(function(a, b) {
            return a.distance - b.distance;
        });

        //Return the first object
        if (intersections.length > 0) {
            intersected = intersections[0].object;
            //console.log("Found: ", intersected.name);
        }

        return intersected;
    }

    function createTextureReflectiveMaterial(texture_file, environment_map, reflectivity_amount) {
        var material = createTextureMaterial(texture_file);
        material.envMap = environment_map;
        material.combine = THREE.MixOperation;
        material.reflectivity = reflectivity_amount;

        return material;
    }

    function createTextureMaterial(texture_file) {
        var texture = createTexture(texture_file);
        var material = new THREE.MeshPhongMaterial({ map: texture});

        return material;
    }

    function createSprite(name, texture_file) {
        var iconTexture = self.createTexture(texture_file);
        var iconMat = new THREE.SpriteMaterial( { map: iconTexture, color: 0xffffff } );
        var sprite = new THREE.Sprite( iconMat );
        sprite.name = name;

        return sprite;
    }

    function createCubeMapTexture(path, format) {
        var urls = [
            path + 'posx' + format,
            path + 'negx' + format,
            path + 'posy' + format,
            path + 'negy' + format,
            path + 'posz' + format,
            path + 'negz' + format
        ];

        var cubeTexture = self.cubeTextureLoader.load(urls);
        return cubeTexture;
    }

    function createCubeMapTextureHDR(path, format, renderer, materials) {
        var urls = [
            path + 'px' + format, 
            path + 'nx' + format,
            path + 'py' + format, 
            path + 'ny' + format,
            path + 'pz' + format, 
            path + 'nz' + format
        ];

        self.cubeTextureLoaderHDR.load( THREE.UnsignedByteType, urls, function ( hdrCubeMap ) {

            var pmremGenerator = new THREE.PMREMGenerator( hdrCubeMap );
            pmremGenerator.update( renderer );
            var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker( pmremGenerator.cubeLods );
            pmremCubeUVPacker.update( renderer );
            hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;
            
            if (materials.length > 0) {
                for (var i=0; i<materials.length; i++) {
                    materials[i].envMap = hdrCubeRenderTarget.texture;
                    materials[i].needsUpdate = true;
                }
            }
        });
    }

    function createTexture(textureFile) {
        var texture = self.textureLoader.load(textureFile);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        return texture;
    }

    function createRGBColor(r, g, b) {
        return new THREE.Color('rgb(' + r + ',' + g + ',' + b + ')');
    }

    function createRandomColor() {
        var r = randomIntFromInterval(0, 255);
        var g = randomIntFromInterval(0, 255);
        var b = randomIntFromInterval(0, 255);

        return createRGBColor(r, g, b);
    }

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function degToRad(angle_deg) {
        return angle_deg * (Math.PI/180);
    }

    this.loadObjModel = loadObjModel;
    this.createTextureMaterial = createTextureMaterial;
    this.createTextureReflectiveMaterial = createTextureReflectiveMaterial;
    this.createSprite = createSprite;
    this.createCubeMapTexture = createCubeMapTexture;
    this.createRGBColor = createRGBColor;
    this.randomIntFromInterval = randomIntFromInterval;
    this.createRandomColor = createRandomColor;
    this.createTexture = createTexture;
    this.degToRad = degToRad;
    this.raycastSprites = raycastSprites;
    this.rayPickObject = rayPickObject;
    this.createCubeMapTextureHDR = createCubeMapTextureHDR;
}

