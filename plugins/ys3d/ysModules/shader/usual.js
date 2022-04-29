/**
 * 常用shader
 * @author跃焱邵隼
 * @host www.wellyyss.cn
 * @qq group 169470811
 */
import _3d from '../../_3d.js'
// 两种颜色切换
const _changeColorShader =  function(type) {
    this.uniforms = {
        texture: {},
        textureProportion: {value: 0.5},
        color1: {},
        color2: {},
        time: {value: 0}
    }
    this.vs = `
    varying vec2 vUv;
    varying vec3 v_p;
    void main(){
    vUv = uv;
    v_p = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`
    switch (type) {  //过度切换
        case 1: {
            this.fs =  `
  uniform sampler2D texture;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float textureProportion;
  uniform float time;     // 变化时间
  varying vec2 vUv;
  void main() {
    gl_FragColor = mix(vec4(color1.r,color1.g,color1.b,1.0), vec4(color2.r,color2.g,color2.b,1.0), time); // 使用内置的 mix() 函数做两张图的线性插值渐变效果
    gl_FragColor = mix(vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,1.0), texture2D( texture, vUv),textureProportion); //加上材质
  }
    `
            break;
        }
        case 2: { //横向I切换
            this.fs =  `
  uniform sampler2D texture;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float textureProportion;
  uniform float time;     // 变化时间
  varying vec2 vUv;
  varying vec3 v_p;
  void main() {
     if(v_p.x < time) {
        gl_FragColor = vec4(color1.r,color1.g,color1.b,1.0); 
     }else { 
        gl_FragColor = vec4(color2.r,color2.g,color2.b,1.0); 
     }
     gl_FragColor = mix(vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,1.0), texture2D( texture, vUv),textureProportion); //加上材质
  }
    `
            break;
        }
    }
}
const changeColorShader =  type =>  new _changeColorShader(type)

// 两个材质切换
const _changeTextureShader = function(type) {
    this.uniforms = {
        texture1: {},
        texture2: {},
        time: {value: 0}
    }
    this.vs = `
    varying vec2 vUv;
    void main(){
    vUv = uv;
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`
    switch (type) {  //过度切换
        case 1: {
            this.fs =  `
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float time;     // 变化时间
  varying vec2 vUv;
  void main() {
    vec4 color1 = texture2D( texture1, vUv);
    vec4 color2 = texture2D( texture2, vUv);
    gl_FragColor = mix(color1, color2, time); // 使用内置的 mix() 函数做两张图的线性插值渐变效果 // abs(sin(time))
  }
    `
            break;
        }
        case 2: {//横向I切换
            this.fs =  `
  uniform sampler2D texture1;
  uniform sampler2D texture2;
  uniform float time;     // 变化时间
  varying vec2 vUv;
  void main() {
     float m = smoothstep(0.0, 0.0, vUv.x - time * 1.5);
     gl_FragColor = mix(texture2D(texture1, (vUv - 0.5) * (1.0 - m) + 0.5), texture2D(texture2, (vUv - 0.5) * m + 0.5), m);
  }
    `
            break;
        }
    }
}
const changeTextureShader = type => new _changeTextureShader(type)

