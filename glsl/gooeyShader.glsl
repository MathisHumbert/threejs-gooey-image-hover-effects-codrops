precision mediump float;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D uImage;
uniform sampler2D uImageHover;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uRes;
uniform float uHover;

varying vec2 vUv;

float circle(in vec2 _st, in float _radius, in float blurriness){
	vec2 dist = _st;
	return 1.-smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
}

void main(){
  // We manage the device ratio by passing PR constant
	vec2 res = uRes * PR;
	vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
  // tip: use the following formula to keep the good ratio of your coordinates
	st.y *= uRes.y / uRes.x;

  // We readjust the mouse coordinates
	vec2 mouse = uMouse * -0.5;
	// tip2: do the same for your mouse
	mouse.y *= uRes.y / uRes.x;

  vec2 circlePos = (st + mouse) * 5.;
	float c = circle(circlePos, 0.3, 2.) * 2.5;

  float offx = vUv.x + sin(vUv.y + uTime * 0.1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * 0.001) * 0.01;
  float n = snoise3(vec3(offx, offy, uTime * 0.1) * 8.) - 1.;

  float finalMask = smoothstep(0.4, 0.5, n + pow(c, 2.)) * uHover;
  
  vec4 image = texture2D(uImage, vUv);
  vec4 imageHover = texture2D(uImageHover, vUv);
  vec4 finalImage = mix(image, imageHover, finalMask);

  gl_FragColor = vec4(vec3(finalImage),  1.);
  // gl_FragColor = image;
}