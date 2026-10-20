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
  MapPin,
  X,
  Wifi,
  WifiOff,
  Flame,
  Trash2,
  Check,
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

const PRESET_COLORS = [
  '#ffffff', // White
  '#38bdf8', // Cyan
  '#818cf8', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Teal
  '#64748b', // Slate
];

const PRESET_SIZES = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 6 },
  { label: 'Bold', value: 14 },
  { label: 'Marker', value: 28 },
];

export default function CanvasBoard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // -----------------------------------------------------------
  // Viewport Pan & Zoom State
  // -----------------------------------------------------------
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const panOffsetRef = useRef<Point>({ x: 0, y: 0 });
  const zoomRef = useRef<number>(1);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // -----------------------------------------------------------
  // Canvas Elements & Tools State
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
  // Socket & Sync Status
  // -----------------------------------------------------------
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // -----------------------------------------------------------
  // Top-Left Coordinates & Teleport State
  // -----------------------------------------------------------
  const [cursorWorldPos, setCursorWorldPos] = useState<Point>({ x: 0, y: 0 });
  const [isTeleportOpen, setIsTeleportOpen] = useState(false);
  const [teleportX, setTeleportX] = useState<string>('0');
  const [teleportY, setTeleportY] = useState<string>('0');

  // -----------------------------------------------------------
  // Middle-Bottom Simulator Radial Hub State
  // -----------------------------------------------------------
  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'size' | 'color' | 'shape' | 'fill' | 'eraser' | null>(null);

  // -----------------------------------------------------------
  // Bottom-Right Rocket Jet Mode State
  // -----------------------------------------------------------
  const [isRocketMode, setIsRocketMode] = useState(false);
  const [rocketSpeed, setRocketSpeed] = useState<number>(18);
  const [rocketAngle, setRocketAngle] = useState<number>(0);
  const [isThrusting, setIsThrusting] = useState(false);
  const mouseScreenPos = useRef<Point>({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);

  // -----------------------------------------------------------
  // Coordinate Conversions
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

  // Teleport viewport
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
  // Canvas Renderer
  // -----------------------------------------------------------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark Obsidian Canvas Background
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Infinite Dot Matrix Grid
    const gridSize = 36 * zoom;
    const offsetX = panOffset.x % gridSize;
    const offsetY = panOffset.y % gridSize;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      for (let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2 * Math.min(zoom, 1.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // World Origin (0,0) Subtle Axis Lines
    const origin = worldToScreen(0, 0);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(origin.x, 0);
    ctx.lineTo(origin.x, canvas.height);
    ctx.moveTo(0, origin.y);
    ctx.lineTo(canvas.width, origin.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Transform Context for World Elements
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw Elements
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
      } else if (
        el.type === 'shape' &&
        el.startX !== undefined &&
        el.startY !== undefined &&
        el.endX !== undefined &&
        el.endY !== undefined
      ) {
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
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
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

  // Resize handler
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
  // Rocket Mode 2D Physics Loop (Edge Proximity Acceleration)
  // -----------------------------------------------------------
  useEffect(() => {
    if (!isRocketMode) {
      setIsThrusting(false);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const proximityThreshold = 140; // Pixels from viewport edges

    const rocketTick = () => {
      const { innerWidth: width, innerHeight: height } = window;
      const mouseX = mouseScreenPos.current.x;
      const mouseY = mouseScreenPos.current.y;

      let dx = 0;
      let dy = 0;

      // Accelerate towards whichever edge the mouse is near
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
      socket.emit('endlessync:ping', () => setPingLatency(Date.now() - start));
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
  // Pointer Events & Drawing Handlers
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

      // Fast immediate stroke preview
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

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.15), 5);

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const newPanX = mouseX - (mouseX - panOffset.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - panOffset.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPanOffset({ x: newPanX, y: newPanY });
  };

  const eraseAtPoint = (point: Point) => {
    const radius = 24 / zoom;
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

  const handleClear = () => {
    if (confirm('Clear entire canvas?')) {
      setElements([]);
      socket.emit('canvas:clear');
    }
  };

  // Main Pen button click:
  // "when clicked on pen icon, the first default one automatically select, no need to click on the 5 icons before that"
  const handleMainPenClick = () => {
    if (activeTool === 'pen') {
      setActiveTool('pan');
      setIsRadialOpen(false);
      setActivePanel(null);
    } else {
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
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#07090e' }}>
      {/* ----------------------------------------------------------- */}
      {/* 1. TOP-LEFT HUD: Fixed Coordinates + Teleport Box           */}
      {/* ----------------------------------------------------------- */}
      <div
        className="dock-top-left interactive"
        style={{
          position: 'fixed',
          top: 18,
          left: 18,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          className="glass-surface"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px',
            borderRadius: 16,
          }}
        >
          <MapPin style={{ width: 16, height: 16, color: '#38bdf8' }} />
          <div style={{ fontFamily: 'monospace', fontSize: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#94a3b8' }}>
              X: <strong style={{ color: '#f8fafc' }}>{Math.round(cursorWorldPos.x)}</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>
              Y: <strong style={{ color: '#f8fafc' }}>{Math.round(cursorWorldPos.y)}</strong>
            </span>
            <span style={{ color: '#818cf8', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 8 }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <button
            onClick={() => {
              setTeleportX(String(Math.round(cursorWorldPos.x)));
              setTeleportY(String(Math.round(cursorWorldPos.y)));
              setIsTeleportOpen((prev) => !prev);
            }}
            title="Edit coordinates & teleport"
            className="btn-hover-scale"
            style={{
              padding: '4px 10px',
              borderRadius: 8,
              background: 'rgba(99, 102, 241, 0.25)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#a5b4fc',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </div>

        {/* Teleport Dropdown Panel */}
        {isTeleportOpen && (
          <div
            className="glass-popover"
            style={{
              position: 'absolute',
              top: 48,
              left: 0,
              width: 270,
              padding: 16,
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              zIndex: 60,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass style={{ width: 15, height: 15, color: '#38bdf8' }} /> Teleport Viewport
              </span>
              <button
                onClick={() => setIsTeleportOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: 'auto' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }}>Target X</label>
                <input
                  type="number"
                  value={teleportX}
                  onChange={(e) => setTeleportX(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && teleportTo(Number(teleportX), Number(teleportY))}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#111827',
                    border: '1px solid #374151',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }}>Target Y</label>
                <input
                  type="number"
                  value={teleportY}
                  onChange={(e) => setTeleportY(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && teleportTo(Number(teleportX), Number(teleportY))}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: '#111827',
                    border: '1px solid #374151',
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                onClick={() => teleportTo(Number(teleportX), Number(teleportY))}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
              >
                Teleport Now
              </button>
              <button
                onClick={() => teleportTo(0, 0)}
                title="Reset to (0, 0)"
                style={{
                  padding: '7px 12px',
                  borderRadius: 10,
                  background: '#1f2937',
                  border: '1px solid #374151',
                  color: '#cbd5e1',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                (0,0)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 2. TOP-RIGHT HUD: Connection State + Clean Canvas Action    */}
      {/* ----------------------------------------------------------- */}
      <div
        className="dock-top-right interactive"
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          className="glass-surface"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 14px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 500,
            color: isConnected ? '#6ee7b7' : '#fca5a5',
          }}
        >
          {isConnected ? (
            <Wifi style={{ width: 14, height: 14, color: '#10b981' }} />
          ) : (
            <WifiOff style={{ width: 14, height: 14, color: '#ef4444' }} />
          )}
          <span>{isConnected ? 'Sync Active' : 'Connecting...'}</span>
          {pingLatency !== null && isConnected && (
            <span style={{ fontSize: 11, opacity: 0.8, fontFamily: 'monospace', marginLeft: 4 }}>
              {pingLatency}ms
            </span>
          )}
        </div>

        <button
          onClick={handleClear}
          title="Clear Board"
          className="glass-surface btn-hover-scale"
          style={{
            padding: 9,
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <Trash2 style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. MIDDLE-BOTTOM: Simulator Hub (Big Center + 5 Satellites)  */}
      {/* ----------------------------------------------------------- */}
      <div
        className="dock-bottom-center"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Floating Rectangular Popover (Opens directly above hub) */}
        {activePanel && (
          <div
            className="glass-popover interactive"
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 20,
              minWidth: 280,
              maxWidth: 320,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 10,
                marginBottom: 12,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 6 }}>
                {activePanel === 'size' && <Sliders style={{ width: 14, height: 14, color: '#38bdf8' }} />}
                {activePanel === 'color' && <Palette style={{ width: 14, height: 14, color: '#818cf8' }} />}
                {activePanel === 'shape' && <Square style={{ width: 14, height: 14, color: '#a855f7' }} />}
                {activePanel === 'fill' && <PaintBucket style={{ width: 14, height: 14, color: '#f59e0b' }} />}
                {activePanel === 'eraser' && <Eraser style={{ width: 14, height: 14, color: '#ef4444' }} />}
                {activePanel} Settings
              </span>
              <button
                onClick={() => setActivePanel(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* 1. Size Panel */}
            {activePanel === 'size' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#cbd5e1' }}>
                  <span>Thickness:</span>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 'bold' }}>{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {PRESET_SIZES.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setStrokeWidth(p.value)}
                      style={{
                        padding: '6px 0',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 500,
                        border: strokeWidth === p.value ? '1px solid #38bdf8' : '1px solid #374151',
                        background: strokeWidth === p.value ? 'rgba(56, 189, 248, 0.2)' : '#1f2937',
                        color: strokeWidth === p.value ? '#38bdf8' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Color Panel */}
            {activePanel === 'color' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                  {PRESET_COLORS.map((col) => (
                    <button
                      key={col}
                      onClick={() => {
                        setCurrentColor(col);
                        if (isFillActive) setFillColor(col);
                      }}
                      className="btn-hover-scale"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        backgroundColor: col,
                        border: currentColor === col ? '2px solid #ffffff' : '2px solid transparent',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {currentColor === col && <Check style={{ width: 14, height: 14, color: col === '#ffffff' ? '#000' : '#fff' }} />}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Custom:</span>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => {
                      setCurrentColor(e.target.value);
                      if (isFillActive) setFillColor(e.target.value);
                    }}
                    style={{ width: 32, height: 32, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  />
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#f8fafc', textTransform: 'uppercase' }}>
                    {currentColor}
                  </span>
                </div>
              </div>
            )}

            {/* 3. Shapes Panel */}
            {activePanel === 'shape' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                {[
                  { type: 'rect' as ShapeType, icon: Square, label: 'Box' },
                  { type: 'circle' as ShapeType, icon: Circle, label: 'Oval' },
                  { type: 'line' as ShapeType, icon: Minus, label: 'Line' },
                  { type: 'arrow' as ShapeType, icon: MoveRight, label: 'Arrow' },
                  { type: 'star' as ShapeType, icon: Star, label: 'Star' },
                ].map((s) => {
                  const Icon = s.icon;
                  const isSelected = selectedShape === s.type && activeTool === 'shape';
                  return (
                    <button
                      key={s.type}
                      onClick={() => {
                        setSelectedShape(s.type);
                        setActiveTool('shape');
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '8px 4px',
                        borderRadius: 10,
                        border: isSelected ? '1px solid #38bdf8' : '1px solid #374151',
                        background: isSelected ? 'rgba(56, 189, 248, 0.2)' : '#1f2937',
                        color: isSelected ? '#fff' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      <Icon style={{ width: 18, height: 18 }} />
                      <span style={{ fontSize: 10 }}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4. Bucket Fill Panel */}
            {activePanel === 'fill' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#cbd5e1' }}>Fill Shape Surface:</span>
                  <button
                    onClick={() => setIsFillActive(!isFillActive)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 9999,
                      fontSize: 11,
                      fontWeight: 600,
                      border: 'none',
                      background: isFillActive ? '#10b981' : '#374151',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    {isFillActive ? 'Active' : 'Off'}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  Draw shapes with solid color fills or click any existing shape to apply color fill.
                </p>
              </div>
            )}

            {/* 5. Eraser Panel */}
            {activePanel === 'eraser' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>Precision Eraser</span>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                  Drag across any stroke or shape on the canvas to erase it instantly.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Central Radial Trigger & Satellites Hub */}
        <div className="radial-container interactive">
          {/* 5 Radial Satellites (Desktop Crown Arc / Mobile Row) */}
          <div className="satellite-wrapper">
            {/* Satellite 1: Size */}
            <button
              onClick={() => toggleSatellitePanel('size')}
              title="Size & Thickness"
              className={`satellite-btn satellite-1 btn-hover-scale glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activePanel === 'size' ? '#06b6d4' : undefined,
                color: activePanel === 'size' ? '#fff' : '#38bdf8',
                cursor: 'pointer',
              }}
            >
              <Sliders style={{ width: 18, height: 18 }} />
            </button>

            {/* Satellite 2: Color */}
            <button
              onClick={() => toggleSatellitePanel('color')}
              title="Color Palette"
              className={`satellite-btn satellite-2 btn-hover-scale glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activePanel === 'color' ? '#6366f1' : undefined,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: currentColor,
                  border: '2px solid rgba(255,255,255,0.7)',
                }}
              />
            </button>

            {/* Satellite 3: Shapes */}
            <button
              onClick={() => toggleSatellitePanel('shape')}
              title="Shapes Tool"
              className={`satellite-btn satellite-3 btn-hover-scale glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activePanel === 'shape' ? '#a855f7' : undefined,
                color: activePanel === 'shape' ? '#fff' : '#c084fc',
                cursor: 'pointer',
              }}
            >
              <Square style={{ width: 18, height: 18 }} />
            </button>

            {/* Satellite 4: Bucket Fill */}
            <button
              onClick={() => toggleSatellitePanel('fill')}
              title="Bucket Fill"
              className={`satellite-btn satellite-4 btn-hover-scale glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activePanel === 'fill' ? '#f59e0b' : undefined,
                color: activePanel === 'fill' ? '#000' : '#fbbf24',
                cursor: 'pointer',
              }}
            >
              <PaintBucket style={{ width: 18, height: 18 }} />
            </button>

            {/* Satellite 5: Eraser */}
            <button
              onClick={() => toggleSatellitePanel('eraser')}
              title="Eraser"
              className={`satellite-btn satellite-5 btn-hover-scale glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: activePanel === 'eraser' ? '#ef4444' : undefined,
                color: activePanel === 'eraser' ? '#fff' : '#f87171',
                cursor: 'pointer',
              }}
            >
              <Eraser style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Central Big Circular Pen Button */}
          <button
            onClick={handleMainPenClick}
            title={activeTool === 'pen' ? 'Drawing Active (Click to Pan)' : 'Start Drawing (Default Pen)'}
            className="btn-hover-scale"
            style={{
              position: 'relative',
              zIndex: 10,
              width: 66,
              height: 66,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: activeTool === 'pen' ? '3px solid #38bdf8' : '2px solid rgba(255,255,255,0.18)',
              background:
                activeTool === 'pen'
                  ? 'linear-gradient(135deg, #06b6d4, #4f46e5, #9333ea)'
                  : 'rgba(15, 23, 42, 0.9)',
              color: '#fff',
              boxShadow:
                activeTool === 'pen'
                  ? '0 0 30px rgba(56, 189, 248, 0.6), 0 10px 25px rgba(0,0,0,0.5)'
                  : '0 12px 24px rgba(0,0,0,0.4)',
              cursor: 'pointer',
            }}
          >
            <Pen style={{ width: 26, height: 26, transform: activeTool === 'pen' ? 'scale(1.1)' : 'none' }} />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. BOTTOM-RIGHT: Rocket Jet Speed Controls & Propulsion     */}
      {/* ----------------------------------------------------------- */}
      <div
        className="dock-bottom-right"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {/* Speed Tier Selector (Appears when Rocket mode is active) */}
        {isRocketMode && (
          <div
            className="glass-popover interactive"
            style={{
              padding: '10px 14px',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              minWidth: 190,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: '#f59e0b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame style={{ width: 14, height: 14 }} /> Jet Propulsion
              </span>
              <span style={{ fontFamily: 'monospace' }}>{rocketSpeed}x</span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[8, 18, 32].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setRocketSpeed(spd)}
                  style={{
                    flex: 1,
                    padding: '4px 0',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    border: rocketSpeed === spd ? '1px solid #f59e0b' : '1px solid #374151',
                    background: rocketSpeed === spd ? '#f59e0b' : '#1f2937',
                    color: rocketSpeed === spd ? '#000' : '#94a3b8',
                    cursor: 'pointer',
                  }}
                >
                  {spd === 8 ? 'Cruiser' : spd === 18 ? 'Sonic' : 'Warp'}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.2 }}>
              Move cursor near screen edges to fly canvas!
            </span>
          </div>
        )}

        {/* Main Rocket Toggle Button */}
        <button
          onClick={() => setIsRocketMode((prev) => !prev)}
          title={isRocketMode ? 'Disable Rocket Mode' : 'Enable Rocket Jet Speed Navigation'}
          className="btn-hover-scale interactive"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 18px',
            borderRadius: 18,
            border: isRocketMode ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.14)',
            background: isRocketMode
              ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
              : 'rgba(15, 23, 42, 0.88)',
            color: isRocketMode ? '#000' : '#f8fafc',
            fontWeight: 600,
            fontSize: 12,
            boxShadow: isRocketMode
              ? '0 0 25px rgba(245, 158, 11, 0.5), 0 10px 20px rgba(0,0,0,0.4)'
              : '0 10px 25px rgba(0,0,0,0.4)',
            cursor: 'pointer',
          }}
        >
          <Rocket style={{ width: 18, height: 18, color: isRocketMode ? '#000' : '#f59e0b' }} />
          <span>{isRocketMode ? 'Rocket Jet Active' : 'Rocket Jet Mode'}</span>
        </button>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 5. DYNAMIC ROCKET CURSOR (When Rocket Jet Mode is active)   */}
      {/* ----------------------------------------------------------- */}
      {isRocketMode && (
        <div
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 9999,
            left: `${mouseScreenPos.current.x}px`,
            top: `${mouseScreenPos.current.y}px`,
            transform: `translate(-50%, -50%) rotate(${rocketAngle}deg)`,
            transition: 'transform 0.06s ease-out',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Rocket
              style={{
                width: 32,
                height: 32,
                color: isThrusting ? '#fde047' : '#f59e0b',
                filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))',
                transform: isThrusting ? 'scale(1.2)' : 'scale(1)',
              }}
            />
            {isThrusting && (
              <span
                style={{
                  position: 'absolute',
                  bottom: -12,
                  width: 8,
                  height: 18,
                  background: 'linear-gradient(to top, transparent, #fbbf24, #ef4444)',
                  borderRadius: 9999,
                  filter: 'blur(1px)',
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 6. PRIMARY HIGH-PERFORMANCE INTERACTIVE HTML5 CANVAS        */}
      {/* ----------------------------------------------------------- */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none',
          cursor: isRocketMode
            ? 'none'
            : activeTool === 'pen'
            ? 'crosshair'
            : activeTool === 'eraser'
            ? 'cell'
            : activeTool === 'shape'
            ? 'crosshair'
            : 'grab',
        }}
      />
    </div>
  );
}
