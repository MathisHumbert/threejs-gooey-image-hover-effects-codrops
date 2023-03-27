precision mediump float;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D uImage;
uniform sampler2D uImageHover;
uniform vec2 uMouse;
uniform float uTime;
uniform vec2 uRes;
uniform float uHover;
uniform sampler2D uShape;

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

	// create shape
	vec2 shapeUv = circlePos ;
	shapeUv *= 1.5 - uHover * 0.8;
	shapeUv /= uHover;
	shapeUv += vec2(0.5);

	vec4 shape = texture2D(uShape, shapeUv);

	float shapeX = shape.x * 3.;
	float offx = vUv.x + uTime;
	float offy = vUv.y + uTime * 0.1 * cos(uTime * 0.1);
	float noise = snoise3(vec3(offx, offy, uTime * 0.005) * 2.5);

  float finalMask = 1. - smoothstep(0.99, 1., pow(shapeX, 3.) * 4. + noise);

	// custom uv for img 
	vec2 imageUv = vUv;
	imageUv -= vec2(0.5);
	imageUv *= 1. - uHover * 0.03;
	imageUv += vec2(0.5);

	vec2 imageHoverUv = vUv;
	imageHoverUv -= vec2(0.5);
	imageHoverUv *= 1. - uHover * 0.05;
	imageHoverUv += vec2(0.5);

	// img
	vec4 image = texture2D(uImage, imageUv + mouse * 0.05 * uHover);
	vec4 imageHover = texture2D(uImageHover, imageHoverUv  + mouse * 0.5 * uHover);

	vec4 finalImage = mix(image, imageHover, finalMask);

	gl_FragColor = finalImage;
}