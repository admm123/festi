"use client";

import { useEffect, useRef, useCallback } from "react";

interface FestivalNode {
  id: number;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  connections: number[];
  isHovered: boolean;
  pulsePhase: number;
}

const FESTIVALS = [
  "DEFQON.1",
  "QLIMAX",
  "THUNDERDOME",
  "HARD BASS",
  "REVERZE",
  "DECIBEL",
  "INTENTS",
  "SUPREMACY",
  "DOMINATOR",
  "PAROOKAVILLE",
  "TOMORROWLAND",
  "EDC",
  "MYSTERYLAND",
  "FREAQSHOW",
  "WOW WOW",
  "REBIRTH",
  "GROUND ZERO",
  "MASTERS OF HARDCORE",
  "AIRBEAT ONE",
  "NATURE ONE",
];

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<FestivalNode[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>(0);
  const hoveredNodeRef = useRef<number | null>(null);

  const createNodes = useCallback((width: number, height: number) => {
    const nodes: FestivalNode[] = [];
    const padding = 100;

    for (let i = 0; i < FESTIVALS.length; i++) {
      // Create 5-8 random connections per node for a denser network
      const connectionCount = Math.floor(Math.random() * 4) + 5;
      const connections: number[] = [];

      for (let j = 0; j < connectionCount; j++) {
        let target = Math.floor(Math.random() * FESTIVALS.length);
        let attempts = 0;
        while (
          (target === i || connections.includes(target)) &&
          attempts < 50
        ) {
          target = Math.floor(Math.random() * FESTIVALS.length);
          attempts++;
        }
        if (target !== i && !connections.includes(target)) {
          connections.push(target);
        }
      }

      nodes.push({
        id: i,
        name: FESTIVALS[i],
        x: padding + Math.random() * (width - padding * 2),
        y: padding + Math.random() * (height - padding * 2),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 12 + Math.random() * 4,
        connections,
        isHovered: false,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    return nodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (nodesRef.current.length === 0) {
        nodesRef.current = createNodes(canvas.width, canvas.height);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleClick = () => {
      // On click, give nearby nodes a push
      const mouse = mouseRef.current;
      const nodes = nodesRef.current;

      for (const node of nodes) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
          const force = (200 - distance) / 200;
          const angle = Math.atan2(dy, dx);
          node.vx += Math.cos(angle) * force * 3;
          node.vy += Math.sin(angle) * force * 3;
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    canvas.addEventListener("click", handleClick);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const time = Date.now() / 1000;

      // Find hovered node
      hoveredNodeRef.current = null;
      for (const node of nodes) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        node.isHovered = distance < 60;
        if (node.isHovered) {
          hoveredNodeRef.current = node.id;
        }
      }

      // Draw proximity-based connections (dynamic web effect)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i];
          const nodeB = nodes[j];
          const dist = Math.sqrt(
            Math.pow(nodeA.x - nodeB.x, 2) + Math.pow(nodeA.y - nodeB.y, 2),
          );

          // Draw faint connections for nearby nodes
          if (dist < 300) {
            const proximityOpacity = (1 - dist / 300) * 0.12;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(120, 20, 20, ${proximityOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw main connections (behind nodes)
      for (const node of nodes) {
        for (const targetId of node.connections) {
          const target = nodes[targetId];
          if (!target || node.id > targetId) continue; // Avoid drawing twice

          const isActive = node.isHovered || target.isHovered;

          // Calculate connection opacity based on hover and distance to mouse
          const midX = (node.x + target.x) / 2;
          const midY = (node.y + target.y) / 2;
          const mouseDistToLine = Math.sqrt(
            Math.pow(mouse.x - midX, 2) + Math.pow(mouse.y - midY, 2),
          );

          let opacity = 0.15;
          if (isActive) {
            opacity = 0.6;
          } else if (mouseDistToLine < 150) {
            opacity = 0.15 + (1 - mouseDistToLine / 150) * 0.3;
          }

          // Animated pulse along the connection
          const pulsePos = (time * 0.5 + node.pulsePhase) % 1;
          const pulseX = node.x + (target.x - node.x) * pulsePos;
          const pulseY = node.y + (target.y - node.y) * pulsePos;

          // Draw main connection line
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = isActive
            ? `rgba(239, 68, 68, ${opacity})`
            : `rgba(180, 30, 30, ${opacity})`;
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.stroke();

          // Draw energy pulse
          if (opacity > 0.2) {
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, isActive ? 4 : 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(239, 68, 68, ${opacity * 1.5})`;
            ctx.fill();
          }
        }
      }

      // Update and draw nodes
      for (const node of nodes) {
        // Mouse repulsion/attraction
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200 && distance > 0) {
          const force = (200 - distance) / 200;
          const angle = Math.atan2(dy, dx);
          // Gentle repulsion from cursor
          node.vx -= Math.cos(angle) * force * 0.05;
          node.vy -= Math.sin(angle) * force * 0.05;
        }

        // Apply velocity with damping
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.98;
        node.vy *= 0.98;

        // Boundary bouncing
        const margin = 80;
        if (node.x < margin) {
          node.x = margin;
          node.vx *= -0.5;
        }
        if (node.x > canvas.width - margin) {
          node.x = canvas.width - margin;
          node.vx *= -0.5;
        }
        if (node.y < margin) {
          node.y = margin;
          node.vy *= -0.5;
        }
        if (node.y > canvas.height - margin) {
          node.y = canvas.height - margin;
          node.vy *= -0.5;
        }

        // Draw glow for hovered nodes
        if (node.isHovered) {
          const gradient = ctx.createRadialGradient(
            node.x,
            node.y,
            0,
            node.x,
            node.y,
            80,
          );
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.3)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
          ctx.beginPath();
          ctx.arc(node.x, node.y, 80, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw node background
        const bgSize = node.isHovered ? node.size + 4 : node.size;
        ctx.beginPath();
        ctx.arc(node.x, node.y, bgSize, 0, Math.PI * 2);
        ctx.fillStyle = node.isHovered
          ? "rgba(239, 68, 68, 0.3)"
          : "rgba(60, 20, 20, 0.5)";
        ctx.fill();
        ctx.strokeStyle = node.isHovered
          ? "rgba(239, 68, 68, 0.8)"
          : "rgba(239, 68, 68, 0.3)";
        ctx.lineWidth = node.isHovered ? 2 : 1;
        ctx.stroke();

        // Draw festival name
        ctx.font = `${node.isHovered ? "bold " : ""}${node.isHovered ? 11 : 9}px var(--font-raleway), system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = node.isHovered
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(255, 255, 255, 0.6)";
        ctx.fillText(node.name, node.x, node.y);
      }

      // Draw cursor interaction hint
      if (hoveredNodeRef.current !== null) {
        ctx.font = "10px var(--font-raleway), system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillText("click to push", mouse.x, mouse.y + 30);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [createNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 cursor-pointer"
      style={{ background: "transparent" }}
    />
  );
}