// 多贴图模型shader切换
const _textureColorTransitionShader = function (type) {
    switch (type){
        case 1 :{ //透明渐变
            this.uniforms = {
                //主体渐变色
                gradualColorStart:{ value: new _3d.Color('#001327')},
                gradualColorEnd:{ value: new _3d.Color('#00FFFF')},
                gradualPositionYStart: { value: 0}, //纵向光带初始渐变高度 --smoothstep的参数1
                gradualPositionYEnd: { value: 200},//纵向光带结束渐变高度--smoothstep的参数2
                texture: {
                    value: ''
                },
                opacity: {
                    value: 0.0
                }
            }
            this.vertexShader = `varying vec2 vUv;
        varying vec3 v_p;
        void main() {
            vUv = uv;
            v_p = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         } `
            this.fragmentShader = ` // 根据顶点渐变
        varying vec3 v_p;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform float opacity;
        uniform vec3 color;
        uniform float gradualPositionYStart;
        uniform float gradualPositionYEnd;
        uniform vec3 gradualColorStart;
        uniform vec3 gradualColorEnd;
        void main(){
         vec3 gradient =  mix(gradualColorStart, gradualColorEnd, smoothstep( gradualPositionYStart, gradualPositionYEnd, v_p.y));
         gl_FragColor = mix(texture2D(texture, vUv),vec4(gradient,1.), opacity);//渐变与材质混合
} `
            break;
        }
        case 2: { //横向过度
            this.uniforms = {
                //主体渐变色
                gradualColorStart:{ value: new _3d.Color('#001327')},
                gradualColorEnd:{ value: new _3d.Color('#00FFFF')},
                gradualPositionYStart: { value: 0}, //纵向光带初始渐变高度 --smoothstep的参数1
                gradualPositionYEnd: { value: 200},//纵向光带结束渐变高度--smoothstep的参数2
                texture: {
                    value: ''
                },
                op: {
                    value: 0.8
                },
                colX: {
                    value: -4000
                }
            }
            this.vertexShader = `varying vec2 vUv;
        varying vec3 v_p;
        void main() {
            vUv = uv;
            v_p = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         } `
            this.fragmentShader = ` // 根据顶点渐变
        varying vec3 v_p;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform float op;
        uniform vec3 color;
        uniform float gradualPositionYStart;
        uniform float gradualPositionYEnd;
        uniform vec3 gradualColorStart;
        uniform vec3 gradualColorEnd;
        uniform float colX;
        void main(){
         vec3 gradient =  mix(gradualColorStart, gradualColorEnd, smoothstep( gradualPositionYStart, gradualPositionYEnd, v_p.y));
         if(v_p.x > colX) {
           gl_FragColor = mix(texture2D(texture, vUv),vec4(gradient,1.), op);//渐变与材质混合
         }else {
           gl_FragColor = mix(texture2D(texture, vUv),vec4(gradient,1.), 0.0);//渐变与材质混合
         }
} `
            break;
        }
        case 3: { //纵向过度
            this.uniforms = {
                //主体渐变色
                gradualColorStart:{ value: new _3d.Color('#001327')},
                gradualColorEnd:{ value: new _3d.Color('#00FFFF')},
                gradualPositionYStart: { value: 0}, //纵向光带初始渐变高度 --smoothstep的参数1
                gradualPositionYEnd: { value: 200},//纵向光带结束渐变高度--smoothstep的参数2
                texture: {
                    value: ''
                },
                op: {
                    value: 0.8
                },
                rowY: {
                    value: -100
                }
            }
            this.vertexShader = `varying vec2 vUv;
        varying vec3 v_p;
        void main() {
            vUv = uv;
            v_p = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         } `
            this.fragmentShader = ` // 根据顶点渐变
        varying vec3 v_p;
        varying vec2 vUv;
        uniform sampler2D texture;
        uniform float op;
        uniform vec3 color;
        uniform float gradualPositionYStart;
        uniform float gradualPositionYEnd;
        uniform vec3 gradualColorStart;
        uniform vec3 gradualColorEnd;
        uniform float rowY;
        void main(){
         vec3 gradient =  mix(gradualColorStart, gradualColorEnd, smoothstep( gradualPositionYStart, gradualPositionYEnd, v_p.y));
         if(v_p.y > rowY) {
           gl_FragColor = mix(texture2D(texture, vUv),vec4(gradient,1.), op);//渐变与材质混合
         }else {
           gl_FragColor = mix(texture2D(texture, vUv),vec4(gradient,1.), 0.0);//渐变与材质混合
         }
} `
            break;
        }
    }
}
const textureColorTransitionShader = type => new _textureColorTransitionShader(type)

