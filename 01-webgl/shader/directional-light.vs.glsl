precision mediump float;

attribute vec3 aVertexNormal;
attribute vec3 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec4 vColor;
varying vec3 vLighting;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vColor = aVertexColor;

  // Apply lighting effect
  vec3 ambientLight = vec3(0.6, 0.6, 0.6);
  vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);
  vec3 directionalVector = vec3(0.85, 0.8, 0.75);

  vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  vLighting = ambientLight + (directionalLightColor * directional);
}