'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Check,
  Plus,
  Type,
  Image as ImageIcon,
  Mic,
  MicOff,
  Play,
  Pause,
  ArrowLeft,
  Volume2,
  Volume1,
  VolumeX,
  Music,
  Settings,
  SkipForward,
  FileText,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

// -------------------------------------------------------------
// Data Types
// -------------------------------------------------------------
type ActiveTool = 'pen' | 'eraser' | 'shape' | 'fill' | 'pan' | 'text' | 'image' | 'audio';
type ShapeType = 'rect' | 'circle' | 'line' | 'arrow' | 'star';

interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: 'stroke' | 'shape' | 'text' | 'image' | 'audio';
  points?: Point[];
  shapeType?: ShapeType;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  isFilled?: boolean;
  fillOpacity?: number;
  text?: string;
  fontSize?: number;
  src?: string; // Image or Audio data URL
  title?: string;
  duration?: number;
}

// -------------------------------------------------------------
// 5 Background Ambient Tracks (with silence gaps & circular looping)
// -------------------------------------------------------------
const BACKGROUND_PLAYLIST = [
  { title: 'Cosmic Drift', src: '/media/background.mp3' },
  { title: 'Synthwave Soundscape', src: '/media/tunetank-synthwave-soundscape-348458.mp3' },
  { title: 'Exploring the Cosmos', src: '/media/monolithaudio-exploring-the-cosmos-235442.mp3' },
  { title: 'Astral Chase', src: '/media/alexander-nakarada-chase(chosic.com).mp3' },
  { title: 'Sound of Eternity', src: '/media/alien_i_trust-alien-i-trust-sound-of-eternity-original-edition-241236.mp3' },
];

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

const PRESET_ERASER_SIZES = [
  { label: 'Fine', value: 12 },
  { label: 'Medium', value: 24 },
  { label: 'Large', value: 48 },
  { label: 'Huge', value: 80 },
];

// Helper to convert Hex to RGBA
function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface CanvasBoardProps {
  onBackToLanding?: () => void;
  onOpenBlog?: (tab?: 'story' | 'guide') => void;
}