// 模型shader
const _modelShader = function () {
    this.uniforms = {
        //主体渐变色
        gradualColorStart:{ value: new _3d.Color('#001327')},
        gradualColorEnd:{ value: new _3d.Color('#00FFFF')},
        gradualPositionYStart: { value: 0}, //纵向光带初始渐变高度 --smoothstep的参数1
        gradualPositionYEnd: { value: 20},//纵向光带结束渐变高度--smoothstep的参数2

        //纵向光线
        rowLightHeight: { value:  0},//纵向光的变化高度
        rowLightWidth: { value: 10},// 纵向光宽
        selfTexture: {}, //原贴图纹理
        rowLightColor:{ value: new _3d.Color('#88FF69')},

        //shader透明度占比
        shaderOpacity: { value: 0.9},//

        //横向线
        colLineZ: { value: -200},//定义横向线的 z
        colLineWidth: { value: 10},//定义横向线的 宽度
        colLineColor: { value: new _3d.Color('#b017ff')}, //横向线颜色

        //圆圈扫描
        circleCenter: { value: new _3d.Vector3(0,0,0)}, //扫描中心点
        circleMinR: { value:0 }, //初始半径
        circleWidth: { value: 20 }, //圆环宽度
        colorCircle:{ value: new _3d.Color('#b017ff')},

    }
    this.vs = `
        varying vec2 vUv;
        varying vec3 v_p;
        void main() {
            vUv = uv;
            v_p = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
         } `
    this.fs =` // 根据片元的高度来渐变
        const float PI = 3.141592654;
        uniform float rowLightHeight;
        uniform float rowLightWidth;
        uniform float shaderOpacity;
        uniform float colLineZ;
        uniform float colLineWidth;
        uniform float gradualPositionYStart;
        uniform float gradualPositionYEnd;
        uniform sampler2D selfTexture;
        uniform vec3 gradualColorStart;
        uniform vec3 gradualColorEnd;
        uniform vec3 rowLightColor;
        uniform vec3 colLineColor;
        uniform vec3 colorCircle; 
        uniform vec3 circleCenter;
        uniform float circleMinR;
        uniform float circleWidth;
        varying vec2 vUv;
        varying vec3 v_p;
        float getLeng(float x, float z){
            return  sqrt((x-circleCenter.x)*(x-circleCenter.x)+(z-circleCenter.z)*(z-circleCenter.z)); //sqrt开根号 取R
        }
      
        float plot (vec2 st, float pct){
          return  smoothstep( pct-rowLightWidth, pct, v_p.y) - smoothstep( pct, pct+0.02, v_p.y);
        }
        void main(){
        float f1 = plot(vUv,rowLightHeight);
        vec4 b1 = vec4(rowLightColor.r, rowLightColor.g, rowLightColor.b, 1.0) ;
        // vec3 gradient = mix(gradualColorStart, gradualColorStart, v_p.y * 0.1); // 除法渐变 0.1 或者说 10.0 是指停止渐变高度
        vec3 gradient =  mix(gradualColorStart, gradualColorEnd, smoothstep( gradualPositionYStart, gradualPositionYEnd, v_p.y)); //内置 smoothstep法渐变
        // gl_FragColor = vec4(gradient,1.); // 仅仅渐变色
        gl_FragColor = mix(vec4(gradient,1.),b1,f1);  //渐变与光效混合
        gl_FragColor = mix(texture2D(selfTexture, vUv),vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,shaderOpacity),0.5);  //再混合材质
        if( abs(v_p.z - colLineZ) <= colLineWidth ) { // 如果在扫描线范围内
           gl_FragColor = mix(vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,1), vec4(colLineColor.r,colLineColor.g,colLineColor.b,(1.0- abs(v_p.z - colLineZ) / colLineWidth) * 0.9), 0.5);
        }
        float cr = getLeng(v_p.x,v_p.z);
        if (abs(cr - circleMinR) <= circleWidth ) {
          gl_FragColor = mix(
          vec4(gl_FragColor.r,gl_FragColor.g,gl_FragColor.b,1),
          vec4(colorCircle.r,colorCircle.g,colorCircle.b,(1.0- abs(cr - circleMinR) / circleWidth) * 0.9),
          0.5);
        }
       } `
}
const modelShader = () => new _modelShader()

// 場景切換shader
const _changeSceneShader = function () {
    this.uniforms = {
        tDiffuse1: {
            value: null
        },
        tDiffuse2: {
            value: null
        },
        mixRatio: {
            value: 0.0
        },
        threshold: {
            value: 0.1
        },
        useTexture: {
            value: true
        },
        tMixTexture: {
            value: null
        }
    }
    this.vs =  `varying vec2 vUv;
            void main() {
            vUv = vec2( uv.x, uv.y );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`
    this.fs =`uniform float mixRatio;
            uniform sampler2D tDiffuse1;
            uniform sampler2D tDiffuse2;
            uniform sampler2D tMixTexture;
            uniform bool useTexture;
            uniform float threshold;
            varying vec2 vUv;
            void main() {
            	vec4 texel1 = texture2D( tDiffuse1, vUv );
            	vec4 texel2 = texture2D( tDiffuse2, vUv );
            	if (useTexture==true) {
            		vec4 transitionTexel = texture2D( tMixTexture, vUv );
            		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
            		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);
            		gl_FragColor = mix( texel1, texel2, mixf );
            	} else {
            		gl_FragColor = mix( texel2, texel1, mixRatio );
            	}
        }`
}
const changeSceneShader = () => new _changeSceneShader()

export  {
    modelShader,
    changeTextureShader,
    textureColorTransitionShader,
    changeColorShader,
    changeSceneShader
}