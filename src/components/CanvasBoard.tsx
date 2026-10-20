'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { socket } from '@/lib/socket';
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Minus,
  MoveRight,
  Star,
  PaintBucket,
  Palette,
  Sliders,
  Rocket,
  Compass,
  Zap,
  RotateCcw,
  Trash2,
  MapPin,
  ChevronUp,
  X,
  Wifi,
  WifiOff,
  Flame,
} from 'lucide-react';

// -------------------------------------------------------------
// Data Types
// -------------------------------------------------------------
type ActiveTool = 'pen' | 'eraser' | 'shape' | 'fill' | 'pan';
type ShapeType = 'rect' | 'circle' | 'line' | 'arrow' | 'star';

interface Point {
  x: number;
  y: number;
}

interface CanvasElement {
  id: string;
  type: 'stroke' | 'shape' | 'fill';
  tool?: string;
  points?: Point[];
  shapeType?: ShapeType;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  isFilled?: boolean;
}

// Preset color palette
const PRESET_COLORS = [
  '#ffffff', // Pure White
  '#38bdf8', // Electric Cyan
  '#818cf8', // Cosmic Indigo
  '#a855f7', // Neon Purple
  '#ec4899', // Hyper Pink
  '#ef4444', // Solar Red
  '#f59e0b', // Amber Flame
  '#10b981', // Matrix Emerald
  '#06b6d4', // Deep Teal
  '#64748b', // Slate
];

const PRESET_SIZES = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 6 },
  { label: 'Thick', value: 14 },
  { label: 'Marker', value: 28 },
];

