precision mediump float;

varying vec3 vNormal;
varying vec3 vSurfaceToLight;

uniform vec4 uColor;

void main() {
    // because vNormal is a varying it's interpolated
    // so it will not be a unit vector. Normalizing it
    // will make it a unit vector again
    vec3 normal = normalize(vNormal);
    vec3 surfaceToLight = normalize(vSurfaceToLight);
    float light = dot(normal, surfaceToLight);

    gl_FragColor = uColor;
    gl_FragColor.rgb *= light;
}