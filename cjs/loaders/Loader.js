Object.defineProperty(exports, '__esModule', {
	value: true
});

var _mathVector2 = require('../math/Vector2');

var _Three = require('../Three');

var _mathMath = require('../math/Math');

var _texturesTexture = require('../textures/Texture');

var _ImageLoader = require('./ImageLoader');

var _materialsShaderMaterial = require('../materials/ShaderMaterial');

/**
 * @author alteredq / http://alteredqualia.com/
 */

function THREE$Loader() {
	this.isLoader = true;

	this.onLoadStart = function () {};
	this.onLoadProgress = function () {};
	this.onLoadComplete = function () {};
};

THREE$Loader.prototype = {

	constructor: THREE$Loader,

	crossOrigin: undefined,

	extractUrlBase: function (url) {

		var parts = url.split('/');

		if (parts.length === 1) return './';

		parts.pop();

		return parts.join('/') + '/';
	},

	initMaterials: function (materials, texturePath, crossOrigin) {

		var array = [];

		for (var i = 0; i < materials.length; ++i) {

			array[i] = this.createMaterial(materials[i], texturePath, crossOrigin);
		}

		return array;
	},

	needsTangents: function (materials) {

		for (var i = 0, il = materials.length; i < il; i++) {

			var m = materials[i];

			if (m && m.isShaderMaterial) return true;
		}

		return false;
	},

	createMaterial: (function () {

		var imageLoader;

		return function createMaterial(m, texturePath, crossOrigin) {

			var scope = this;

			if (crossOrigin === undefined && scope.crossOrigin !== undefined) crossOrigin = scope.crossOrigin;

			if (imageLoader === undefined) imageLoader = new _ImageLoader.THREE$ImageLoader();

			function nearest_pow2(n) {

				var l = Math.log(n) / Math.LN2;
				return Math.pow(2, Math.round(l));
			}

			function create_texture(where, name, sourceFile, repeat, offset, wrap, anisotropy) {

				var fullPath = texturePath + sourceFile;

				var texture;

				var loader = THREE$Loader.Handlers.get(fullPath);

				if (loader !== null) {

					texture = loader.load(fullPath);
				} else {

					texture = new _texturesTexture.THREE$Texture();

					loader = imageLoader;
					loader.setCrossOrigin(crossOrigin);
					loader.load(fullPath, function (image) {

						if (_mathMath.THREE$Math.isPowerOfTwo(image.width) === false || _mathMath.THREE$Math.isPowerOfTwo(image.height) === false) {

							var width = nearest_pow2(image.width);
							var height = nearest_pow2(image.height);

							var canvas = document.createElement('canvas');
							canvas.width = width;
							canvas.height = height;

							var context = canvas.getContext('2d');
							context.drawImage(image, 0, 0, width, height);

							texture.image = canvas;
						} else {

							texture.image = image;
						}

						texture.needsUpdate = true;
					});
				}

				texture.sourceFile = sourceFile;

				if (repeat) {

					texture.repeat.set(repeat[0], repeat[1]);

					if (repeat[0] !== 1) texture.wrapS = _Three.THREE$RepeatWrapping;
					if (repeat[1] !== 1) texture.wrapT = _Three.THREE$RepeatWrapping;
				}

				if (offset) {

					texture.offset.set(offset[0], offset[1]);
				}

				if (wrap) {

					var wrapMap = {
						'repeat': _Three.THREE$RepeatWrapping,
						'mirror': _Three.THREE$MirroredRepeatWrapping
					};

					if (wrapMap[wrap[0]] !== undefined) texture.wrapS = wrapMap[wrap[0]];
					if (wrapMap[wrap[1]] !== undefined) texture.wrapT = wrapMap[wrap[1]];
				}

				if (anisotropy) {

					texture.anisotropy = anisotropy;
				}

				where[name] = texture;
			}

			function rgb2hex(rgb) {

				return (rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + rgb[2] * 255;
			}

			// defaults

			var mtype = 'MeshLambertMaterial';
			var mpars = { color: 0xeeeeee, opacity: 1.0, map: null, lightMap: null, normalMap: null, bumpMap: null, wireframe: false };

			// parameters from model file

			if (m.shading) {

				var shading = m.shading.toLowerCase();

				if (shading === 'phong') mtype = 'MeshPhongMaterial';else if (shading === 'basic') mtype = 'MeshBasicMaterial';
			}

			if (m.blending !== undefined && THREE[m.blending] !== undefined) {

				mpars.blending = THREE[m.blending];
			}

			if (m.transparent !== undefined) {

				mpars.transparent = m.transparent;
			}

			if (m.opacity !== undefined && m.opacity < 1.0) {

				mpars.transparent = true;
			}

			if (m.depthTest !== undefined) {

				mpars.depthTest = m.depthTest;
			}

			if (m.depthWrite !== undefined) {

				mpars.depthWrite = m.depthWrite;
			}

			if (m.visible !== undefined) {

				mpars.visible = m.visible;
			}

			if (m.flipSided !== undefined) {

				mpars.side = _Three.THREE$BackSide;
			}

			if (m.doubleSided !== undefined) {

				mpars.side = _Three.THREE$DoubleSide;
			}

			if (m.wireframe !== undefined) {

				mpars.wireframe = m.wireframe;
			}

			if (m.vertexColors !== undefined) {

				if (m.vertexColors === 'face') {

					mpars.vertexColors = _Three.THREE$FaceColors;
				} else if (m.vertexColors) {

					mpars.vertexColors = _Three.THREE$VertexColors;
				}
			}

			// colors

			if (m.colorDiffuse) {

				mpars.color = rgb2hex(m.colorDiffuse);
			} else if (m.DbgColor) {

				mpars.color = m.DbgColor;
			}

			if (m.colorSpecular) {

				mpars.specular = rgb2hex(m.colorSpecular);
			}

			if (m.colorEmissive) {

				mpars.emissive = rgb2hex(m.colorEmissive);
			}

			// modifiers

			if (m.transparency !== undefined) {

				console.warn('THREE.Loader: transparency has been renamed to opacity');
				m.opacity = m.transparency;
			}

			if (m.opacity !== undefined) {

				mpars.opacity = m.opacity;
			}

			if (m.specularCoef) {

				mpars.shininess = m.specularCoef;
			}

			// textures

			if (m.mapDiffuse && texturePath) {

				create_texture(mpars, 'map', m.mapDiffuse, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap, m.mapDiffuseAnisotropy);
			}

			if (m.mapLight && texturePath) {

				create_texture(mpars, 'lightMap', m.mapLight, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap, m.mapLightAnisotropy);
			}

			if (m.mapAO && texturePath) {

				create_texture(mpars, 'aoMap', m.mapAO, m.mapAORepeat, m.mapAOOffset, m.mapAOWrap, m.mapAOAnisotropy);
			}

			if (m.mapBump && texturePath) {

				create_texture(mpars, 'bumpMap', m.mapBump, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap, m.mapBumpAnisotropy);
			}

			if (m.mapNormal && texturePath) {

				create_texture(mpars, 'normalMap', m.mapNormal, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap, m.mapNormalAnisotropy);
			}

			if (m.mapSpecular && texturePath) {

				create_texture(mpars, 'specularMap', m.mapSpecular, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap, m.mapSpecularAnisotropy);
			}

			if (m.mapAlpha && texturePath) {

				create_texture(mpars, 'alphaMap', m.mapAlpha, m.mapAlphaRepeat, m.mapAlphaOffset, m.mapAlphaWrap, m.mapAlphaAnisotropy);
			}

			//

			if (m.mapBumpScale) {

				mpars.bumpScale = m.mapBumpScale;
			}

			if (m.mapNormalFactor) {

				mpars.normalScale = new _mathVector2.THREE$Vector2(m.mapNormalFactor, m.mapNormalFactor);
			}

			var material = new THREE[mtype](mpars);

			if (m.DbgName !== undefined) material.name = m.DbgName;

			return material;
		};
	})()

};

THREE$Loader.Handlers = {

	handlers: [],

	add: function (regex, loader) {

		this.handlers.push(regex, loader);
	},

	get: function (file) {

		for (var i = 0, l = this.handlers.length; i < l; i += 2) {

			var regex = this.handlers[i];
			var loader = this.handlers[i + 1];

			if (regex.test(file)) {

				return loader;
			}
		}

		return null;
	}

};

exports.THREE$Loader = THREE$Loader;