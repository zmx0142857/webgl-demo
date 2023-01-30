precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightPosition;
uniform vec3 uLightDirection;

varying float vDirectionalLight;
varying vec3 vNormal;
varying vec3 vSurfaceToLight;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);

  // 法向
  vec3 normal = normalize(mat3(uNormalMatrix) * aNormal);
  vNormal = normal;

  // 环境光
  float ambientLight = 0.2;

  // 方向光
  vec3 lightDirection = normalize(uLightDirection);
  vDirectionalLight = max(dot(normal, lightDirection), 0.0);
  
  // 点光源 (第一部分)
  vec3 lightPosition = (uModelViewMatrix * vec4(uLightPosition, 1)).xyz;
  vSurfaceToLight = lightPosition - aPosition;
}