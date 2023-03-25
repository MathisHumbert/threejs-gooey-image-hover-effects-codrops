precision mediump float;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
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

  vec2 circlePos = st + mouse;

	float grd = 0.1 * uHover;
	float sqr = 100. *(smoothstep(0., grd, vUv.x) - smoothstep(1. - grd, 1., vUv.x)) * (smoothstep(0., grd, vUv.y) - smoothstep(1. - grd, 1., vUv.y)) - 10.;

	float circle = createCircle(circlePos, 0.04 * uHover, 2.) * 50.;

	float finalMask = smoothstep(0., 0.1, sqr - circle);

	vec4 image = texture2D(uImage, vUv);
	vec4 imageHover = texture2D(uImageHover, vUv);

	vec4 finalImage = mix(image, imageHover, uHover);

	gl_FragColor = vec4(finalImage.rgb, finalMask);
}