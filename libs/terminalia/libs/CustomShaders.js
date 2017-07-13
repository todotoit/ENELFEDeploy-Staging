window.TERMINALIA = window.TERMINALIA || {};

TERMINALIA.CustomShaders = {

    'ToonShader': {

        uniforms: {
            uMaterialColor: { value: new THREE.Vector3(1, 0, 0) },
            uTone1: { value: 0.3},
            uTone2: { value: 0.3},
            uDirLightPos: { value: new THREE.Vector3()},
            uDirLightColor: { value: new THREE.Color(0xffffff)}
        },

        vertexShader: [
            "varying vec3 vNormal;",

            "void main() {",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
                "vNormal = normalize(normalMatrix * normal);",
                "vec4 modelViewPos = modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [
            "varying vec3 vNormal;",
            
            "uniform vec3 uMaterialColor;",
            "uniform vec3 uDirLightPos;",
            "uniform vec3 uDirLightColor;",
            "uniform float uTone1;",
            "uniform float uTone2;",
            
            "void main() {",
                "vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
                "vec3 lVector = normalize( lDirection.xyz );",
                "vec3 normal = normalize( vNormal );",

                "float diffuse = dot( normal, lVector );",
                "if (diffuse > 0.6) { diffuse = 1.0; }",
                "else if (diffuse > -0.2) { diffuse = uTone1; }",
                "else { diffuse = uTone2; }",

                "gl_FragColor = vec4(uMaterialColor * uDirLightColor * diffuse, 1);",
            "}"
        ].join("\n")
    },

    'LucaUberToonShader': {
        uniforms: {
            uMaterialColor1: { value: new THREE.Vector3(1, 0, 0) },
            uMaterialColor2: { value: new THREE.Vector3(1, 0, 0) },
            uMaterialColor3: { value: new THREE.Vector3(1, 0, 0) },
            uTone1: { value: 0.3},
            uTone2: { value: 0.3},
            uAlpha: { value: 1.0},
            uDirLightPos: { value: new THREE.Vector3()},
            uDirLightColor: { value: new THREE.Color(0xffffff)}
        },

        vertexShader: [
            "varying vec3 vNormal;",

            "void main() {",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
                "vNormal = normalize(normalMatrix * normal);",
                "vec4 modelViewPos = modelViewMatrix * vec4(position, 1.0);",
            "}"
        ].join("\n"),

        fragmentShader: [
            "varying vec3 vNormal;",
            
            "uniform vec3 uMaterialColor1;",
            "uniform vec3 uMaterialColor2;",
            "uniform vec3 uMaterialColor3;",
            "uniform vec3 uDirLightPos;",
            "uniform vec3 uDirLightColor;",
            "uniform float uTone1;",
            "uniform float uTone2;",
            "uniform float uAlpha;",
            
            "void main() {",
                "vec4 lDirection = viewMatrix * vec4( uDirLightPos, 0.0 );",
                "vec3 lVector = normalize( lDirection.xyz );",
                "vec3 normal = normalize( vNormal );",
                "vec3 currentColor;",

                "float diffuse = dot( normal, lVector );",
                "if (diffuse > 0.6) { diffuse = 1.0; currentColor = uMaterialColor1; }",
                "else if (diffuse > -0.2) { diffuse = uTone1; currentColor = uMaterialColor2; }",
                "else { diffuse = uTone2; currentColor = uMaterialColor3; }",

                "gl_FragColor = vec4(currentColor * uDirLightColor * diffuse, 1);",
                //"gl_FragColor.a = uAlpha;",
            "}"
        ].join("\n")
    }
};