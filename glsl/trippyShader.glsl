precision mediump float;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D uImage;
uniform sampler2D uImageHover;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uRes;
uniform float uHover;

varying vec2 vUv;

float createCircle(in vec2 _st, in float _radius, in float blurriness){
	vec2 dist = _st;
	return 1.-smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
}

void main(){
	vec2 res = uRes * PR;
	vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
	st.y *= uRes.y / uRes.x;

	vec2 mouse = uMouse * -0.5;
	mouse.y *= uRes.y / uRes.x;

  vec2 circlePos = (st + mouse) * 5.;
	float circle = createCircle(circlePos, 0.1 * uHover, 5.) * 1.5;

  float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float noiseCircle = snoise3(vec3(offx, offy, uTime * 0.1) * 8.) * uHover;
  float noiseHover = snoise3(vec3(offx, offy, uTime * 0.1) * 2.) * 0.03;

  vec2 newUv = vUv;
  newUv -= vec2(0.5);
  newUv *= 1. - uHover * 0.2;
  newUv += vec2(0.5);

  vec4 image = texture2D(uImageHover, vUv);
  vec4 imageDistorted = texture2D(uImage, newUv + vec2(noiseHover) * uHover);

  float finalMask = smoothstep(0.99, 1., pow(circle, 2.) * 4. + noiseCircle);
  vec4 finalImage = mix(imageDistorted, image, finalMask);

  gl_FragColor = finalImage;
}