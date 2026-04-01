/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from "ogl";
import { useEffect, useRef } from "react";

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

const defaultItems = [
  {
    image: "/bombeiro.png",
    text: "BMC",
    href: "/aluno",
  },
  {
    image: `/simulado.png`,
    text: "Provas",
    href: "/aluno",
  },
  {
    image: `/policial.jpg`,
    text: "PM",
    href: "/aluno",
  },
  {
    image: "/prf.jpeg",
    text: "PRF",
    href: "/aluno",
  },
  {
    image: `/gcm.jpg`,
    text: "GCM",
    href: "/aluno",
  },
  {
    image: `/militar.jpeg`,
    text: "ESA",
    href: "/aluno",
  },
  {
    image: `/pp.jfif`,
    text: "PCCE",
    href: "/aluno",
  },
  {
    image: `/pmce.png`,
    text: "PMCE",
    href: "/aluno",
  },
];

class Media {
  app: any;
  container: HTMLElement;
  extra: number;
  geometry: any;
  gl: any;
  image: string;
  index: number;
  length: number;
  renderer: any;
  scene: any;
  screen: any;
  text: string;
  href: string;
  viewport: any;
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  showText: boolean;
  program: any;
  plane: any;
  titleElement: HTMLDivElement | null = null;
  hoverElement: HTMLAnchorElement | HTMLDivElement | null = null;
  scale: number = 0;
  padding: number = 0;
  width: number = 0;
  widthTotal: number = 0;
  x: number = 0;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  // Variáveis exclusivas para o controle local de Hover do Shader
  isHovered: boolean = false;
  hoverValue: number = 0;

