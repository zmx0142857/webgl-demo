precision mediump float;

uniform float uAmbientLight;
uniform float uDirectionalLight;
uniform float uPointLight;

varying float vDirectionalLight;
varying vec3 vNormal;
varying vec3 vSurfaceToLight;

void main(void) {

  gl_FragColor = vec4(0.1, 0.8, 0.1, 1);

  float ambientLight = uAmbientLight;
  float directionalLight = uDirectionalLight * vDirectionalLight;

  // 点光源 (第二部分)
  vec3 normal = normalize(vNormal);
  vec3 surfaceToLight = normalize(vSurfaceToLight);
  float pointLight = uPointLight * max(dot(normal, surfaceToLight), 0.0);

  gl_FragColor.rgb *= ambientLight + directionalLight + pointLight;
}