export default function CanvasBoard({ onBackToLanding, onOpenBlog }: CanvasBoardProps) {
  const router = useRouter();

  const handleBackToLanding = () => {
    if (onBackToLanding) {
      onBackToLanding();
    } else {
      router.push('/');
    }
  };

  const handleOpenBlog = (tab: 'story' | 'guide' = 'guide') => {
    if (onOpenBlog) {
      onOpenBlog(tab);
    } else {
      router.push(`/blog?tab=${tab}`);
    }
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

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
  // Canvas Elements State & In-Memory Image Cache
  // -----------------------------------------------------------
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const elementsRef = useRef<CanvasElement[]>([]);
  elementsRef.current = elements;
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // -----------------------------------------------------------
  // Tool & Styling State
  // -----------------------------------------------------------
  const [activeTool, setActiveTool] = useState<ActiveTool>('pan');
  const [currentColor, setCurrentColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rect');

  // Fill Bucket with Opacity Control (Requirement from Audio 1)
  const [isFillActive, setIsFillActive] = useState<boolean>(true);
  const [fillOpacity, setFillOpacity] = useState<number>(0.85); // 0.1 to 1.0

  // Eraser with Paint-like cursor scale (Requirement from Audio 1)
  const [eraserRadius, setEraserRadius] = useState<number>(24);

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
  // Coordinates HUD & Teleport (Top-Left)
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
  // Bottom-Left Media Ingestion Hub State (Text, Audio, Photo)
  // -----------------------------------------------------------
  const [isMediaHubOpen, setIsMediaHubOpen] = useState(false);
  const [activeMediaModal, setActiveMediaModal] = useState<'text' | 'audio' | null>(null);
  const [textInputVal, setTextInputVal] = useState('');
  const [pendingTextPos, setPendingTextPos] = useState<Point | null>(null);

  // Pending Placement State (Click to paste text, photo, or audio note)
  const [pendingPlacement, setPendingPlacement] = useState<{
    type: 'text' | 'image' | 'audio';
    text?: string;
    fontSize?: number;
    color?: string;
    src?: string;
    width?: number;
    height?: number;
    duration?: number;
    title?: string;
  } | null>(null);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });

  // Centerpiece Protected Sanctuary Emblem at Origin (0,0)
  const centerLogoRef = useRef<HTMLImageElement | null>(null);
  const [sanctuaryAlert, setSanctuaryAlert] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // -----------------------------------------------------------
  // Top-Right Settings & Ambient Background Audio Engine
  // -----------------------------------------------------------
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.5); // Default 50%
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const gapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMusicEnabledRef = useRef(isMusicEnabled);
  isMusicEnabledRef.current = isMusicEnabled;
  const musicVolumeRef = useRef(musicVolume);
  musicVolumeRef.current = musicVolume;
  const currentTrackIndexRef = useRef(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;

  const playTrack = useCallback((index: number, fadeIn = true) => {
    if (!isMusicEnabledRef.current) return;
    if (gapTimeoutRef.current) clearTimeout(gapTimeoutRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    if (!bgAudioRef.current) {
      bgAudioRef.current = new Audio();
    }
    const audio = bgAudioRef.current;
    audio.pause();
    audio.src = BACKGROUND_PLAYLIST[index].src;
    audio.loop = false;

    const targetVol = musicVolumeRef.current;
    if (fadeIn) {
      audio.volume = 0.05;
    } else {
      audio.volume = targetVol;
    }

    audio
      .play()
      .then(() => {
        setIsPlayingMusic(true);
        if (fadeIn && targetVol > 0.05) {
          let currentV = 0.05;
          const step = (targetVol - 0.05) / 20;
          fadeIntervalRef.current = setInterval(() => {
            currentV = Math.min(targetVol, currentV + step);
            if (audio) audio.volume = currentV;
            if (currentV >= targetVol && fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current);
            }
          }, 100);
        }
      })
      .catch(() => {
        setIsPlayingMusic(false);
      });

    audio.onended = () => {
      setIsPlayingMusic(false);
      // Ambient silence gap between tracks (5 seconds) before circularly playing the next track
      gapTimeoutRef.current = setTimeout(() => {
        if (!isMusicEnabledRef.current) return;
        const nextIndex = (index + 1) % BACKGROUND_PLAYLIST.length;
        setCurrentTrackIndex(nextIndex);
        currentTrackIndexRef.current = nextIndex;
        playTrack(nextIndex, true);
      }, 5000);
    };
  }, []);

  const handleVolumeChange = (newVol: number) => {
    setMusicVolume(newVol);
    musicVolumeRef.current = newVol;
    if (bgAudioRef.current) {
      bgAudioRef.current.volume = newVol;
    }
    if (newVol > 0 && !isMusicEnabled) {
      setIsMusicEnabled(true);
      isMusicEnabledRef.current = true;
      playTrack(currentTrackIndexRef.current, false);
    }
  };

  const toggleMusic = () => {
    const nextState = !isMusicEnabled;
    setIsMusicEnabled(nextState);
    isMusicEnabledRef.current = nextState;
    if (nextState) {
      playTrack(currentTrackIndexRef.current, true);
    } else {
      if (gapTimeoutRef.current) clearTimeout(gapTimeoutRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (bgAudioRef.current) bgAudioRef.current.pause();
      setIsPlayingMusic(false);
    }
  };

  const handleSkipTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % BACKGROUND_PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    currentTrackIndexRef.current = nextIndex;
    if (isMusicEnabled) {
      playTrack(nextIndex, true);
    }
  };

  // Autoplay music on user arrival / first interaction
  useEffect(() => {
    playTrack(0, true);

    const handleFirstGesture = () => {
      if (isMusicEnabledRef.current && (!bgAudioRef.current || bgAudioRef.current.paused)) {
        playTrack(currentTrackIndexRef.current, true);
      }
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      if (gapTimeoutRef.current) clearTimeout(gapTimeoutRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current.src = '';
      }
    };
  }, [playTrack]);

  // -----------------------------------------------------------
  // Bottom-Right Rocket Jet Mode State (Infinite Click-to-Fly)
  // -----------------------------------------------------------
  const [isRocketMode, setIsRocketMode] = useState(false);
  const [rocketSpeed, setRocketSpeed] = useState<number>(24);
  const [rocketAngle, setRocketAngle] = useState<number>(0);
  const [isThrusting, setIsThrusting] = useState(false);
  const isRocketClickActive = useRef(false);
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
  // Canvas Rendering Engine (Infinite Math + Media Rendering)
  // -----------------------------------------------------------
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark Obsidian Cosmic Background
    ctx.fillStyle = '#07090e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Infinite Dot Matrix Grid with continuous modulo
    const gridSize = 36 * zoom;
    const offsetX = ((panOffset.x % gridSize) + gridSize) % gridSize;
    const offsetY = ((panOffset.y % gridSize) + gridSize) % gridSize;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    for (let x = offsetX - gridSize; x < canvas.width + gridSize; x += gridSize) {
      for (let y = offsetY - gridSize; y < canvas.height + gridSize; y += gridSize) {
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

    // ---------------------------------------------------------
    // Centerpiece Sanctuary Emblem at Origin (0,0) (Protected)
    // ---------------------------------------------------------
    const SANCTUARY_RADIUS = 280;

    ctx.save();
    // 1. Dark circular base matching emblem background
    ctx.beginPath();
    ctx.arc(0, 0, SANCTUARY_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#080c14';
    ctx.fill();

    // 2. Neon cyan/indigo glowing border halo
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.stroke();

    // 3. Outer subtle dashed orbit ring
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, SANCTUARY_RADIUS + 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw clipped emblem image inside the sanctuary circle
    if (centerLogoRef.current && centerLogoRef.current.complete) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, SANCTUARY_RADIUS - 2, 0, Math.PI * 2);
      ctx.clip();
      const diameter = (SANCTUARY_RADIUS - 2) * 2;
      ctx.drawImage(centerLogoRef.current, -diameter / 2, -diameter / 2, diameter, diameter);
      ctx.restore();
    }
    ctx.restore();

    // Draw All Elements
    elementsRef.current.forEach((el) => {
      ctx.save();
      ctx.strokeStyle = el.color || '#38bdf8';
      ctx.fillStyle = el.fillColor || el.color || '#38bdf8';
      ctx.lineWidth = el.strokeWidth || 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Freehand Stroke
      if (el.type === 'stroke' && el.points && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      }
      // 2. Vector Shapes
      else if (
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
      // 3. Image Photo Pin
      else if (el.type === 'image' && el.src && el.x !== undefined && el.y !== undefined) {
        let img = imageCache.current.get(el.src);
        if (!img) {
          img = new Image();
          img.src = el.src;
          img.onload = () => renderCanvas();
          imageCache.current.set(el.src, img);
        }
        if (img.complete) {
          const w = el.width || 240;
          const h = el.height || 180;
          ctx.drawImage(img, el.x, el.y, w, h);
          // Sleek neon border around photo
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 2;
          ctx.strokeRect(el.x, el.y, w, h);
        }
      }
      // 4. Text Card Pin
      else if (el.type === 'text' && el.text && el.x !== undefined && el.y !== undefined) {
        const fontSize = el.fontSize || 18;
        ctx.font = `600 ${fontSize}px -apple-system, sans-serif`;
        const textMetrics = ctx.measureText(el.text);
        const pad = 10;
        const boxW = textMetrics.width + pad * 2;
        const boxH = fontSize + pad * 2;

        // Glass card background for text
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = el.color || '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, boxW, boxH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = el.color || '#ffffff';
        ctx.fillText(el.text, el.x + pad, el.y + pad + fontSize * 0.8);
      }
      // 5. Audio Note Pin
      else if (el.type === 'audio' && el.x !== undefined && el.y !== undefined) {
        const w = 180;
        const h = 48;
        const isPlaying = playingAudioId === el.id;

        ctx.fillStyle = isPlaying ? 'rgba(79, 70, 229, 0.85)' : 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = isPlaying ? '#38bdf8' : 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, w, h, 14);
        ctx.fill();
        ctx.stroke();

        // Icon circle
        ctx.fillStyle = isPlaying ? '#38bdf8' : '#6366f1';
        ctx.beginPath();
        ctx.arc(el.x + 24, el.y + 24, 14, 0, Math.PI * 2);
        ctx.fill();

        // Play/Pause Symbol
        ctx.fillStyle = '#ffffff';
        if (isPlaying) {
          ctx.fillRect(el.x + 19, el.y + 18, 3, 12);
          ctx.fillRect(el.x + 26, el.y + 18, 3, 12);
        } else {
          ctx.beginPath();
          ctx.moveTo(el.x + 21, el.y + 18);
          ctx.lineTo(el.x + 30, el.y + 24);
          ctx.lineTo(el.x + 21, el.y + 30);
          ctx.fill();
        }

        // Title and duration
        ctx.font = '600 12px -apple-system, sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(el.title || 'Voice Note', el.x + 46, el.y + 22);

        ctx.font = '500 10px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(isPlaying ? 'Playing...' : `${el.duration || 5}s • Click to Play`, el.x + 46, el.y + 36);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [panOffset, zoom, worldToScreen, playingAudioId]);

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
  // Rocket Mode Infinite Click-to-Fly Propulsion Loop
  // -----------------------------------------------------------
  useEffect(() => {
    if (!isRocketMode) {
      setIsThrusting(false);
      isRocketClickActive.current = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    }

    const rocketTick = () => {
      const { innerWidth: width, innerHeight: height } = window;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouseX = mouseScreenPos.current.x;
      const mouseY = mouseScreenPos.current.y;

      const dirX = mouseX - centerX;
      const dirY = mouseY - centerY;
      const dist = Math.hypot(dirX, dirY);

      if (dist > 5) {
        const angleDeg = (Math.atan2(dirY, dirX) * 180) / Math.PI + 90;
        setRocketAngle(angleDeg);
      }

      // Continuous infinite propulsion when mouse is held down
      if (isRocketClickActive.current && dist > 10) {
        setIsThrusting(true);
        const normX = dirX / dist;
        const normY = dirY / dist;

        setPanOffset((prev) => ({
          x: prev.x - normX * rocketSpeed,
          y: prev.y - normY * rocketSpeed,
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

  // Global window pointerup to safely disengage thrusters anywhere
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isRocketClickActive.current) {
        isRocketClickActive.current = false;
        setIsThrusting(false);
      }
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, []);

  // Keyboard shortcut listener (ESC to cancel pending placement or modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingPlacement(null);
        setActiveMediaModal(null);
        setActivePanel(null);
        setIsTeleportOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preload Origin Sanctuary Emblem Logo
  useEffect(() => {
    const img = new Image();
    img.src = '/media/cropped_circle_image.png';
    img.onload = () => {
      centerLogoRef.current = img;
      renderCanvas();
    };
  }, [renderCanvas]);

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
    socket.on('endlessync:users_count', onUsersCount);

    if (socket.connected) setIsConnected(true);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('endlessync:init', onInit);
      socket.off('element:added', onElementAdded);
      socket.off('element:erased', onElementErased);
      socket.off('endlessync:users_count', onUsersCount);
    };
  }, []);

  // -----------------------------------------------------------
  // Audio Player Helper
  // -----------------------------------------------------------
  const playAudioNote = (audioElement: CanvasElement) => {
    if (!audioElement.src) return;

    if (playingAudioId === audioElement.id) {
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
    }

    const audio = new Audio(audioElement.src);
    activeAudioElementRef.current = audio;
    setPlayingAudioId(audioElement.id);

    audio.onended = () => {
      setPlayingAudioId(null);
      activeAudioElementRef.current = null;
    };
    audio.play().catch(() => setPlayingAudioId(null));
  };

  // -----------------------------------------------------------
  // Precision Paint-Like Eraser (Segment Trimming & Carving)
  // -----------------------------------------------------------
  const eraseAtPoint = (point: Point) => {
    const radius = eraserRadius / zoom;
    let anyErased = false;

    setElements((prev) => {
      const next: CanvasElement[] = [];

      prev.forEach((el) => {
        // Freehand stroke carving: removes touched points and splits stroke smoothly
        if (el.type === 'stroke' && el.points) {
          const remainingSegments: Point[][] = [];
          let currentSeg: Point[] = [];

          el.points.forEach((p) => {
            if (Math.hypot(p.x - point.x, p.y - point.y) > radius) {
              currentSeg.push(p);
            } else {
              anyErased = true;
              if (currentSeg.length > 1) {
                remainingSegments.push(currentSeg);
              }
              currentSeg = [];
            }
          });
          if (currentSeg.length > 1) {
            remainingSegments.push(currentSeg);
          }

          if (remainingSegments.length > 0) {
            remainingSegments.forEach((seg, idx) => {
              next.push({
                ...el,
                id: idx === 0 ? el.id : `${el.id}_${idx}`,
                points: seg,
              });
            });
          } else {
            socket.emit('element:erase', el.id);
          }
        }
        // Shapes: delete if touched near boundaries/center
        else if (el.type === 'shape' && el.startX !== undefined && el.startY !== undefined) {
          const midX = (el.startX + (el.endX || el.startX)) / 2;
          const midY = (el.startY + (el.endY || el.startY)) / 2;
          if (Math.hypot(midX - point.x, midY - point.y) < radius * 1.6) {
            anyErased = true;
            socket.emit('element:erase', el.id);
          } else {
            next.push(el);
          }
        }
        // Text, Photo, or Audio
        else if (
          (el.type === 'text' || el.type === 'image' || el.type === 'audio') &&
          el.x !== undefined &&
          el.y !== undefined
        ) {
          if (Math.hypot(el.x - point.x, el.y - point.y) < radius * 1.6) {
            anyErased = true;
            socket.emit('element:erase', el.id);
          } else {
            next.push(el);
          }
        } else {
          next.push(el);
        }
      });

      return next;
    });
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
        } else if (el.type === 'audio' && el.x !== undefined && el.y !== undefined) {
          return point.x >= el.x && point.x <= el.x + 180 && point.y >= el.y && point.y <= el.y + 48;
        }
        return false;
      }) || null
    );
  };

  // -----------------------------------------------------------
  // Pointer Events & Drawing Handlers
  // -----------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePanel) setActivePanel(null);
    if (isTeleportOpen) setIsTeleportOpen(false);

    const worldPoint = screenToWorld(e.clientX, e.clientY);
    const SANCTUARY_RADIUS = 280;
    const isInsideSanctuary = Math.hypot(worldPoint.x, worldPoint.y) <= SANCTUARY_RADIUS;

    // 0. If there is a pending media item, click anywhere to paste it!
    if (pendingPlacement) {
      if (isInsideSanctuary) {
        setSanctuaryAlert(true);
        setTimeout(() => setSanctuaryAlert(false), 3500);
        return;
      }
      let newElement: CanvasElement;

      if (pendingPlacement.type === 'text') {
        newElement = {
          id: `text_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'text',
          text: pendingPlacement.text || '',
          x: worldPoint.x,
          y: worldPoint.y,
          color: pendingPlacement.color || currentColor,
          fontSize: pendingPlacement.fontSize || 18,
        };
      } else if (pendingPlacement.type === 'image' && pendingPlacement.src) {
        const w = pendingPlacement.width || 240;
        const h = pendingPlacement.height || 180;
        newElement = {
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'image',
          src: pendingPlacement.src,
          x: worldPoint.x - w / 2,
          y: worldPoint.y - h / 2,
          width: w,
          height: h,
        };
      } else if (pendingPlacement.type === 'audio' && pendingPlacement.src) {
        newElement = {
          id: `audio_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'audio',
          src: pendingPlacement.src,
          x: worldPoint.x - 90,
          y: worldPoint.y - 24,
          duration: pendingPlacement.duration || 0,
          title: pendingPlacement.title || 'Voice Note',
        };
      } else {
        setPendingPlacement(null);
        return;
      }

      setElements((prev) => [...prev, newElement]);
      socket.emit('element:add', newElement);
      setPendingPlacement(null);
      isInteracting.current = false;
      return;
    }

    if (isRocketMode) {
      isRocketClickActive.current = true;
      setIsThrusting(true);
      return;
    }

    // Prevent drawing or modifying inside the reserved center sanctuary
    if (activeTool === 'pen' || activeTool === 'shape' || activeTool === 'fill' || activeTool === 'text') {
      if (isInsideSanctuary) {
        setSanctuaryAlert(true);
        setTimeout(() => setSanctuaryAlert(false), 3500);
        isInteracting.current = false;
        return;
      }
    }

    startPoint.current = worldPoint;
    isInteracting.current = true;

    // Check if clicked an audio note pin
    const clickedElement = findElementNearPoint(worldPoint);
    if (clickedElement && clickedElement.type === 'audio') {
      playAudioNote(clickedElement);
      isInteracting.current = false;
      return;
    }

    if (activeTool === 'pen') {
      currentStroke.current = [worldPoint];
    } else if (activeTool === 'eraser') {
      eraseAtPoint(worldPoint);
    } else if (activeTool === 'fill') {
      // Bucket Fill Tool: fill clicked shape with chosen color and opacity
      if (clickedElement && clickedElement.type === 'shape') {
        const computedFill = hexToRgba(currentColor, fillOpacity);
        const updated: CanvasElement = {
          ...clickedElement,
          isFilled: true,
          fillColor: computedFill,
          fillOpacity: fillOpacity,
        };
        setElements((prev) => prev.map((el) => (el.id === clickedElement.id ? updated : el)));
        socket.emit('element:add', updated);
      }
    } else if (activeTool === 'text') {
      // Set text placement coordinate
      setPendingTextPos(worldPoint);
      setActiveMediaModal('text');
      isInteracting.current = false;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    mouseScreenPos.current = { x: e.clientX, y: e.clientY };
    if (pendingPlacement) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
    const worldPoint = screenToWorld(e.clientX, e.clientY);
    setCursorWorldPos(worldPoint);

    if (!isInteracting.current) return;

    if (activeTool === 'pan' || (!activeTool && !isRocketMode)) {
      setPanOffset((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    } else if (activeTool === 'pen') {
      // Prevent drawing into the protected origin sanctuary
      if (Math.hypot(worldPoint.x, worldPoint.y) <= 280) {
        return;
      }
      currentStroke.current.push(worldPoint);

      // Low-latency stroke rendering
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
          ctx.fillStyle = isFillActive ? hexToRgba(currentColor, fillOpacity) : 'transparent';
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
    if (isRocketMode) {
      isRocketClickActive.current = false;
      setIsThrusting(false);
      return;
    }

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
      // Prevent committing shapes overlapping the protected origin sanctuary
      if (
        Math.hypot(startPoint.current.x, startPoint.current.y) <= 280 ||
        Math.hypot(worldPoint.x, worldPoint.y) <= 280
      ) {
        setSanctuaryAlert(true);
        setTimeout(() => setSanctuaryAlert(false), 3500);
        renderCanvas();
        return;
      }

      const computedFill = hexToRgba(currentColor, fillOpacity);
      const newShape: CanvasElement = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: 'shape',
        shapeType: selectedShape,
        startX: startPoint.current.x,
        startY: startPoint.current.y,
        endX: worldPoint.x,
        endY: worldPoint.y,
        color: currentColor,
        fillColor: isFillActive ? computedFill : undefined,
        fillOpacity: fillOpacity,
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

  // -----------------------------------------------------------
  // Media Insertion Handlers (Text, Image, Audio)
  // -----------------------------------------------------------

  // 1. Text Submission -> Prepare for Click-to-Paste
  const handleSaveTextNote = () => {
    if (!textInputVal.trim()) {
      setActiveMediaModal(null);
      return;
    }
    setPendingPlacement({
      type: 'text',
      text: textInputVal.trim(),
      color: currentColor,
      fontSize: 18,
    });
    setTextInputVal('');
    setActiveMediaModal(null);
    setIsMediaHubOpen(false);
    setActiveTool('pan');
  };

  // 2. Photo / Image Upload -> Prepare for Click-to-Paste
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPendingPlacement({
        type: 'image',
        src: dataUrl,
        width: 240,
        height: 180,
      });
      setIsMediaHubOpen(false);
      setActiveTool('pan');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // 3. Audio Recording -> Prepare for Click-to-Paste
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setPendingPlacement({
            type: 'audio',
            src: base64Audio,
            duration: recordTimer,
            title: `Voice Note (${recordTimer}s)`,
          });
          setActiveMediaModal(null);
          setIsMediaHubOpen(false);
          setActiveTool('pan');
        };
        reader.readAsDataURL(audioBlob);

        // Stop media tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTimer(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone access is required to pin voice notes.');
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    }
  };

  // -----------------------------------------------------------
  // Central Hub Activation Handler
  // -----------------------------------------------------------
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
      {/* Hidden file input for Photo Upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        style={{ display: 'none' }}
      />

      {/* ----------------------------------------------------------- */}
      {/* 1. TOP-LEFT HUD: Back to Home + Live Coordinates + Teleport */}
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
        {/* Back to Landing Button */}
        <button
          onClick={handleBackToLanding}
          title="Return to Endlessync Overview"
          className="glass-surface interactive-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 14,
            color: '#38bdf8',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          <span className="hidden sm:inline">Home</span>
        </button>

        {/* Read Blog / Guide Button */}
        <button
          onClick={() => handleOpenBlog('guide')}
          title="Read Founder Story & Guide"
          className="glass-surface interactive-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            borderRadius: 14,
            color: '#a855f7',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <BookOpen style={{ width: 14, height: 14 }} />
          <span className="hidden sm:inline">Story & Guide</span>
        </button>

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
            className="interactive-btn"
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
      {/* 2. TOP-RIGHT HUD: Settings Gear & Audio Controls (Replaces sync) */}
      {/* ----------------------------------------------------------- */}
      <div
        className="dock-top-right interactive"
        style={{
          position: 'fixed',
          top: 18,
          right: 18,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
        }}
      >
        {/* Settings Gear Trigger Button */}
        <button
          onClick={() => setIsSettingsOpen((prev) => !prev)}
          title="Settings & Audio"
          className="glass-surface interactive-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 14px',
            borderRadius: 16,
            color: isSettingsOpen ? '#38bdf8' : '#e2e8f0',
            border: isSettingsOpen ? '1px solid rgba(56, 189, 248, 0.5)' : undefined,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Settings
            style={{
              width: 16,
              height: 16,
              color: isSettingsOpen ? '#38bdf8' : '#94a3b8',
              transform: isSettingsOpen ? 'rotate(45deg)' : 'none',
              transition: 'transform 0.25s ease',
            }}
          />
          <span className="hidden sm:inline">Settings</span>
          {isMusicEnabled && isPlayingMusic && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
          )}
        </button>

        {/* Settings Dropdown Popover */}
        {isSettingsOpen && (
          <div
            className="glass-popover"
            style={{
              width: 290,
              padding: 16,
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                paddingBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff' }}>
                <Music style={{ width: 16, height: 16, color: '#38bdf8' }} />
                <span>Audio & Settings</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Music Toggle (ON / OFF) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc' }}>Background Music</span>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                  {isMusicEnabled ? (isPlayingMusic ? 'Playing with gaps' : 'Intermission / Paused') : 'Muted'}
                </span>
              </div>
              <button
                onClick={toggleMusic}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: isMusicEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                  border: isMusicEnabled ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(239, 68, 68, 0.4)',
                  color: isMusicEnabled ? '#6ee7b7' : '#fca5a5',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isMusicEnabled ? <Volume2 style={{ width: 14, height: 14 }} /> : <VolumeX style={{ width: 14, height: 14 }} />}
                <span>{isMusicEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Volume Slider (Lower / Higher, Default 50%) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
                <span>Music Volume</span>
                <span style={{ fontWeight: 600, color: '#38bdf8' }}>{Math.round(musicVolume * 100)}%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Volume1 style={{ width: 14, height: 14, color: '#94a3b8' }} />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                <Volume2 style={{ width: 14, height: 14, color: '#38bdf8' }} />
              </div>
            </div>

            {/* Track Info & Skip Next */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: 10,
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: 11,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ color: '#94a3b8', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Track {currentTrackIndex + 1} of {BACKGROUND_PLAYLIST.length}
                </span>
                <span style={{ color: '#f8fafc', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {BACKGROUND_PLAYLIST[currentTrackIndex]?.title}
                </span>
              </div>
              <button
                onClick={handleSkipTrack}
                title="Skip to next track"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                <span>Skip</span>
                <SkipForward style={{ width: 12, height: 12 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 3. BOTTOM-LEFT: Media Hub (Text, Audio, Photo Ingestion)   */}
      {/* ----------------------------------------------------------- */}
      <div
        className="dock-bottom-left"
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        {/* Inline Text Creation Modal */}
        {activeMediaModal === 'text' && (
          <div
            className="glass-popover interactive"
            style={{
              marginBottom: 12,
              padding: 16,
              borderRadius: 18,
              width: 280,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Type style={{ width: 14, height: 14, color: '#38bdf8' }} /> Pin Text Card
              </span>
              <button
                onClick={() => setActiveMediaModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
            <textarea
              autoFocus
              rows={3}
              placeholder="Type your message, note, or brainstorm idea..."
              value={textInputVal}
              onChange={(e) => setTextInputVal(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 10,
                background: '#111827',
                border: '1px solid #374151',
                color: '#fff',
                fontSize: 12,
                outline: 'none',
                resize: 'none',
              }}
            />
            <button
              onClick={handleSaveTextNote}
              style={{
                padding: '8px 0',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                border: 'none',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ready to Place (Click Canvas to Paste)
            </button>
          </div>
        )}

        {/* Audio Recording Modal */}
        {activeMediaModal === 'audio' && (
          <div
            className="glass-popover interactive"
            style={{
              marginBottom: 12,
              padding: 16,
              borderRadius: 18,
              width: 280,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mic style={{ width: 14, height: 14, color: '#f43f5e' }} /> Record Voice Note
              </span>
              <button
                onClick={() => {
                  stopRecordingAudio();
                  setActiveMediaModal(null);
                }}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              {isRecording ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div className="flex items-center gap-1.5 h-6">
                    <span className="w-1.5 h-4 bg-rose-500 animate-pulse rounded-full" />
                    <span className="w-1.5 h-6 bg-rose-400 animate-pulse rounded-full" />
                    <span className="w-1.5 h-3 bg-rose-500 animate-pulse rounded-full" />
                    <span className="w-1.5 h-5 bg-rose-400 animate-pulse rounded-full" />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 18, color: '#f43f5e', fontWeight: 'bold' }}>
                    00:{recordTimer < 10 ? `0${recordTimer}` : recordTimer}
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Recording live audio...</span>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: '#cbd5e1' }}>
                  Click below to record a voice note and then click to paste anywhere.
                </span>
              )}
            </div>

            {isRecording ? (
              <button
                onClick={stopRecordingAudio}
                style={{
                  padding: '9px 0',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #ef4444, #be123c)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                }}
              >
                Stop & Ready to Place
              </button>
            ) : (
              <button
                onClick={startRecordingAudio}
                style={{
                  padding: '9px 0',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  border: 'none',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Start Recording
              </button>
            )}
          </div>
        )}

        {/* Media Hub Trigger & Satellites */}
        <div className="media-container interactive">
          {/* Satellite 1: Text */}
          <button
            onClick={() => {
              setActiveTool('text');
              setActiveMediaModal('text');
            }}
            title="Attach Text Note"
            className={`media-satellite-btn media-sat-1 glass-surface ${!isMediaHubOpen ? 'media-sat-closed' : ''}`}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <Type style={{ width: 17, height: 17 }} />
          </button>

          {/* Satellite 2: Voice Note */}
          <button
            onClick={() => setActiveMediaModal('audio')}
            title="Record Voice Note"
            className={`media-satellite-btn media-sat-2 glass-surface ${!isMediaHubOpen ? 'media-sat-closed' : ''}`}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f43f5e',
            }}
          >
            <Mic style={{ width: 17, height: 17 }} />
          </button>

          {/* Satellite 3: Photo Upload */}
          <button
            onClick={() => imageInputRef.current?.click()}
            title="Drop Image Photo"
            className={`media-satellite-btn media-sat-3 glass-surface ${!isMediaHubOpen ? 'media-sat-closed' : ''}`}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <ImageIcon style={{ width: 17, height: 17 }} />
          </button>

          {/* Main Media Hub Plus Button */}
          <button
            onClick={() => setIsMediaHubOpen(!isMediaHubOpen)}
            title="Attach Media (Text, Voice, Photos)"
            className="interactive-btn"
            style={{
              position: 'relative',
              zIndex: 10,
              width: 54,
              height: 54,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: isMediaHubOpen ? '2px solid #818cf8' : '2px solid rgba(255,255,255,0.18)',
              background: isMediaHubOpen
                ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                : 'rgba(15, 23, 42, 0.9)',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              cursor: 'pointer',
            }}
          >
            <Plus
              style={{
                width: 22,
                height: 22,
                transform: isMediaHubOpen ? 'rotate(45deg)' : 'none',
                transition: 'transform 0.25s ease',
              }}
            />
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------- */}
      {/* 4. MIDDLE-BOTTOM: Simulator Hub with Raised Popover Margin  */}
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
        {/* Raised Popover Panel - Placed well above the satellite crown */}
        {activePanel && (
          <div
            className="glass-popover interactive satellite-popover-panel"
            style={{
              marginBottom: 84, // Clean vertical clearance so it NEVER overlaps satellite icons!
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
                      onClick={() => setCurrentColor(col)}
                      className="interactive-btn"
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
                    onChange={(e) => setCurrentColor(e.target.value)}
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

            {/* 4. Bucket Fill Panel with Transparency / Opacity Slider (Audio 1) */}
            {activePanel === 'fill' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#cbd5e1' }}>Fill Status:</span>
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

                {/* Opacity / Transparency Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                    <span>Opacity / Transparency:</span>
                    <strong style={{ color: '#f59e0b', fontFamily: 'monospace' }}>
                      {Math.round(fillOpacity * 100)}% ({fillOpacity === 1 ? 'Bold' : fillOpacity <= 0.3 ? 'Glass' : 'Tint'})
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={fillOpacity}
                    onChange={(e) => setFillOpacity(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b' }}
                  />

                  {/* Transparency Presets */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 4 }}>
                    {[
                      { label: 'Glass (25%)', val: 0.25 },
                      { label: 'Tint (60%)', val: 0.6 },
                      { label: 'Bold (100%)', val: 1.0 },
                    ].map((pre) => (
                      <button
                        key={pre.label}
                        onClick={() => setFillOpacity(pre.val)}
                        style={{
                          padding: '5px 0',
                          borderRadius: 8,
                          fontSize: 10,
                          fontWeight: 500,
                          border: fillOpacity === pre.val ? '1px solid #f59e0b' : '1px solid #374151',
                          background: fillOpacity === pre.val ? 'rgba(245, 158, 11, 0.25)' : '#1f2937',
                          color: fillOpacity === pre.val ? '#fbbf24' : '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        {pre.label}
                      </button>
                    ))}
                  </div>

                  {/* Checkerboard Preview Box */}
                  <div
                    style={{
                      height: 24,
                      borderRadius: 6,
                      marginTop: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundImage: `repeating-conic-gradient(#374151 0% 25%, #1f2937 0% 50%)`,
                      backgroundSize: '12px 12px',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 6,
                        backgroundColor: hexToRgba(currentColor, fillOpacity),
                      }}
                    />
                  </div>
                </div>

                <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                  Click any existing shape to fill it, or draw new shapes with this opacity.
                </p>
              </div>
            )}

            {/* 5. Precision Paint Eraser with Scale (Audio 1) */}
            {activePanel === 'eraser' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#cbd5e1' }}>
                  <span>Eraser Size:</span>
                  <span style={{ fontFamily: 'monospace', color: '#ef4444', fontWeight: 'bold' }}>
                    {eraserRadius * 2}px
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="60"
                  value={eraserRadius}
                  onChange={(e) => setEraserRadius(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#ef4444' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {PRESET_ERASER_SIZES.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setEraserRadius(p.value)}
                      style={{
                        padding: '6px 0',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 500,
                        border: eraserRadius === p.value ? '1px solid #ef4444' : '1px solid #374151',
                        background: eraserRadius === p.value ? 'rgba(239, 68, 68, 0.2)' : '#1f2937',
                        color: eraserRadius === p.value ? '#f87171' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, lineHeight: 1.3 }}>
                  Drag over strokes to carve and trim parts seamlessly like Paint.
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
              className={`satellite-btn satellite-1 glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
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
              className={`satellite-btn satellite-2 glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
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
              className={`satellite-btn satellite-3 glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
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
              title="Bucket Fill (Transparency / Bold)"
              className={`satellite-btn satellite-4 glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
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
              title="Paint Eraser"
              className={`satellite-btn satellite-5 glass-surface ${!isRadialOpen ? 'satellite-closed' : ''}`}
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
            className="main-pen-btn"
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
      {/* 5. BOTTOM-RIGHT: Rocket Jet Speed Controls (Click-to-Fly)   */}
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
              {[10, 24, 48].map((spd) => (
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
                  {spd === 10 ? 'Cruiser' : spd === 24 ? 'Sonic' : 'Warp'}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 9, color: '#fcd34d', lineHeight: 1.2 }}>
              Click & hold anywhere to fly rocket infinitely!
            </span>
          </div>
        )}

        <button
          onClick={() => {
            setIsRocketMode((prev) => {
              const next = !prev;
              if (next) {
                setActiveTool('pan');
                setIsRadialOpen(false);
                setActivePanel(null);
                setIsMediaHubOpen(false);
              }
              return next;
            });
          }}
          title={isRocketMode ? 'Disable Rocket Mode' : 'Enable Rocket Jet Speed Navigation'}
          className="interactive-btn interactive"
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
      {/* 6. DYNAMIC ROCKET CURSOR (When Rocket Jet Mode is active)   */}
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
      {/* 7. DYNAMIC PAINT ERASER CIRCULAR CURSOR                    */}
      {/* ----------------------------------------------------------- */}
      {activeTool === 'eraser' && !isRocketMode && (
        <div
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 9999,
            left: `${mouseScreenPos.current.x}px`,
            top: `${mouseScreenPos.current.y}px`,
            width: `${eraserRadius * 2 * zoom}px`,
            height: `${eraserRadius * 2 * zoom}px`,
            borderRadius: '50%',
            border: '2px solid rgba(239, 68, 68, 0.8)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
          }}
        />
      )}

      {/* ----------------------------------------------------------- */}
      {/* 8. PENDING PLACEMENT FLOATING PLUS STAMP & TOP BANNER       */}
      {/* ----------------------------------------------------------- */}
      {pendingPlacement && (
        <>
          {/* Top banner instructing user */}
          <div
            className="dock-top-center interactive"
            style={{
              position: 'fixed',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 70,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 20px',
              borderRadius: 30,
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.35)',
              color: '#fff',
              fontSize: 12,
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid #38bdf8',
                }}
              >
                <Plus style={{ width: 15, height: 15 }} />
              </div>
              <span>
                <strong>Click anywhere on canvas</strong> to paste your{' '}
                <span style={{ color: '#38bdf8' }}>
                  {pendingPlacement.type === 'text'
                    ? 'Text Note'
                    : pendingPlacement.type === 'image'
                    ? 'Photo'
                    : 'Voice Note'}
                </span>
              </span>
            </div>
            <button
              onClick={() => setPendingPlacement(null)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 12,
                padding: '3px 10px',
                fontSize: 11,
                color: '#cbd5e1',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Cancel (ESC)
            </button>
          </div>

          {/* Floating Stamp following mouse position */}
          <div
            style={{
              position: 'fixed',
              pointerEvents: 'none',
              zIndex: 9999,
              left: `${mousePos.x || mouseScreenPos.current.x}px`,
              top: `${mousePos.y || mouseScreenPos.current.y}px`,
              transform: 'translate(14px, 14px)',
            }}
          >
            <div
              className="glass-surface"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 20,
                border: '1px solid #38bdf8',
                background: 'rgba(15, 23, 42, 0.95)',
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus style={{ width: 14, height: 14, color: '#38bdf8' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: '#f8fafc' }}>
                Click to paste{' '}
                {pendingPlacement.type === 'text'
                  ? 'Text Note'
                  : pendingPlacement.type === 'image'
                  ? 'Photo'
                  : 'Voice Note'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 9. PROTECTED SANCTUARY ALERT TOAST                          */}
      {/* ----------------------------------------------------------- */}
      {sanctuaryAlert && (
        <div
          className="dock-top-center interactive"
          style={{
            position: 'fixed',
            top: 76,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 24,
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1px solid rgba(244, 63, 94, 0.7)',
            boxShadow: '0 0 30px rgba(244, 63, 94, 0.4)',
            color: '#fff',
            fontSize: 12,
            backdropFilter: 'blur(16px)',
          }}
        >
          <ShieldCheck style={{ width: 18, height: 18, color: '#f43f5e' }} />
          <span>
            <strong style={{ color: '#fda4af' }}>Protected Origin Sanctuary (0, 0):</strong> The Endlessync centerpiece emblem is reserved and cannot be drawn on or edited.
          </span>
          <button
            onClick={() => setSanctuaryAlert(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              marginLeft: 4,
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* 10. PRIMARY INTERACTIVE HTML5 CANVAS                        */}
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
            : pendingPlacement
            ? 'crosshair'
            : activeTool === 'pen'
            ? 'crosshair'
            : activeTool === 'eraser'
            ? 'none'
            : activeTool === 'shape'
            ? 'crosshair'
            : activeTool === 'text'
            ? 'text'
            : 'grab',
        }}
      />
    </div>
  );
}