  constructor({
    app,
    container,
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    href,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    showText,
  }: any) {
    this.app = app;
    this.container = container;
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.href = href;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.showText = showText;

    this.createShader();
    this.createMesh();
    this.createHtmlElements();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true,
    });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        uniform float uHover; 
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );

          // EFEITO DE ZOOM: Escala a textura suavemente mantendo ela centralizada
          float zoom = 1.0 - (uHover * 0.05); 
          uv = (uv - 0.5) * zoom + 0.5;

          vec4 color = texture2D(tMap, uv);
          
          // A máscara com border radius continua inalterada!
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uBorderRadius: { value: this.borderRadius },
        uHover: { value: 0 }, // <-- Iniciando o Hover em 0
      },
      transparent: true,
    });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [
        img.naturalWidth,
        img.naturalHeight,
      ];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  createHtmlElements() {
    // 1. O Título Original
    this.titleElement = document.createElement("div");
    this.titleElement.innerText = this.text;
    this.titleElement.style.position = "absolute";
    this.titleElement.style.left = "50%";
    this.titleElement.style.top = "50%";
    this.titleElement.style.color = this.textColor;
    this.titleElement.style.font = this.font;
    this.titleElement.style.whiteSpace = "nowrap";
    this.titleElement.style.pointerEvents = "none";
    this.titleElement.style.zIndex = "10";
    if (!this.showText) {
      this.titleElement.style.display = "none";
    }
    this.container.appendChild(this.titleElement);

    // 2. A "Máscara de Vidro" (Hover & Clique)
    const isLink = this.href && this.href !== "#" && this.href !== "";
    this.hoverElement = document.createElement(isLink ? "a" : "div") as any;

    if (isLink) {
      (this.hoverElement as HTMLAnchorElement).href = this.href;
      (this.hoverElement as HTMLAnchorElement).target = "_blank";
    }

    this.hoverElement!.style.position = "absolute";
    this.hoverElement!.style.left = "50%";
    this.hoverElement!.style.top = "50%";
    this.hoverElement!.style.cursor = "pointer";
    this.hoverElement!.style.zIndex = "20";

    // Modificado para alterar tanto o app global (parar scroll) quanto a imagem local (dar o zoom)
    this.hoverElement!.addEventListener("mouseenter", () => {
      this.app.isHovered = true;
      this.isHovered = true;
    });
    this.hoverElement!.addEventListener("mouseleave", () => {
      this.app.isHovered = false;
      this.isHovered = false;
    });

    this.container.appendChild(this.hoverElement!);
  }

  update(scroll: any, direction: string) {
    // Animação suave para o hover via lerp
    this.hoverValue = lerp(this.hoverValue, this.isHovered ? 1 : 0, 0.08);
    this.program.uniforms.uHover.value = this.hoverValue; // Manda pro Shader!

    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const a = (B_abs * 0.05) / H;
      const yOffset = a * (x * x);

      if (this.bend > 0) {
        this.plane.position.y = -yOffset;
        this.plane.rotation.z = -Math.atan(2 * a * x);
      } else {
        this.plane.position.y = yOffset;
        this.plane.rotation.z = Math.atan(2 * a * x);
      }
    }

    this.speed = scroll.current - scroll.last;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    const margin = this.plane.scale.x * 2.5;

    this.isBefore =
      this.plane.position.x + planeOffset < -viewportOffset - margin;
    this.isAfter =
      this.plane.position.x - planeOffset > viewportOffset + margin;

    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }

    // Calculo Base (Transformação 3D para Pixel)
    if (this.viewport && this.screen) {
      const pixelX =
        (this.plane.position.x / this.viewport.width) * this.screen.width;
      const pixelY =
        -(this.plane.position.y / this.viewport.height) * this.screen.height;

      const pixelWidth =
        (this.plane.scale.x / this.viewport.width) * this.screen.width;
      const pixelHeight =
        (this.plane.scale.y / this.viewport.height) * this.screen.height;

      // Sincronização da Máscara de Vidro
      if (this.hoverElement) {
        this.hoverElement.style.width = `${pixelWidth}px`;
        this.hoverElement.style.height = `${pixelHeight}px`;

        this.hoverElement.style.transform = `
          translate(calc(-50% + ${pixelX}px), calc(-50% + ${pixelY}px)) 
          rotate(${-this.plane.rotation.z}rad)
        `;
      }

      // Sincronização do Título
      if (this.titleElement && this.showText) {
        const yGap = pixelHeight / 2 + 30;
        this.titleElement.style.transform = `
          translate(calc(-50% + ${pixelX}px), calc(-50% + ${pixelY}px)) 
          rotate(${-this.plane.rotation.z}rad) 
          translateY(${yGap}px)
        `;
      }
    }
  }

  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [
          this.viewport.width,
          this.viewport.height,
        ];
      }
    }

    this.plane.scale.y = this.viewport.height * 0.55;
    this.plane.scale.x = this.plane.scale.y * 0.8;

    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];

    this.padding = this.plane.scale.x * 0.15;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  container: HTMLElement;
  autoSpeed: number;
  currentAutoSpeed: number;
  isHovered: boolean = false;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  renderer: any;
  gl: any;
  camera: any;
  scene: any;
  planeGeometry: any;
  screen: any;
  viewport: any;
  mediasImages: any[] = [];
  medias: any[] = [];
  raf: number = 0;
  boundOnResize: any;

  constructor(
    container: HTMLElement,
    {
      items,
      bend,
      textColor = "#ffffff",
      borderRadius = 0,
      font = "medium 30px Montserrat",
      autoSpeed = 0.05,
      showText = true,
      startIndex = 2,
    }: any = {},
  ) {
    this.container = container;
    this.autoSpeed = autoSpeed;
    this.currentAutoSpeed = autoSpeed;
    this.scroll = { ease: 0.1, current: 0, target: 0, last: 0 };
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font, showText);

    if (this.medias && this.medias.length > 0) {
      const initialScroll = this.medias[0].width * startIndex;
      this.scroll.current = initialScroll;
      this.scroll.target = initialScroll;
      this.scroll.last = initialScroll;
    }

    this.update();
    this.boundOnResize = this.onResize.bind(this);
    window.addEventListener("resize", this.boundOnResize);
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 1,
      widthSegments: 1,
    });
  }

  createMedias(
    items: any[],
    bend = 1,
    textColor: string,
    borderRadius: number,
    font: string,
    showText: boolean,
  ) {
    const galleryItems = items && items.length ? items : defaultItems;

    this.mediasImages = galleryItems.concat(galleryItems).concat(galleryItems);

    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        app: this,
        container: this.container,
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        href: data.href,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        showText,
      });
    });
  }

  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };

    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport }),
      );
    }
  }

  update() {
    const targetSpeed = this.isHovered ? 0 : this.autoSpeed;

    this.currentAutoSpeed = lerp(this.currentAutoSpeed, targetSpeed, 0.05);

    this.scroll.target += this.currentAutoSpeed;

    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease,
    );
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);

    this.container.innerHTML = "";
  }
}

export default function SpiralGallery({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px sans-serif",
  autoSpeed = 0.03,
  showText = true,
  startIndex = 2,
  ...props
}: any) {
  const containerRef = useRef<HTMLDivElement>(null);

  const finalItems = items ? [...items] : [...defaultItems];

  let index = 1;
  while (props[`img${index}`] || index <= defaultItems.length) {
    if (props[`img${index}`]) {
      finalItems[index - 1] = {
        image: props[`img${index}`],
        text: props[`text${index}`] || "",
        href: props[`href${index}`] || "#",
      };
    }
    index++;
  }

  const itemsString = JSON.stringify(finalItems);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(containerRef.current, {
      items: finalItems,
      bend,
      textColor,
      borderRadius,
      font,
      autoSpeed,
      showText,
      startIndex,
    });
    return () => {
      app.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    itemsString,
    bend,
    textColor,
    borderRadius,
    font,
    autoSpeed,
    showText,
    startIndex,
  ]);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      ref={containerRef}
    />
  );
}