export default function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // -----------------------------------------------------------
  // Canvas Viewport State (Pan & Zoom)
  // -----------------------------------------------------------
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const panOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);

  // Keep refs synchronized for animation loops
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // -----------------------------------------------------------
  // Drawing & Elements State
  // -----------------------------------------------------------
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const elementsRef = useRef<CanvasElement[]>([]);
  elementsRef.current = elements;

  const [activeTool, setActiveTool] = useState<ActiveTool>('pan');
  const [currentColor, setCurrentColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rect');
  const [isFillActive, setIsFillActive] = useState<boolean>(false);
  const [fillColor, setFillColor] = useState<string>('rgba(56, 189, 248, 0.25)');

  // Interaction tracking
  const isInteracting = useRef(false);
  const startPoint = useRef<Point>({ x: 0, y: 0 });
  const currentStroke = useRef<Point[]>([]);

  // -----------------------------------------------------------
  // Socket & Sync State
  // -----------------------------------------------------------
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [pingMs, setPingMs] = useState<number | null>(null);

  // -----------------------------------------------------------
  // Coordinate Teleport HUD State (Top-Left)
  // -----------------------------------------------------------
  const [cursorWorldPos, setCursorWorldPos] = useState<Point>({ x: 0, y: 0 });
  const [isTeleportOpen, setIsTeleportOpen] = useState(false);
  const [teleportX, setTeleportX] = useState<string>('0');
  const [teleportY, setTeleportY] = useState<string>('0');

  // -----------------------------------------------------------
  // Bottom Radial Hub State (Middle-Bottom)
  // -----------------------------------------------------------
  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'size' | 'color' | 'shape' | 'fill' | 'eraser' | null>(null);

  // -----------------------------------------------------------
  // Rocket / Jet Speed Mode State (Bottom-Right)
  // -----------------------------------------------------------
  const [isRocketMode, setIsRocketMode] = useState(false);
  const [rocketSpeed, setRocketSpeed] = useState<number>(18); // Pixels per frame multiplier
  const [rocketAngle, setRocketAngle] = useState<number>(0);
  const [isThrusting, setIsThrusting] = useState(false);
  const mouseScreenPos = useRef<Point>({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  // -----------------------------------------------------------
  // Coordinate Transformations
  // -----------------------------------------------------------
  const screenToWorld = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: (screenX - panOffsetRef.current.x) / zoomRef.current,
      y: (screenY - panOffsetRef.current.y) / zoomRef.current,
    };
  }, []);

  const worldToScreen = useCallback((worldX: number, worldY: number): Point => {
    return {
      x: worldX * zoomRef.current + panOffsetRef.current.x,
      y: worldY * zoomRef.current + panOffsetRef.current.y,
    };
  }, []);

  // -----------------------------------------------------------
  // Teleportation Functionality
  // -----------------------------------------------------------
  const teleportTo = useCallback((targetX: number, targetY: number) => {
    if (typeof window === 'undefined') return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const newPanX = centerX - targetX * zoomRef.current;
    const newPanY = centerY - targetY * zoomRef.current;

    setPanOffset({ x: newPanX, y: newPanY });
    setIsTeleportOpen(false);
  }, []);

  // -----------------------------------------------------------
  // Canvas Rendering Loop
  // -----------------------------------------------------------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Canvas background
    ctx.fillStyle = '#0a0c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Infinite Dot Grid Matrix
    const gridSize = 40 * zoom;
    const offsetX = panOffset.x % gridSize;
    const offsetY = panOffset.y % gridSize;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2 * Math.min(zoom, 1.8), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Origin (0,0) subtle coordinate crosshairs
    const origin = worldToScreen(0, 0);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvas.height);
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvas.width, origin.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Apply viewport transformation for drawing world elements
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw all persisted elements
    elementsRef.current.forEach((el) => {
      ctx.save();
      ctx.strokeStyle = el.color;
      ctx.fillStyle = el.fillColor || el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'stroke' && el.points && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      } else if (el.type === 'shape' && el.startX !== undefined && el.startY !== undefined && el.endX !== undefined && el.endY !== undefined) {
        const sx = el.startX;
        const sy = el.startY;
        const ex = el.endX;
        const ey = el.endY;

        ctx.beginPath();
        if (el.shapeType === 'rect') {
          const x = Math.min(sx, ex);
          const y = Math.min(sy, ey);
          const w = Math.abs(ex - sx);
          const h = Math.abs(ey - sy);
          if (el.isFilled) ctx.fillRect(x, y, w, h);
          ctx.strokeRect(x, y, w, h);
        } else if (el.shapeType === 'circle') {
          const rx = Math.abs(ex - sx) / 2;
          const ry = Math.abs(ey - sy) / 2;
          const cx = Math.min(sx, ex) + rx;
          const cy = Math.min(sy, ey) + ry;
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          if (el.isFilled) ctx.fill();
          ctx.stroke();
        } else if (el.shapeType === 'line') {
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        } else if (el.shapeType === 'arrow') {
          // Draw line
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          // Draw arrowhead
          const angle = Math.atan2(ey - sy, ex - sx);
          const headlen = 16 / zoom;
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headlen * Math.cos(angle - Math.PI / 6), ey - headlen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ex - headlen * Math.cos(angle + Math.PI / 6), ey - headlen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        } else if (el.shapeType === 'star') {
          const cx = (sx + ex) / 2;
          const cy = (sy + ey) / 2;
          const r = Math.hypot(ex - sx, ey - sy) / 2;
          const spikes = 5;
          let rot = (Math.PI / 2) * 3;
          let step = Math.PI / spikes;

          ctx.beginPath();
          ctx.moveTo(cx, cy - r);
          for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * r;
            let y = cy + Math.sin(rot) * r;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * (r / 2);
            y = cy + Math.sin(rot) * (r / 2);
            ctx.lineTo(x, y);
            rot += step;
          }
          ctx.lineTo(cx, cy - r);
          ctx.closePath();
          if (el.isFilled) ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    });

    ctx.restore();
  }, [panOffset, zoom, worldToScreen]);

  // Keep canvas resized to full viewport
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current) return;
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      renderCanvas();
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [elements, panOffset, zoom, renderCanvas]);

  // -----------------------------------------------------------
  // Rocket Mode Physics Loop (Edge Proximity Acceleration)
  // -----------------------------------------------------------
  useEffect(() => {
    if (!isRocketMode) {
      setIsThrusting(false);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const proximityThreshold = 140; // Pixels from border to engage thrusters

    const rocketTick = () => {
      const { innerWidth: width, innerHeight: height } = window;
      const mouseX = mouseScreenPos.current.x;
      const mouseY = mouseScreenPos.current.y;

      let dx = 0;
      let dy = 0;

      // Check Proximity to Edges
      if (mouseX < proximityThreshold) {
        const factor = (proximityThreshold - mouseX) / proximityThreshold;
        dx += factor * rocketSpeed;
      } else if (mouseX > width - proximityThreshold) {
        const factor = (mouseX - (width - proximityThreshold)) / proximityThreshold;
        dx -= factor * rocketSpeed;
      }

      if (mouseY < proximityThreshold) {
        const factor = (proximityThreshold - mouseY) / proximityThreshold;
        dy += factor * rocketSpeed;
      } else if (mouseY > height - proximityThreshold) {
        const factor = (mouseY - (height - proximityThreshold)) / proximityThreshold;
        dy -= factor * rocketSpeed;
      }

      if (dx !== 0 || dy !== 0) {
        setIsThrusting(true);
        // Compute angle for rocket pointing direction (-dx, -dy)
        const angleDeg = (Math.atan2(-dy, -dx) * 180) / Math.PI + 90;
        setRocketAngle(angleDeg);

        setPanOffset((prev) => ({
          x: prev.x + dx,
          y: prev.y + dy,
        }));
      } else {
        setIsThrusting(false);
      }

      animationFrameId.current = requestAnimationFrame(rocketTick);
    };

    animationFrameId.current = requestAnimationFrame(rocketTick);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [isRocketMode, rocketSpeed]);

  // -----------------------------------------------------------
  // Socket.io Real-Time Synchronization
  // -----------------------------------------------------------
  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      const start = Date.now();
      socket.emit('endlessync:ping', () => setPingMs(Date.now() - start));
    };

    const onDisconnect = () => setIsConnected(false);

    const onInit = (data: { elements?: CanvasElement[]; onlineUsers?: number }) => {
      setIsConnected(true);
      if (data.elements) setElements(data.elements);
      if (data.onlineUsers) setOnlineUsers(data.onlineUsers);
    };

    const onElementAdded = (element: CanvasElement) => {
      setElements((prev) => {
        const idx = prev.findIndex((el) => el.id === element.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = element;
          return next;
        }
        return [...prev, element];
      });
    };

    const onElementErased = (elementId: string) => {
      setElements((prev) => prev.filter((el) => el.id !== elementId));
    };

    const onCanvasCleared = () => {
      setElements([]);
    };

    const onUsersCount = (data: { onlineUsers: number }) => {
      if (data && typeof data.onlineUsers === 'number') {
        setOnlineUsers(data.onlineUsers);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('endlessync:init', onInit);
    socket.on('element:added', onElementAdded);
    socket.on('element:erased', onElementErased);
    socket.on('canvas:cleared', onCanvasCleared);
    socket.on('endlessync:users_count', onUsersCount);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('endlessync:init', onInit);
      socket.off('element:added', onElementAdded);
      socket.off('element:erased', onElementErased);
      socket.off('canvas:cleared', onCanvasCleared);
      socket.off('endlessync:users_count', onUsersCount);
    };
  }, []);

  // -----------------------------------------------------------
  // Mouse & Pointer Event Handlers
  // -----------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isInteracting.current = true;
    const worldPoint = screenToWorld(e.clientX, e.clientY);
    startPoint.current = worldPoint;

    if (activeTool === 'pen') {
      currentStroke.current = [worldPoint];
    } else if (activeTool === 'eraser') {
      eraseAtPoint(worldPoint);
    } else if (activeTool === 'fill') {
      // Toggle fill bucket on clicked shape or background
      const clicked = findElementNearPoint(worldPoint);
      if (clicked && clicked.type === 'shape') {
        const updated: CanvasElement = { ...clicked, isFilled: true, fillColor };
        setElements((prev) => prev.map((el) => (el.id === clicked.id ? updated : el)));
        socket.emit('element:add', updated);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    mouseScreenPos.current = { x: e.clientX, y: e.clientY };
    const worldPoint = screenToWorld(e.clientX, e.clientY);
    setCursorWorldPos(worldPoint);

    if (!isInteracting.current) return;

    if (activeTool === 'pan' || (!activeTool && !isRocketMode)) {
      setPanOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    } else if (activeTool === 'pen') {
      currentStroke.current.push(worldPoint);

      // Render in-progress stroke directly for ultra-low latency
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.translate(panOffset.x, panOffset.y);
          ctx.scale(zoom, zoom);
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const pts = currentStroke.current;
          if (pts.length > 1) {
            ctx.beginPath();
            ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
            ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    } else if (activeTool === 'eraser') {
      eraseAtPoint(worldPoint);
    } else if (activeTool === 'shape') {
      // Preview shape during drag
      renderCanvas();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.translate(panOffset.x, panOffset.y);
          ctx.scale(zoom, zoom);
          ctx.strokeStyle = currentColor;
          ctx.fillStyle = isFillActive ? fillColor : 'transparent';
          ctx.lineWidth = strokeWidth;
          ctx.setLineDash([4, 4]);

          const sx = startPoint.current.x;
          const sy = startPoint.current.y;
          const ex = worldPoint.x;
          const ey = worldPoint.y;

          if (selectedShape === 'rect') {
            const x = Math.min(sx, ex);
            const y = Math.min(sy, ey);
            const w = Math.abs(ex - sx);
            const h = Math.abs(ey - sy);
            if (isFillActive) ctx.fillRect(x, y, w, h);
            ctx.strokeRect(x, y, w, h);
          } else if (selectedShape === 'circle') {
            const rx = Math.abs(ex - sx) / 2;
            const ry = Math.abs(ey - sy) / 2;
            const cx = Math.min(sx, ex) + rx;
            const cy = Math.min(sy, ey) + ry;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            if (isFillActive) ctx.fill();
            ctx.stroke();
          } else if (selectedShape === 'line' || selectedShape === 'arrow') {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
          }
          ctx.restore();
        }
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isInteracting.current) return;
    isInteracting.current = false;
    const worldPoint = screenToWorld(e.clientX, e.clientY);

    if (activeTool === 'pen' && currentStroke.current.length > 0) {
      const newStroke: CanvasElement = {
        id: `stroke_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'stroke',
        points: currentStroke.current,
        color: currentColor,
        strokeWidth: strokeWidth,
      };
      setElements((prev) => [...prev, newStroke]);
      socket.emit('element:add', newStroke);
      currentStroke.current = [];
    } else if (activeTool === 'shape') {
      const newShape: CanvasElement = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'shape',
        shapeType: selectedShape,
        startX: startPoint.current.x,
        startY: startPoint.current.y,
        endX: worldPoint.x,
        endY: worldPoint.y,
        color: currentColor,
        fillColor: isFillActive ? fillColor : undefined,
        strokeWidth: strokeWidth,
        isFilled: isFillActive,
      };
      setElements((prev) => [...prev, newShape]);
      socket.emit('element:add', newShape);
      renderCanvas();
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.15), 5);

    // Zoom centered on cursor position
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const newPanX = mouseX - (mouseX - panOffset.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - panOffset.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };

  // Erase detection
  const eraseAtPoint = (point: Point) => {
    const radius = 20 / zoom;
    const target = elementsRef.current.find((el) => {
      if (el.type === 'stroke' && el.points) {
        return el.points.some((p) => Math.hypot(p.x - point.x, p.y - point.y) < radius);
      } else if (el.type === 'shape' && el.startX !== undefined && el.startY !== undefined) {
        const midX = (el.startX + (el.endX || el.startX)) / 2;
        const midY = (el.startY + (el.endY || el.startY)) / 2;
        return Math.hypot(midX - point.x, midY - point.y) < radius * 2;
      }
      return false;
    });

    if (target) {
      setElements((prev) => prev.filter((el) => el.id !== target.id));
      socket.emit('element:erase', target.id);
    }
  };

  const findElementNearPoint = (point: Point): CanvasElement | null => {
    return (
      elementsRef.current.find((el) => {
        if (el.type === 'shape' && el.startX !== undefined && el.startY !== undefined) {
          const minX = Math.min(el.startX, el.endX || el.startX);
          const maxX = Math.max(el.startX, el.endX || el.startX);
          const minY = Math.min(el.startY, el.endY || el.startY);
          const maxY = Math.max(el.startY, el.endY || el.startY);
          return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
        }
        return false;
      }) || null
    );
  };

  // Clear canvas
  const handleClear = () => {
    if (confirm('Clear entire shared board?')) {
      setElements([]);
      socket.emit('canvas:clear');
    }
  };

  // -----------------------------------------------------------
  // Central Radial Pen Activation Handler
  // -----------------------------------------------------------
  const handleMainPenClick = () => {
    if (activeTool === 'pen') {
      // Toggle off to pan
      setActiveTool('pan');
      setIsRadialOpen(false);
      setActivePanel(null);
    } else {
      // Per instructions: "when clicked on pen icon the first default one automatically select, no need to click on the 5 icons before that"
      setActiveTool('pen');
      setIsRadialOpen(true);
      setActivePanel(null);
    }
  };

  const toggleSatellitePanel = (panel: 'size' | 'color' | 'shape' | 'fill' | 'eraser') => {
    if (activePanel === panel) {
      setActivePanel(null);
    } else {
      setActivePanel(panel);
      if (panel === 'eraser') setActiveTool('eraser');
      else if (panel === 'shape') setActiveTool('shape');
      else if (panel === 'fill') setActiveTool('fill');
      else setActiveTool('pen');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0c10] select-none text-slate-100 font-sans">
      {/* ----------------------------------------------------------- */}
      {/* 1. TOP-LEFT: Real-Time Coordinates HUD & Teleport Box */}
      {/* ----------------------------------------------------------- */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl backdrop-blur-xl bg-slate-900/80 border border-slate-700/80 shadow-2xl">
          <MapPin className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="font-mono text-xs flex items-center gap-3">
            <span className="text-slate-400">
              X: <strong className="text-slate-100">{Math.round(cursorWorldPos.x)}</strong>
            </span>
            <span className="text-slate-400">
              Y: <strong className="text-slate-100">{Math.round(cursorWorldPos.y)}</strong>
            </span>
            <span className="text-indigo-400/80 border-l border-slate-700 pl-2">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Edit/Teleport Trigger Button */}
          <button
            onClick={() => {
              setTeleportX(String(Math.round(cursorWorldPos.x)));
              setTeleportY(String(Math.round(cursorWorldPos.y)));
              setIsTeleportOpen((prev) => !prev);
            }}
            title="Edit coordinates & teleport"
            className="ml-1 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/60 border border-indigo-500/40 text-[11px] font-semibold text-indigo-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <span>Edit</span>
          </button>
        </div>

        {/* Teleport Dropdown Box */}
        {isTeleportOpen && (
          <div className="absolute top-12 left-0 w-72 p-4 rounded-2xl backdrop-blur-2xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl space-y-3 z-40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> Teleport to Coordinates
              </span>
              <button
                onClick={() => setIsTeleportOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono">Target X</label>
                <input
                  type="number"
                  value={teleportX}
                  onChange={(e) => setTeleportX(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && teleportTo(Number(teleportX), Number(teleportY))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono">Target Y</label>
                <input
                  type="number"
                  value={teleportY}
                  onChange={(e) => setTeleportY(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && teleportTo(Number(teleportX), Number(teleportY))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => teleportTo(Number(teleportX), Number(teleportY))}
                className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 hover:brightness-110 transition cursor-pointer"
              >
                Teleport Now
              </button>
              <button
                onClick={() => teleportTo(0, 0)}
                title="Reset to origin (0, 0)"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition cursor-pointer"
              >
                Origin (0,0)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. TOP-RIGHT: Live Connection & Peer Counter */}
      {/* ----------------------------------------------------------- */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium backdrop-blur-xl ${
            isConnected
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isConnected ? 'Live Sync' : 'Offline'}</span>
          {pingMs !== null && isConnected && (
            <span className="font-mono text-[11px] opacity-75">{pingMs}ms</span>
          )}
        </div>

        <button
          onClick={handleClear}
          title="Clear Board"
          className="p-2 rounded-xl backdrop-blur-xl bg-slate-900/80 hover:bg-rose-900/30 border border-slate-700/80 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. MIDDLE-BOTTOM: Simulator Drawing Hub (Big Circular Button + 5 Satellites) */}
      {/* ----------------------------------------------------------- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        {/* Floating Rectangular Config Panel (Opens above when satellite is clicked) */}
        {activePanel && (
          <div className="mb-4 p-4 rounded-2xl backdrop-blur-2xl bg-slate-900/95 border border-indigo-500/30 shadow-2xl min-w-[280px] max-w-sm animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-white capitalize flex items-center gap-1.5">
                {activePanel === 'size' && <Sliders className="w-3.5 h-3.5 text-cyan-400" />}
                {activePanel === 'color' && <Palette className="w-3.5 h-3.5 text-cyan-400" />}
                {activePanel === 'shape' && <Square className="w-3.5 h-3.5 text-cyan-400" />}
                {activePanel === 'fill' && <PaintBucket className="w-3.5 h-3.5 text-cyan-400" />}
                {activePanel === 'eraser' && <Eraser className="w-3.5 h-3.5 text-cyan-400" />}
                {activePanel} Options
              </span>
              <button onClick={() => setActivePanel(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Size / Thickness Panel */}
            {activePanel === 'size' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Stroke Width:</span>
                  <span className="font-mono text-cyan-400 font-bold">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {PRESET_SIZES.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setStrokeWidth(preset.value)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                        strokeWidth === preset.value
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Color Palette Panel */}
            {activePanel === 'color' && (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setCurrentColor(col);
                        if (isFillActive) setFillColor(col);
                      }}
                      className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer shadow-md"
                      style={{
                        backgroundColor: col,
                        borderColor: currentColor === col ? '#ffffff' : 'transparent',
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Custom:</span>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => {
                      setCurrentColor(e.target.value);
                      if (isFillActive) setFillColor(e.target.value);
                    }}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                  />
                  <span className="font-mono text-xs text-slate-300 uppercase">{currentColor}</span>
                </div>
              </div>
            )}

            {/* 3. Shapes Panel */}
            {activePanel === 'shape' && (
              <div className="grid grid-cols-5 gap-2">
                {[
                  { type: 'rect' as ShapeType, icon: Square, label: 'Box' },
                  { type: 'circle' as ShapeType, icon: Circle, label: 'Oval' },
                  { type: 'line' as ShapeType, icon: Minus, label: 'Line' },
                  { type: 'arrow' as ShapeType, icon: MoveRight, label: 'Arrow' },
                  { type: 'star' as ShapeType, icon: Star, label: 'Star' },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.type}
                      onClick={() => {
                        setSelectedShape(s.type);
                        setActiveTool('shape');
                      }}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition cursor-pointer ${
                        selectedShape === s.type && activeTool === 'shape'
                          ? 'bg-indigo-600/30 border-cyan-400 text-white'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px]">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4. Bucket Fill Panel */}
            {activePanel === 'fill' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Fill Shapes & Surfaces:</span>
                  <button
                    onClick={() => setIsFillActive(!isFillActive)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      isFillActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isFillActive ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When enabled, all newly drawn shapes and clicked areas are automatically filled.
                </p>
              </div>
            )}

            {/* 5. Eraser Panel */}
            {activePanel === 'eraser' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-300">Precision Eraser Active</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Click and drag across any stroke or shape on the canvas to erase it instantly.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Radial Satellite Circles Container */}
        <div className="relative flex items-center justify-center">
          {/* 5 Animated Surrounding Satellites (Desktop Radial / Mobile Row) */}
          <div
            className={`transition-all duration-300 ${
              isRadialOpen
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-75 pointer-events-none'
            } flex items-center gap-3 sm:absolute sm:inset-0 sm:items-center sm:justify-center`}
          >
            {/* Satellite 1: Size (Top-Left / Offset) */}
            <button
              onClick={() => toggleSatellitePanel('size')}
              title="Pen Size & Style"
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-lg transition-transform hover:scale-110 cursor-pointer sm:absolute sm:-translate-x-24 sm:-translate-y-12 ${
                activePanel === 'size'
                  ? 'bg-cyan-500 border-white text-slate-950 shadow-cyan-500/40'
                  : 'bg-slate-900/90 border-slate-700 text-cyan-400 hover:text-white'
              }`}
            >
              <Sliders className="w-5 h-5" />
            </button>

            {/* Satellite 2: Color (Top / Offset) */}
            <button
              onClick={() => toggleSatellitePanel('color')}
              title="Color Palette"
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-lg transition-transform hover:scale-110 cursor-pointer sm:absolute sm:-translate-x-12 sm:-translate-y-24 ${
                activePanel === 'color'
                  ? 'bg-indigo-500 border-white text-white shadow-indigo-500/40'
                  : 'bg-slate-900/90 border-slate-700 text-indigo-400 hover:text-white'
              }`}
            >
              <div
                className="w-5 h-5 rounded-full border border-white/60 shadow-inner"
                style={{ backgroundColor: currentColor }}
              />
            </button>

            {/* Satellite 3: Shapes (Top-Center / Offset) */}
            <button
              onClick={() => toggleSatellitePanel('shape')}
              title="Shapes Tool"
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-lg transition-transform hover:scale-110 cursor-pointer sm:absolute sm:translate-x-12 sm:-translate-y-24 ${
                activePanel === 'shape'
                  ? 'bg-purple-500 border-white text-white shadow-purple-500/40'
                  : 'bg-slate-900/90 border-slate-700 text-purple-400 hover:text-white'
              }`}
            >
              <Square className="w-5 h-5" />
            </button>

            {/* Satellite 4: Bucket (Top-Right / Offset) */}
            <button
              onClick={() => toggleSatellitePanel('fill')}
              title="Bucket Fill"
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-lg transition-transform hover:scale-110 cursor-pointer sm:absolute sm:translate-x-24 sm:-translate-y-12 ${
                activePanel === 'fill'
                  ? 'bg-amber-500 border-white text-slate-950 shadow-amber-500/40'
                  : 'bg-slate-900/90 border-slate-700 text-amber-400 hover:text-white'
              }`}
            >
              <PaintBucket className="w-5 h-5" />
            </button>

            {/* Satellite 5: Eraser (Right / Offset) */}
            <button
              onClick={() => toggleSatellitePanel('eraser')}
              title="Eraser"
              className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-lg transition-transform hover:scale-110 cursor-pointer sm:absolute sm:translate-x-32 sm:translate-y-0 ${
                activePanel === 'eraser'
                  ? 'bg-rose-500 border-white text-white shadow-rose-500/40'
                  : 'bg-slate-900/90 border-slate-700 text-rose-400 hover:text-white'
              }`}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </div>

          {/* Central Big Circular Pen Button */}
          <button
            onClick={handleMainPenClick}
            title={activeTool === 'pen' ? 'Drawing Mode Active (Click to Pan)' : 'Start Drawing (Default Pen)'}
            className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 text-white shadow-cyan-500/50 ring-4 ring-cyan-400/40'
                : 'bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-700 text-slate-200'
            }`}
          >
            <Pen className={`w-7 h-7 transition-transform ${activeTool === 'pen' ? 'scale-110' : ''}`} />

            {/* Pulsing indicator ring when drawing active */}
            {activeTool === 'pen' && (
              <span className="absolute -inset-1 rounded-full bg-cyan-400/20 animate-ping -z-10" />
            )}
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. BOTTOM-RIGHT: Rocket Jet Speed Mode & Physics */}
      {/* ----------------------------------------------------------- */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-3">
        {/* Rocket Speed Controls (Shows when Rocket Mode is on) */}
        {isRocketMode && (
          <div className="p-3 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-amber-500/40 shadow-2xl space-y-2 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between gap-3 text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Flame className={`w-4 h-4 ${isThrusting ? 'animate-bounce text-amber-300' : ''}`} />
                Jet Thrusters
              </span>
              <span className="font-mono text-amber-300">{rocketSpeed}x</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[8, 18, 32].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setRocketSpeed(spd)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                    rocketSpeed === spd
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd === 8 ? 'Cruiser' : spd === 18 ? 'Sonic' : 'Warp'}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 leading-tight">
              Move cursor near screen edges to ignite thrusters!
            </p>
          </div>
        )}

        {/* Main Rocket Toggle Button */}
        <button
          onClick={() => setIsRocketMode((prev) => !prev)}
          title={isRocketMode ? 'Disable Rocket Mode' : 'Enable Rocket Jet Speed Navigation'}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
            isRocketMode
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400/80 text-slate-950 font-bold shadow-amber-500/40'
              : 'bg-slate-900/85 hover:bg-slate-800 border-slate-700/80 text-slate-300'
          }`}
        >
          <Rocket
            className={`w-5 h-5 transition-transform ${
              isRocketMode ? 'animate-pulse text-slate-950' : 'text-amber-400'
            }`}
          />
          <span className="text-xs font-semibold tracking-wide">
            {isRocketMode ? 'Rocket Jet Active' : 'Rocket Jet Mode'}
          </span>
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 5. CUSTOM ROCKET CURSOR (When Rocket Jet Mode is active) */}
      {/* ----------------------------------------------------------- */}
      {isRocketMode && (
        <div
          className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
          style={{
            left: `${mouseScreenPos.current.x}px`,
            top: `${mouseScreenPos.current.y}px`,
            transform: `translate(-50%, -50%) rotate(${rocketAngle}deg)`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <Rocket
              className={`w-8 h-8 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] ${
                isThrusting ? 'text-amber-300 scale-125' : 'text-amber-400'
              }`}
            />
            {isThrusting && (
              <span className="absolute -bottom-3 w-2.5 h-5 bg-gradient-to-t from-transparent via-amber-400 to-red-500 rounded-full blur-[1px] animate-pulse" />
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 6. PRIMARY INTERACTIVE HTML5 CANVAS */}
      {/* ----------------------------------------------------------- */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className={`w-full h-full block touch-none ${
          isRocketMode
            ? 'cursor-none'
            : activeTool === 'pen'
            ? 'cursor-crosshair'
            : activeTool === 'eraser'
            ? 'cursor-cell'
            : activeTool === 'shape'
            ? 'cursor-crosshair'
            : 'cursor-grab active:cursor-grabbing'
        }`}
      />
    </div>
  );
}
