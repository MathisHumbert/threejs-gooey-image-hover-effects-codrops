precision mediump float;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D uImage;
uniform sampler2D uImageHover;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uRes;
uniform float uHover;
uniform float uAlpha;

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

	// rounded corner shape
	float grd = 0.1 * uHover;
	float sqr = 100. *(smoothstep(0., grd, vUv.x) - smoothstep(1. - grd, 1., vUv.x)) * (smoothstep(0., grd, vUv.y) - smoothstep(1. - grd, 1., vUv.y)) - 10.;

	float circle = createCircle(circlePos, 0.04 * uHover, 2.) * 50.;

	float finalMask = smoothstep(0., 0.1, sqr - circle);

	// transition shape
	float shape = (vUv.x + vUv.y - 2. + uHover * 3.) * 2.;
	float midShape = (vUv.x + vUv.y - 2. + 0.5 * 3.) * 3.;

	float offx = vUv.x + vUv.y;
	float offy = vUv.y - vUv.x;

	float noise = snoise3(vec3(offx, offy, uTime) * 4.) * 0.75;

	float pct = smoothstep(0.99, 1., noise + shape);

	// custom uv for img 
	vec2 imageUv = vUv;
	imageUv -= vec2(0.5);
	imageUv *= 1. - uHover * 0.2;
	imageUv += vec2(0.5);

	vec2 imageHoverUv = vUv;
	imageHoverUv -= vec2(0.5);
	imageHoverUv *= 1. - uHover * 0.1;
	imageHoverUv += vec2(0.5);

	// img
	vec4 image = texture2D(uImage, imageUv);
	vec4 imageHover = texture2D(uImageHover, imageHoverUv + uMouse * 0.1 * uHover);

	vec4 finalImage = mix(image, imageHover, pct);

	gl_FragColor = vec4(finalImage.rgb, uAlpha * finalMask);
}