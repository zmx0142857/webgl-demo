precision mediump float;

attribute vec4 aPosition;
attribute vec3 aNormal;

uniform vec3 uLightPosition;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vSurfaceToLight;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;

    vNormal = mat3(uNormalMatrix) * aNormal;

    vec3 surfacePosition = (aPosition).xyz;
    vSurfaceToLight = uLightPosition - surfacePosition;
}