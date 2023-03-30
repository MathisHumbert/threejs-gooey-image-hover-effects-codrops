precision mediump float;

#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)

uniform sampler2D uImage;
uniform sampler2D uImageHover;
uniform float uTime;
uniform float uHover;
uniform float uAlpha;
uniform float uZoomed;

varying vec2 vUv;

void main(){
	float time = uTime * 0.05;

	// custom noise effect
 	float offx = vUv.x * 0.3 - time * 0.3;
	float offy = vUv.y + sin(vUv.x * 5.) * 0.1 - sin(time * 0.5) + snoise3(vec3(vUv.x, vUv.y, time) * 0.5);

	offx += snoise3(vec3(offx, offy, time) * 5.) * 0.3;
	offy += snoise3(vec3(offx, offy, time) * 0.3) * 0.1;

	float nc = snoise3(vec3(offx, offy, time * 0.5) * 8.) * uHover;
	float nh = snoise3(vec3(offx, offy, time * 0.5) * 2.) * 0.03;

  nh *= smoothstep(nh, 0.5, 0.6);

	// img
	vec4 image = texture2D(uImage, vUv + vec2(nc + nh) * uHover);
	vec4 imageHover = texture2D(uImageHover, vUv + vec2(nc + nh) * uHover);

	vec4 finalImage = mix(image, imageHover, clamp(nh + uHover + uZoomed, 0., 1.));

	gl_FragColor = vec4(finalImage.rgb, uAlpha);
}