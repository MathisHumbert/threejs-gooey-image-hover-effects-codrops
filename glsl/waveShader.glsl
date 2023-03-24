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
	vec2 res = uRes * PR;
  float time = uTime * 0.05;
  float progressHover = uHover;
  float progress = 0.;
  vec2 uv = vUv;

	vec2 st = gl_FragCoord.xy / res.xy - vec2(0.5);
	st.y *= uRes.y / uRes.x;

	vec2 mouse = uMouse * -0.5;
	mouse.y *= uRes.y / uRes.x;

  vec2 circlePos = (st + mouse) * 5.;
	float c = circle(circlePos, 0.3, 2.) * 2.5;

  float offX = uv.x * .3 - time * 0.3;
  float offY = uv.y + sin(uv.x * 5.) * .1 - sin(time * 0.5) + snoise3(vec3(uv.x, uv.y, time) * 0.5);
  offX += snoise3(vec3(offX, offY, time) * 5.) * .3;
  offY += snoise3(vec3(offX, offX, time * 0.3)) * .1;
  float nc = (snoise3(vec3(offX, offY, time * .5) * 8.)) * progressHover;
  float nh = (snoise3(vec3(offX, offY, time * .5 ) * 2.)) * .03;

  nh *= smoothstep(nh, 0.5, 0.6);

  vec4 image = texture2D(uImage, uv + vec2(nc + nh) * progressHover);
  vec4 imageHover = texture2D(uImageHover, uv + vec2(nc + nh) * progressHover);

  vec4 finalImage = mix(image, imageHover, clamp(nh + progressHover, 0., 1.) );

  gl_FragColor = finalImage;
}