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

	// rounded corner shape
	float grd = 0.1 * uHover;
  float sqr = 100. * (smoothstep(0., grd, vUv.x) - smoothstep(1. - grd, 1., vUv.x)) * (smoothstep(0., grd, vUv.y) - smoothstep(1. - grd, 1., vUv.y)) -10.;

	// circle 
  vec2 circlePos = st + mouse;
	float circle = createCircle(circlePos, 0.005 * uHover, 2.);
	float sqrCircle = createCircle(circlePos, .04 * uHover, 2.) * 50.;

	// custom noise effect
	float offx = vUv.x + sin(vUv.y + uTime * .1);
  float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

  float noiseCircle = snoise3(vec3(offx, offy, uTime * 0.1) * 8.) * uHover;
  float noiseHover = snoise3(vec3(offx, offy, uTime * 0.1) * 2.) * 0.1;

  circle = smoothstep(.1, .8, circle * 5. + noiseCircle * 3. - 1.);

	float finalMask = smoothstep(.0, 0.1, sqr - sqrCircle);

	// custom uv for img 
	vec2 imageUv = vUv;
	imageUv -= vec2(0.5);
	imageUv *= 1. - uHover * 0.2;
	imageUv += mouse * 0.1 * uHover;
	imageUv += vec2(0.5);

	vec2 imageHoverUv = vUv;
	imageHoverUv -= vec2(0.5);
	imageHoverUv *= 1. * uHover * 0.1;
	imageHoverUv += vec2(0.5);

	vec4 color = vec4(0.0314, 0.0314, 0.2235, 1.);

	// img 
	vec4 image = texture2D(uImage, imageUv);
	vec4 imageHover = texture2D(uImageHover, imageHoverUv + vec2(noiseHover) * uHover);
	imageHover = mix(imageHover, imageHover * color, 0.8);

	vec4 finalImage = mix(image, imageHover, clamp(circle, 0., 1.));

	gl_FragColor = vec4(finalImage.rgb, uAlpha * finalMask);
}