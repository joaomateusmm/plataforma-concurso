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
  { image: "/bombeiro.webp", text: "BMC", href: "/aluno" },
  { image: `/simulado.webp`, text: "Provas", href: "/aluno" },
  { image: `/policial.webp`, text: "PM", href: "/aluno" },
  { image: "/prf.webp", text: "PRF", href: "/aluno" },
  { image: `/gcm.webp`, text: "GCM", href: "/aluno" },
  { image: `/militar.webp`, text: "ESA", href: "/aluno" },
  { image: `/pp.webp`, text: "PCCE", href: "/aluno" },
  { image: `/pmce.webp`, text: "PMCE", href: "/aluno" },
];

class Media {
  app: any;
  container: HTMLElement;
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

  baseAngle: number = 0;

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
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: true, // LIGADO PARA PROFUNDIDADE: Esconde quem tá atrás de quem
      depthWrite: true,
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

          float zoom = 1.0 - (uHover * 0.05); 
          uv = (uv - 0.5) * zoom + 0.5;

          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          if (alpha < 0.01) discard; // Garante que a transparência funcione com DepthTest

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uBorderRadius: { value: this.borderRadius },
        uHover: { value: 0 },
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

  update(scroll: any) {
    this.hoverValue = lerp(this.hoverValue, this.isHovered ? 1 : 0, 0.08);
    this.program.uniforms.uHover.value = this.hoverValue;

    if (this.bend === 0) {
      const totalWidth = this.width * this.length;
      let currentX = this.width * this.index - scroll.current;
      currentX = ((currentX % totalWidth) + totalWidth) % totalWidth;
      if (currentX > totalWidth / 2) currentX -= totalWidth;

      this.plane.position.x = currentX;
      this.plane.position.y = 0;
      this.plane.position.z = 0;
      this.plane.rotation.z = 0;
    } else {
      const radius = this.bend * 20; // Tente 15 ou 20
      const scrollRotation = scroll.current / radius;
      const currentAngle = this.baseAngle - scrollRotation;

      // X e Y normais para círculo
      this.plane.position.x = Math.sin(currentAngle) * radius;
      this.plane.position.y = Math.cos(currentAngle) * radius - radius;

      // MÁGICA 3D COMPLETA: Adiciona profundidade (Z)
      // Faz o círculo virar um anel levemente inclinado. Os de trás ficam menores/escondidos
      this.plane.position.z = Math.cos(currentAngle) * -(radius * 0.8);

      // Rotação para acompanhar o círculo
      this.plane.rotation.z = -currentAngle;

      // Inclinamos os cards de trás para "fugirem" da câmera
      this.plane.rotation.x = Math.cos(currentAngle) * 0.5;
    }

    if (this.viewport && this.screen) {
      // Ajuste de escala para interações HTML
      const distance = this.app.camera.position.z - this.plane.position.z;
      const scaleFactor = this.app.camera.position.z / Math.max(0.1, distance);

      const pixelX =
        (this.plane.position.x / this.viewport.width) *
        this.screen.width *
        scaleFactor;
      const pixelY =
        -(this.plane.position.y / this.viewport.height) *
        this.screen.height *
        scaleFactor;

      const pixelWidth =
        (this.plane.scale.x / this.viewport.width) *
        this.screen.width *
        scaleFactor;
      const pixelHeight =
        (this.plane.scale.y / this.viewport.height) *
        this.screen.height *
        scaleFactor;

      if (this.hoverElement) {
        // Se a posição Z for muito profunda (card tá na parte de trás da roda gigante), não deixa clicar
        if (this.bend > 0 && this.plane.position.z < -(this.bend * 15 * 0.2)) {
          this.hoverElement.style.display = "none";
        } else {
          this.hoverElement.style.display = "block";
          this.hoverElement.style.width = `${pixelWidth}px`;
          this.hoverElement.style.height = `${pixelHeight}px`;
          this.hoverElement.style.transform = `
            translate(calc(-50% + ${pixelX}px), calc(-50% + ${pixelY}px)) 
            rotate(${-this.plane.rotation.z}rad)
            `;
        }
      }

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

    this.plane.scale.y = this.viewport.height * 0.15;
    this.plane.scale.x = this.plane.scale.y * 1.0;

    this.plane.program.uniforms.uPlaneSizes.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];

    this.padding = this.plane.scale.x * 0.35;
    this.width = this.plane.scale.x + this.padding;

    this.baseAngle = (this.index / this.length) * Math.PI * 2;
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
    this.camera = new Camera(this.gl, { near: 0.1, far: 1000 });
    this.camera.fov = 45;
    // Câmera mais distante e um pouco inclinada para baixo
    this.camera.position.z = 60;
    this.camera.position.y = 5;
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

    // Mais repetições porque a roda gigante agora dá a volta completa com profundidade 3D
    this.mediasImages = [...galleryItems, ...galleryItems];

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

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll));
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
  bend = 1.5, // 1.5 é o sweet spot perfeito!
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px sans-serif",
  autoSpeed = 0.03,
  showText = true,
  startIndex = 0,
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
