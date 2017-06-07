window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.TerminUtils = function TerminUtils() {
    
    var self = this;
    this.objLoader = new THREE.OBJLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.rayCaster = new THREE.Raycaster();
    this.rayCaster.ray.direction.set(0, -1, 0);

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

    function createTexture(textureFile) {
        var texture = self.textureLoader.load(textureFile);

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
}

