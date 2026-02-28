'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Stage, Layer, Line, Image as KonvaImage, Circle, Text as KonvaText, Rect, Ellipse, Transformer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { socket } from '@/lib/socket';
import { Hand, Pencil, Type, Mic, Square, Image as ImageIcon, MousePointer2, Shapes, Circle as CircleIcon, Wrench, X } from 'lucide-react';
import useImage from 'use-image';

// Types
type Tool = 'pan' | 'pen' | 'text' | 'select' | 'voice' | 'image' | 'shape';

type BaseElement = {
    id: string;
    type: string;
    x: number;
    y: number;
};

type BrushElement = BaseElement & {
    type: 'brush';
    points: number[];
    color: string;
    strokeWidth: number;
    dash?: number[];
    brushStyle?: 'solid' | 'dashed' | 'highlighter';
};

type TextElement = BaseElement & {
    type: 'text';
    text: string;
    fontSize: number;
    color: string;
};

type ImageElement = BaseElement & {
    type: 'image';
    src: string;
    width: number;
    height: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
};

type AudioElement = BaseElement & {
    type: 'audio';
    src: string;
};

type ShapeElement = BaseElement & {
    type: 'shape';
    shapeType: 'rectangle' | 'ellipse';
    width: number;
    height: number;
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
};

type CanvasElement = BrushElement | TextElement | ImageElement | AudioElement | ShapeElement;

// Persistent Global Cache to prevent images from ever disappearing on re-renders/zooms
const imageCache: Record<string, HTMLImageElement> = {};

// Custom hook to load an image for Konva
const URLImage = ({ element, tool, setSelectedId, handleDragEnd }: {
    element: ImageElement;
    tool: string;
    setSelectedId: (id: string | null) => void;
    handleDragEnd: (e: any, id: string) => void;
}) => {
    const [image, setImage] = useState<HTMLImageElement | null>(imageCache[element.src] || null);

    useEffect(() => {
        if (imageCache[element.src]) {
            setImage(imageCache[element.src]);
            return;
        }

        const img = new window.Image();
        img.src = element.src;
        img.onload = () => {
            imageCache[element.src] = img;
            setImage(img);
        };
    }, [element.src]);

    return (
        <KonvaImage
            id={element.id}
            image={image || undefined}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            scaleX={element.scaleX || 1}
            scaleY={element.scaleY || 1}
            rotation={element.rotation || 0}
            draggable={tool === 'select'}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onClick={() => { if (tool === 'select') setSelectedId(element.id); }}
            onTap={() => { if (tool === 'select') setSelectedId(element.id); }}
        />
    );
};

// Transformer component bindings
const TransformerComponent = ({ selectedId, onTransformEnd }: { selectedId: string, onTransformEnd: (id: string, newProps: any) => void }) => {
    const trRef = useRef<any>(null);
    useEffect(() => {
        if (selectedId && trRef.current) {
            const stage = trRef.current.getStage();
            const selectedNode = stage.findOne('#' + selectedId);
            if (selectedNode) {
                trRef.current.nodes([selectedNode]);
                trRef.current.getLayer().batchDraw();
            }
        }
    }, [selectedId]);
    return <Transformer ref={trRef} onTransformEnd={(e) => onTransformEnd(selectedId, e.target)} />;
};

// Global state for background theme
let INITIAL_BG = '#e5e5f7';

// Returns true if any part of the bounding box overlaps the protected circle
const isProtectedBoundingBox = (x: number, y: number, width: number, height: number) => {
    const minX = Math.min(x, x + width);
    const maxX = Math.max(x, x + width);
    const minY = Math.min(y, y + height);
    const maxY = Math.max(y, y + height);

    const closestX = Math.max(minX, Math.min(0, maxX));
    const closestY = Math.max(minY, Math.min(0, maxY));

    const distanceX = 0 - closestX;
    const distanceY = 0 - closestY;

    return (distanceX * distanceX + distanceY * distanceY) <= 90000; // 300px radius to provide ample padding
};

// Returns adjusted dimensions capped at maxWidth
const constrainDimensions = (width: number, height: number, maxWidth: number) => {
    if (width <= maxWidth && height <= maxWidth) return { width, height };
    const ratio = width / height;
    if (width > height) {
        return { width: maxWidth, height: maxWidth / ratio };
    } else {
        return { width: maxWidth * ratio, height: maxWidth };
    }
};

export default function CanvasBoard() {
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [tool, setTool] = useState<Tool>('pan');
    const [activeTextInput, setActiveTextInput] = useState<{ x: number, y: number, value: string, id?: string } | null>(null);
    const contentEditableRef = useRef<HTMLDivElement>(null);
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
    const [isNavigating, setIsNavigating] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Shape State
    const [shapeType, setShapeType] = useState<'rectangle' | 'ellipse'>('rectangle');
    const currentShapeParams = useRef<{ id: string, startX: number, startY: number } | null>(null);

    // Global Theme State
    const [canvasBg, setCanvasBg] = useState(INITIAL_BG);

    // Easter Egg State
    const [hasClickedYellow, setHasClickedYellow] = useState(false);

    // Voice State
    const [isRecording, setIsRecording] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    setRecordedAudioUrl(reader.result as string);
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordedAudioUrl(null);
        } catch (err) {
            console.error("Error accessing mic:", err);
            alert("Could not access microphone. Please allow permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Image Placement State
    const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
    const [stagedImageDimensions, setStagedImageDimensions] = useState<{ width: number, height: number } | null>(null);

    const handleImageUploadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                const img = new window.Image();
                img.src = src;
                img.onload = () => {
                    setStagedImageUrl(src);
                    setStagedImageDimensions({ width: img.width, height: img.height });
                };
            };
            reader.readAsDataURL(file);
        }
    };

    // Pen State
    const [brushColor, setBrushColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [brushStyle, setBrushStyle] = useState<'solid' | 'dashed'>('solid');

    // Drawing State
    const [isDrawing, setIsDrawing] = useState(false);
    const currentLineParams = useRef<{ id: string, points: number[] } | null>(null);

    // Resize handling
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
        const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Socket setup
    useEffect(() => {
        if (activeTextInput && contentEditableRef.current) {
            // Focus the editable div and place cursor at end
            const el = contentEditableRef.current;
            el.focus();
            if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
                const range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                const sel = window.getSelection();
                sel?.removeAllRanges();
                sel?.addRange(range);
            }
        }
    }, [activeTextInput]);

    useEffect(() => {
        socket.on('init_elements', (serverElements: CanvasElement[]) => {
            setElements(serverElements);
        });

        socket.on('init_bg', (bgURL: string) => {
            setCanvasBg(bgURL || INITIAL_BG);
        });

        socket.on('element_added', (element: CanvasElement) => {
            setElements((prev) => {
                const map = new Map(prev.map(p => [p.id, p]));
                map.set(element.id, element);
                return Array.from(map.values());
            });
        });

        socket.on('bg_changed', (newBg: string) => {
            setCanvasBg(newBg);
        });

        socket.on('canvas_cleared', () => {
            setElements([]);
        });

        return () => {
            socket.off('init_elements');
            socket.off('init_bg');
            socket.off('element_added');
            socket.off('bg_changed');
            socket.off('canvas_cleared');
        };
    }, []);

    // Handle pasting images/text
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            // Ignore if we are currently typing in an active text box
            if (activeTextInput) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            // Find image
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const src = event.target?.result as string;

                            // Load image to get natural dimensions
                            const img = new window.Image();
                            img.src = src;
                            img.onload = () => {
                                // Determine center of screen in logical coordinates
                                const centerLogicalX = (-stagePos.x + dimensions.width / 2) / scale;
                                const centerLogicalY = (-stagePos.y + dimensions.height / 2) / scale;

                                const { width: cWidth, height: cHeight } = constrainDimensions(img.width, img.height, 800);

                                if (isProtectedBoundingBox(centerLogicalX - cWidth / 2, centerLogicalY - cHeight / 2, cWidth, cHeight)) {
                                    alert("Cannot paste images inside the reserved area. Please paste further away!");
                                    return;
                                }

                                const newElement: ImageElement = {
                                    id: uuidv4(),
                                    type: 'image',
                                    src,
                                    x: centerLogicalX - cWidth / 2,
                                    y: centerLogicalY - cHeight / 2,
                                    width: cWidth,
                                    height: cHeight,
                                };

                                setElements((prev) => [...prev, newElement]);
                                socket.emit('add_element', newElement);
                            };
                        };
                        reader.readAsDataURL(blob);
                    }
                    return; // Stop after first image found
                }
            }

            // If no image, check for text
            const pastedText = e.clipboardData?.getData('text');
            if (pastedText) {
                const centerLogicalX = (-stagePos.x + dimensions.width / 2) / scale;
                const centerLogicalY = (-stagePos.y + dimensions.height / 2) / scale;

                const newElement: TextElement = {
                    id: uuidv4(),
                    type: 'text',
                    text: pastedText,
                    x: centerLogicalX,
                    y: centerLogicalY,
                    fontSize: 24,
                    color: 'black',
                };

                setElements((prev) => [...prev, newElement]);
                socket.emit('add_element', newElement);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [stagePos, scale, dimensions, activeTextInput]);

    // Zoom handling (Infinite Canvas feature)
    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        setScale(newScale);

        setStagePos({
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        });
    };

    // Keyboard Panning
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is currently typing text or coordinates
            if (activeTextInput || isNavigating) return;
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            const speed = 50; // "a little fast speed"

            switch (e.key) {
                case 'w':
                case 'W':
                case 'ArrowUp':
                    setStagePos(p => ({ ...p, y: p.y + speed }));
                    break;
                case 's':
                case 'S':
                case 'ArrowDown':
                    setStagePos(p => ({ ...p, y: p.y - speed }));
                    break;
                case 'a':
                case 'A':
                case 'ArrowLeft':
                    setStagePos(p => ({ ...p, x: p.x + speed }));
                    break;
                case 'd':
                case 'D':
                case 'ArrowRight':
                    setStagePos(p => ({ ...p, x: p.x - speed }));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTextInput, isNavigating]);

    const updatePointerPos = (e: any) => {
        if (isNavigating) return;
        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const x = Math.round((pos.x - stagePos.x) / scale);
        const y = Math.round((pos.y - stagePos.y) / scale);
        setPointerPos({ x, y });
    };

    const commitTextInput = useCallback(() => {
        if (!activeTextInput) return;
        const finalVal = contentEditableRef.current?.innerText || '';

        if (finalVal.trim() !== '') {
            const newElement: TextElement = {
                id: activeTextInput.id || uuidv4(),
                type: 'text',
                text: finalVal,
                x: activeTextInput.x,
                y: activeTextInput.y,
                fontSize: 24,
                color: 'black',
            };

            setElements((prev) => {
                const map = new Map(prev.map(p => [p.id, p]));
                map.set(newElement.id, newElement);
                return Array.from(map.values());
            });
            socket.emit('add_element', newElement);
        }
        setActiveTextInput(null);
    }, [activeTextInput]);

    const handlePointerDown = (e: any) => {
        if (tool === 'pan') {
            const stage = e.target.getStage();
            if (e.target === stage) {
                // If pan, clear selection
                setSelectedId(null);
            }
            return;
        }

        if (tool === 'select') {
            const stage = e.target.getStage();
            // If we click on the empty stage space, clear selection
            if (e.target === stage) {
                setSelectedId(null);
            }
            return;
        }

        if (tool === 'text') {
            setSelectedId(null);
            // we spawn on onClick instead to avoid pointerdown focus issues
            return;
        }

        if (tool === 'pen') {
            setSelectedId(null);
            setIsDrawing(true);
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const x = (pos.x - stagePos.x) / scale;
            const y = (pos.y - stagePos.y) / scale;

            const newId = uuidv4();
            currentLineParams.current = { id: newId, points: [x, y] };

            const newElement: BrushElement = {
                id: newId,
                type: 'brush',
                points: [x, y],
                color: brushColor,
                strokeWidth: brushSize,
                brushStyle: brushStyle,
                dash: brushStyle === 'dashed' ? [brushSize * 2, brushSize * 2] : undefined,
                x: 0, y: 0 // offset handled in points
            };

            setElements((prev) => [...prev, newElement]);
        }

        if (tool === 'shape') {
            setSelectedId(null);
            setIsDrawing(true);
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const x = (pos.x - stagePos.x) / scale;
            const y = (pos.y - stagePos.y) / scale;

            const newId = uuidv4();
            currentShapeParams.current = { id: newId, startX: x, startY: y };

            const newElement: ShapeElement = {
                id: newId,
                type: 'shape',
                shapeType: shapeType,
                x: x,
                y: y,
                width: 0,
                height: 0,
                fillColor: 'transparent',
                strokeColor: brushColor,
                strokeWidth: brushSize,
                scaleX: 1,
                scaleY: 1,
                rotation: 0
            };

            setElements((prev) => [...prev, newElement]);
        }
    };

    const handleStageClick = (e: any) => {
        // If clicking on stage when text is active, commit it
        if (activeTextInput) {
            commitTextInput();
            return;
        }

        if (tool === 'text') {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const x = (pos.x - stagePos.x) / scale;
            const y = (pos.y - stagePos.y) / scale;

            setActiveTextInput({ x, y, value: '', id: uuidv4() });
        }

        if (tool === 'voice' && recordedAudioUrl) {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const x = (pos.x - stagePos.x) / scale;
            const y = (pos.y - stagePos.y) / scale;

            if (isProtectedBoundingBox(x - 100, y - 25, 200, 50)) {
                alert("Cannot place voice notes inside the reserved area!");
                return;
            }

            const newElement: AudioElement = {
                id: uuidv4(),
                type: 'audio',
                src: recordedAudioUrl,
                x, y
            };
            setElements((prev) => {
                const map = new Map(prev.map(p => [p.id, p]));
                map.set(newElement.id, newElement);
                return Array.from(map.values());
            });
            socket.emit('add_element', newElement);

            setRecordedAudioUrl(null);
            setTool('pan');
        }

        if (tool === 'image' && stagedImageUrl && stagedImageDimensions) {
            const stage = e.target.getStage();
            const pos = stage.getPointerPosition();
            if (!pos) return;
            const x = (pos.x - stagePos.x) / scale;
            const y = (pos.y - stagePos.y) / scale;

            const { width: cWidth, height: cHeight } = constrainDimensions(stagedImageDimensions.width, stagedImageDimensions.height, 800);

            if (isProtectedBoundingBox(x - cWidth / 2, y - cHeight / 2, cWidth, cHeight)) {
                alert("Cannot place images inside the reserved area!");
                return;
            }

            const newElement: ImageElement = {
                id: uuidv4(),
                type: 'image',
                src: stagedImageUrl,
                x: x - cWidth / 2, // Center the image on cursor
                y: y - cHeight / 2,
                width: cWidth,
                height: cHeight
            };
            setElements((prev) => {
                const map = new Map(prev.map(p => [p.id, p]));
                map.set(newElement.id, newElement);
                return Array.from(map.values());
            });
            socket.emit('add_element', newElement);

            setStagedImageUrl(null);
            setStagedImageDimensions(null);
            setTool('pan');
        }
    };

    const handlePointerMove = (e: any) => {
        updatePointerPos(e);

        if (!isDrawing) return;

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        if (!pos) return;
        const x = (pos.x - stagePos.x) / scale;
        const y = (pos.y - stagePos.y) / scale;

        if (tool === 'pen' && currentLineParams.current) {
            currentLineParams.current.points.push(x, y);

            setElements((prev) => {
                const clone = [...prev];
                const lastLine = clone[clone.length - 1];
                if (lastLine && lastLine.type === 'brush' && lastLine.id === currentLineParams.current?.id) {
                    lastLine.points = [...currentLineParams.current.points];
                }
                return clone;
            });
        }

        if (tool === 'shape' && currentShapeParams.current) {
            const startX = currentShapeParams.current.startX;
            const startY = currentShapeParams.current.startY;
            let currentX = Math.min(x, startX);
            let currentY = Math.min(y, startY);
            let currentWidth = Math.abs(x - startX);
            let currentHeight = Math.abs(y - startY);

            if (shapeType === 'ellipse') {
                currentX = startX + (x - startX) / 2 - currentWidth / 2;
                currentY = startY + (y - startY) / 2 - currentHeight / 2;
            }

            setElements((prev) => {
                const clone = [...prev];
                const lastShape = clone[clone.length - 1];
                if (lastShape && lastShape.type === 'shape' && lastShape.id === currentShapeParams.current?.id) {
                    if (shapeType === 'rectangle') {
                        lastShape.x = currentX;
                        lastShape.y = currentY;
                        lastShape.width = currentWidth;
                        lastShape.height = currentHeight;
                    } else { // ellipse
                        lastShape.x = startX + (x - startX) / 2;
                        lastShape.y = startY + (y - startY) / 2;
                        lastShape.width = currentWidth; // total width of bounds
                        lastShape.height = currentHeight; // total height of bounds
                    }
                }
                return clone;
            });
        }
    };

    const handlePointerUp = () => {
        if (tool === 'pen' && isDrawing && currentLineParams.current) {
            setIsDrawing(false);
            const finishedLine = elements.find(e => e.id === currentLineParams.current?.id);
            if (finishedLine) {
                socket.emit('add_element', finishedLine);
            }
            currentLineParams.current = null;
        }

        if (tool === 'shape' && isDrawing && currentShapeParams.current) {
            setIsDrawing(false);
            const finishedShape = elements.find(e => e.id === currentShapeParams.current?.id);
            if (finishedShape) {
                socket.emit('add_element', finishedShape);
            }
            currentShapeParams.current = null;
        }
    };

    const handleTransformEnd = (id: string, node: any) => {
        setElements((prev) => {
            const map = new Map(prev.map(p => [p.id, p]));
            const el = map.get(id);
            if (el && (el.type === 'shape' || el.type === 'image')) {
                const shapeEl = el as ShapeElement | ImageElement;
                const newX = node.x();
                const newY = node.y();
                const newScaleX = node.scaleX();
                const newScaleY = node.scaleY();

                let checkX = newX;
                let checkY = newY;
                const checkW = shapeEl.width * newScaleX;
                const checkH = shapeEl.height * newScaleY;

                if (el.type === 'shape' && (shapeEl as ShapeElement).shapeType === 'ellipse') {
                    checkX -= Math.abs(checkW) / 2;
                    checkY -= Math.abs(checkH) / 2;
                }

                if (el.type === 'image' && isProtectedBoundingBox(checkX, checkY, Math.abs(checkW), Math.abs(checkH))) {
                    alert("Keep the reserved area clear of images!");
                    node.x(shapeEl.x);
                    node.y(shapeEl.y);
                    node.scaleX(shapeEl.scaleX || 1);
                    node.scaleY(shapeEl.scaleY || 1);
                    node.rotation(shapeEl.rotation || 0);
                    return Array.from(map.values());
                }

                shapeEl.x = newX;
                shapeEl.y = newY;
                shapeEl.rotation = node.rotation();
                shapeEl.scaleX = newScaleX;
                shapeEl.scaleY = newScaleY;
                map.set(id, shapeEl);
                socket.emit('add_element', shapeEl);
            }
            return Array.from(map.values());
        });
    };

    const handleDragEnd = (e: any, id: string) => {
        const node = e.target;
        setElements((prev) => {
            const map = new Map(prev.map(p => [p.id, p]));
            const el = map.get(id);
            if (el && (el.type === 'shape' || el.type === 'image')) {
                const shapeEl = el as ShapeElement | ImageElement;
                const newX = node.x();
                const newY = node.y();

                let checkX = newX;
                let checkY = newY;
                const checkW = shapeEl.width * (shapeEl.scaleX || 1);
                const checkH = shapeEl.height * (shapeEl.scaleY || 1);

                if (el.type === 'shape' && (shapeEl as ShapeElement).shapeType === 'ellipse') {
                    checkX -= Math.abs(checkW) / 2;
                    checkY -= Math.abs(checkH) / 2;
                }

                if (el.type === 'image' && isProtectedBoundingBox(checkX, checkY, Math.abs(checkW), Math.abs(checkH))) {
                    alert("Keep the reserved area clear of images!");
                    node.x(shapeEl.x);
                    node.y(shapeEl.y);
                    return Array.from(map.values());
                }

                shapeEl.x = newX;
                shapeEl.y = newY;
                map.set(id, shapeEl);
                socket.emit('add_element', shapeEl);
            }
            return Array.from(map.values());
        });
    };

    if (dimensions.width === 0) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-900 text-white font-mono object-cover">Loading Canvas...</div>;

    return (
        <div className="relative w-screen h-screen overflow-hidden transition-colors duration-1000" style={{
            backgroundColor: canvasBg,
            backgroundImage: `radial-gradient(${canvasBg === INITIAL_BG ? '#444cf7' : 'rgba(0,0,0,0.2)'} 0.5px, transparent 0.5px)`,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${stagePos.x}px ${stagePos.y}px`
        }}>

            {/* Floating Toolbar Container - Expandable Mobile Dock */}
            <div className="absolute bottom-6 sm:bottom-auto sm:top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col-reverse sm:flex-col items-center gap-3 pointer-events-none w-full sm:w-auto px-2">

                {/* Mobile Toggle Button */}
                <div className="sm:hidden pointer-events-auto mt-2">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`text-white shadow-2xl rounded-full p-4 flex items-center justify-center transition-all duration-300 ${isMobileMenuOpen ? 'bg-zinc-800 rotate-90 scale-100' : 'bg-blue-600 rotate-0 scale-105'}`}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Wrench size={24} />}
                    </button>
                </div>

                <div className={`bg-white shadow-2xl rounded-3xl sm:rounded-full px-2 sm:px-4 py-2 items-center gap-1 sm:gap-2 border border-zinc-200 pointer-events-auto max-w-[95vw] overflow-x-auto overflow-y-hidden transition-all duration-300 origin-bottom sm:origin-top ${isMobileMenuOpen ? 'flex scale-100 opacity-100' : 'hidden sm:flex scale-95 opacity-0 sm:scale-100 sm:opacity-100'}`}>
                    <button
                        onClick={() => { setTool('select'); setActiveTextInput(null); }}
                        className={`p-3 rounded-full transition-all ${tool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
                        title="Select & Resize"
                    >
                        <MousePointer2 size={20} />
                    </button>
                    <button
                        onClick={() => { setTool('pan'); setActiveTextInput(null); }}
                        className={`p-3 rounded-full transition-all ${tool === 'pan' ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
                        title="Pan Tool (Hand)"
                    >
                        <Hand size={20} />
                    </button>
                    <button
                        onClick={() => { setTool('pen'); setActiveTextInput(null); }}
                        className={`p-3 rounded-full transition-all ${tool === 'pen' ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
                        title="Pen Tool"
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={() => { setTool('shape'); setActiveTextInput(null); }}
                        className={`p-3 rounded-full transition-all ${tool === 'shape' ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
                        title="Shapes Tool"
                    >
                        <Shapes size={20} />
                    </button>
                    <button
                        onClick={() => setTool('text')}
                        className={`p-3 rounded-full transition-all ${tool === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
                        title="Text Tool"
                    >
                        <Type size={20} />
                    </button>
                    <button
                        onClick={() => { setTool('voice'); setActiveTextInput(null); }}
                        className={`p-3 rounded-full transition-all ${tool === 'voice' ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
                        title="Voice Tool"
                    >
                        <Mic size={20} />
                    </button>
                    <button
                        onClick={() => { setTool('image'); setActiveTextInput(null); }}
                        className={`p-3 rounded-full transition-all ${tool === 'image' ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-100 text-zinc-600'}`}
                        title="Image Picker Tool"
                    >
                        <ImageIcon size={20} />
                    </button>
                </div>

                {/* Image Settings Submenu */}
                {tool === 'image' && (
                    <div className="bg-white/95 backdrop-blur shadow-lg rounded-2xl px-5 py-4 flex flex-col items-center gap-4 border border-zinc-200 pointer-events-auto animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 fade-in min-w-[250px]">
                        {!stagedImageUrl && (
                            <label className="flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap">
                                <ImageIcon size={20} /> Upload Image
                                <input type="file" accept="image/*" onChange={handleImageUploadSelect} className="hidden" />
                            </label>
                        )}
                        {stagedImageUrl && (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-xs font-bold text-zinc-600 mb-3 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 text-center">
                                    Click canvas to place!
                                </p>
                                <img src={stagedImageUrl} alt="Staged" className="max-w-[240px] max-h-[160px] object-contain rounded-lg border border-zinc-200 shadow-sm bg-zinc-50/50" />
                            </div>
                        )}
                    </div>
                )}

                {/* Voice Settings Submenu */}
                {tool === 'voice' && (
                    <div className="bg-white/95 backdrop-blur shadow-lg rounded-2xl px-5 py-4 flex flex-col items-center gap-4 border border-zinc-200 pointer-events-auto animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 fade-in min-w-[250px]">
                        {!isRecording && !recordedAudioUrl && (
                            <button onClick={startRecording} className="flex items-center gap-2 px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-bold transition-all shadow-sm">
                                <Mic size={20} /> Start Recording
                            </button>
                        )}
                        {isRecording && (
                            <button onClick={stopRecording} className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold transition-all shadow-sm animate-pulse">
                                <Square size={20} /> Stop Recording
                            </button>
                        )}
                        {recordedAudioUrl && (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-xs font-bold text-zinc-600 mb-3 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 text-center">
                                    Click canvas to paste!
                                </p>
                                <div className="flex gap-2 w-full">
                                    <audio src={recordedAudioUrl} controls className="h-10 w-full rounded-lg" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Pen Settings Submenu */}
                {tool === 'pen' && (
                    <div className="bg-white/95 backdrop-blur shadow-lg rounded-2xl px-5 py-4 flex flex-col items-center gap-4 border border-zinc-200 pointer-events-auto animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 fade-in min-w-[300px]">

                        {/* Colors */}
                        <div className="flex items-center gap-3 w-full justify-between">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Color</span>
                            <div className="flex items-center gap-2">
                                <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-8 h-8 cursor-pointer rounded-full overflow-hidden" title="Custom color" />
                                {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setBrushColor(c)}
                                        className={`w-6 h-6 rounded-full border-2 ${brushColor === c ? 'border-zinc-900 scale-110 shadow-sm' : 'border-black/5 hover:scale-110'} transition-all`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-100" />

                        <div className="flex items-center gap-3 w-full justify-between">
                            {/* Brush Size */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Size</span>
                                <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-100">
                                    {[2, 5, 10, 20].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setBrushSize(s)}
                                            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${brushSize === s ? 'bg-white shadow-sm ring-1 ring-zinc-200' : 'hover:bg-zinc-200/50'}`}
                                            title={`${s}px brush`}
                                        >
                                            <div className="bg-zinc-700 rounded-full" style={{ width: Math.min(s, 20), height: Math.min(s, 20) }} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Brush Style */}
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Style</span>
                                <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-100">
                                    <button
                                        onClick={() => setBrushStyle('solid')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${brushStyle === 'solid' ? 'bg-white shadow-sm ring-1 ring-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
                                    >
                                        Solid
                                    </button>
                                    <button
                                        onClick={() => setBrushStyle('dashed')}
                                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${brushStyle === 'dashed' ? 'bg-white shadow-sm ring-1 ring-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
                                    >
                                        Dashed
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Shape Settings Submenu */}
                {tool === 'shape' && (
                    <div className="bg-white/95 backdrop-blur shadow-lg rounded-2xl px-5 py-4 flex flex-col items-center gap-4 border border-zinc-200 pointer-events-auto animate-in slide-in-from-bottom-2 sm:slide-in-from-top-2 fade-in min-w-[300px]">

                        {/* Shape Types */}
                        <div className="flex items-center gap-3 w-full justify-between">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Shape</span>
                            <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-lg border border-zinc-100">
                                <button
                                    onClick={() => setShapeType('rectangle')}
                                    className={`px-3 py-1.5 flex items-center gap-2 rounded-md text-xs font-semibold transition-all ${shapeType === 'rectangle' ? 'bg-white shadow-sm ring-1 ring-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
                                >
                                    <Square size={14} /> Rect
                                </button>
                                <button
                                    onClick={() => setShapeType('ellipse')}
                                    className={`px-3 py-1.5 flex items-center gap-2 rounded-md text-xs font-semibold transition-all ${shapeType === 'ellipse' ? 'bg-white shadow-sm ring-1 ring-zinc-200 text-zinc-900' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
                                >
                                    <CircleIcon size={14} /> Circle
                                </button>
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-100" />

                        {/* Colors */}
                        <div className="flex items-center gap-3 w-full justify-between">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Color</span>
                            <div className="flex items-center gap-2">
                                <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-8 h-8 cursor-pointer rounded-full overflow-hidden" title="Custom color" />
                                {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setBrushColor(c)}
                                        className={`w-6 h-6 rounded-full border-2 ${brushColor === c ? 'border-zinc-900 scale-110 shadow-sm' : 'border-black/5 hover:scale-110'} transition-all`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="w-full h-px bg-zinc-100" />

                    </div>
                )}
            </div>

            {/* Info Panel & Live X/Y Coordinator */}
            <div className="absolute bottom-6 right-4 sm:bottom-4 sm:right-4 z-10 bg-white/90 backdrop-blur shadow-lg rounded-xl p-3 sm:p-4 min-w-[120px] sm:min-w-[150px] border border-zinc-200 text-sm flex flex-col gap-2">
                <div className="flex flex-col items-center gap-2">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const navX = parseInt(formData.get('navX') as string, 10);
                            const navY = parseInt(formData.get('navY') as string, 10);

                            if (!isNaN(navX) && !isNaN(navY)) {
                                setStagePos({
                                    x: dimensions.width / 2 - navX * scale,
                                    y: dimensions.height / 2 - navY * scale
                                });
                            }
                            setIsNavigating(false);
                            (document.activeElement as HTMLElement)?.blur();
                        }}
                        className="font-mono text-xs bg-black/5 text-zinc-900 border border-black/10 p-1.5 rounded-lg shadow-inner flex flex-col gap-1.5 pointer-events-auto"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-zinc-500 font-bold ml-1">X</span>
                            <input
                                name="navX"
                                type="number"
                                value={pointerPos.x}
                                onChange={(e) => setPointerPos(p => ({ ...p, x: parseInt(e.target.value) || 0 }))}
                                onFocus={() => setIsNavigating(true)}
                                onBlur={() => setIsNavigating(false)}
                                className="w-16 bg-white/70 px-1 py-0.5 border border-zinc-200 rounded text-right outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                title="Edit X to jump"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-zinc-500 font-bold ml-1">Y</span>
                            <input
                                name="navY"
                                type="number"
                                value={pointerPos.y}
                                onChange={(e) => setPointerPos(p => ({ ...p, y: parseInt(e.target.value) || 0 }))}
                                onFocus={() => setIsNavigating(true)}
                                onBlur={() => setIsNavigating(false)}
                                className="w-16 bg-white/70 px-1 py-0.5 border border-zinc-200 rounded text-right outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                title="Edit Y to jump"
                            />
                        </div>
                        <button type="submit" className="hidden">Go</button>
                    </form>
                </div>
            </div>

            {/* EASTER EGG ZONE: Coordinates (30000, 30000) */}
            {Math.abs(pointerPos.x - 30000) < 800 && Math.abs(pointerPos.y - 30000) < 800 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-10 pointer-events-none">
                    <div className="bg-zinc-900 text-white font-mono px-6 py-3 rounded-xl border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] animate-pulse pointer-events-auto">
                        <p className="text-center text-sm font-bold text-yellow-300 tracking-widest uppercase mb-2">Secret Location Discovered!</p>
                        <p className="text-center text-xs opacity-80">You have traveled 30,000 pixels from Spawn.</p>

                        <div className="mt-4 flex flex-col gap-2">
                            <button
                                onClick={() => {
                                    if (!hasClickedYellow) {
                                        socket.emit('change_bg', '#fef08a');
                                        setHasClickedYellow(true);
                                    }
                                }}
                                disabled={hasClickedYellow}
                                className={`w-full py-2 px-4 rounded-lg font-bold transition-all shadow-md flex items-center justify-center gap-2 ${hasClickedYellow ? 'bg-yellow-100 text-yellow-600 opacity-50 cursor-not-allowed hidden' : 'text-zinc-900 bg-yellow-300 hover:bg-yellow-200 active:scale-95'}`}
                            >
                                ✨ Paint World Yellow ✨
                            </button>
                            <button
                                onClick={() => socket.emit('change_bg', '#e5e5f7')}
                                className="w-full py-2 px-4 rounded-lg font-bold text-zinc-400 border border-zinc-700 hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                            >
                                Restore Original Sky
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Stage
                width={dimensions.width}
                height={dimensions.height}
                draggable={tool === 'pan'}
                onWheel={handleWheel}
                onDragMove={(e) => {
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                }}
                onDragEnd={(e) => {
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onClick={handleStageClick}
                onTap={handleStageClick}
                x={stagePos.x}
                y={stagePos.y}
                scaleX={scale}
                scaleY={scale}
                className={tool === 'pan' ? 'cursor-grab active:cursor-grabbing' : tool === 'pen' ? 'cursor-crosshair' : (tool === 'voice' && recordedAudioUrl) || (tool === 'image' && stagedImageUrl) ? 'cursor-crosshair' : 'cursor-text'}
            >
                <Layer>
                    {elements.map((el) => {
                        if (el.type === 'brush') {
                            return (
                                <Line
                                    key={el.id}
                                    points={(el as BrushElement).points}
                                    stroke={(el as BrushElement).color}
                                    strokeWidth={(el as BrushElement).strokeWidth}
                                    dash={(el as BrushElement).dash}
                                    tension={0.5}
                                    lineCap="round"
                                    lineJoin="round"
                                />
                            );
                        }
                        if (el.type === 'image') {
                            return <URLImage key={el.id} element={el as ImageElement} tool={tool} setSelectedId={setSelectedId} handleDragEnd={handleDragEnd} />;
                        }
                        if (el.type === 'shape') {
                            const shapeEl = el as ShapeElement;
                            if (shapeEl.shapeType === 'rectangle') {
                                return (
                                    <Rect
                                        key={el.id}
                                        id={el.id}
                                        x={shapeEl.x}
                                        y={shapeEl.y}
                                        width={shapeEl.width}
                                        height={shapeEl.height}
                                        fill={shapeEl.fillColor === 'transparent' ? undefined : shapeEl.fillColor}
                                        stroke={shapeEl.strokeColor}
                                        strokeWidth={shapeEl.strokeWidth}
                                        hitStrokeWidth={Math.max(shapeEl.strokeWidth, 10)}
                                        scaleX={shapeEl.scaleX || 1}
                                        scaleY={shapeEl.scaleY || 1}
                                        rotation={shapeEl.rotation || 0}
                                        draggable={tool === 'select'}
                                        onDragEnd={(e) => handleDragEnd(e, el.id)}
                                        onClick={() => { if (tool === 'select') setSelectedId(el.id); }}
                                        onTap={() => { if (tool === 'select') setSelectedId(el.id); }}
                                    />
                                );
                            } else if (shapeEl.shapeType === 'ellipse') {
                                return (
                                    <Ellipse
                                        key={el.id}
                                        id={el.id}
                                        x={shapeEl.x}
                                        y={shapeEl.y}
                                        radiusX={Math.abs(shapeEl.width / 2)}
                                        radiusY={Math.abs(shapeEl.height / 2)}
                                        fill={shapeEl.fillColor === 'transparent' ? undefined : shapeEl.fillColor}
                                        stroke={shapeEl.strokeColor}
                                        strokeWidth={shapeEl.strokeWidth}
                                        hitStrokeWidth={Math.max(shapeEl.strokeWidth, 10)}
                                        scaleX={shapeEl.scaleX || 1}
                                        scaleY={shapeEl.scaleY || 1}
                                        rotation={shapeEl.rotation || 0}
                                        draggable={tool === 'select'}
                                        onDragEnd={(e) => handleDragEnd(e, el.id)}
                                        onClick={() => { if (tool === 'select') setSelectedId(el.id); }}
                                        onTap={() => { if (tool === 'select') setSelectedId(el.id); }}
                                    />
                                );
                            }
                        }
                        // Text is handled in HTML overlay
                        return null;
                    })}

                    {/* Welcome Greeting at Origin rendered ON TOP */}
                    <Circle
                        x={0}
                        y={0}
                        radius={220}
                        fill="#ffffff"
                        opacity={0.9}
                        stroke="#e5e7eb"
                        strokeWidth={2}
                        shadowColor="rgba(0,0,0,0.1)"
                        shadowBlur={15}
                        shadowOffsetY={5}
                        listening={false} // pass through clicks
                    />
                    <KonvaText
                        x={-180}
                        y={-40}
                        width={360}
                        text="Welcome to Webtigo Infinity Canvas"
                        fontSize={26}
                        fontStyle="bold"
                        fontFamily="sans-serif"
                        fill="#1e40af"
                        align="center"
                        listening={false}
                    />
                    <KonvaText
                        x={-180}
                        y={20}
                        width={360}
                        text="Scroll to zoom.\nSelect Pan to drag the world.\nDouble-click text to edit it!"
                        fontSize={16}
                        fontFamily="sans-serif"
                        fill="#4b5563"
                        align="center"
                        lineHeight={1.6}
                        listening={false}
                    />

                    {selectedId && <TransformerComponent selectedId={selectedId} onTransformEnd={handleTransformEnd} />}
                </Layer>
            </Stage>

            {/* HTML Overlays for Text Elements */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 20
                }}
            >
                {elements.map((el) => {
                    if (el.type === 'text') {
                        // Hide it if we are currently editing it
                        if (activeTextInput && activeTextInput.id === el.id) return null;

                        return (
                            <div
                                key={el.id}
                                onDoubleClick={() => {
                                    if (tool === 'text' || tool === 'pan') {
                                        setActiveTextInput({
                                            x: el.x,
                                            y: el.y,
                                            value: (el as TextElement).text,
                                            id: el.id
                                        });
                                        setTool('text');
                                    }
                                }}
                                style={{
                                    position: 'absolute',
                                    top: el.y * scale + stagePos.y,
                                    left: el.x * scale + stagePos.x,
                                    fontSize: `${(el as TextElement).fontSize * scale}px`,
                                    color: (el as TextElement).color,
                                    fontFamily: 'sans-serif',
                                    whiteSpace: 'pre-wrap',
                                    wordWrap: 'break-word',
                                    pointerEvents: 'auto', // Allow highlighting and interactions!
                                    cursor: tool === 'text' ? 'text' : 'auto',
                                    userSelect: 'text' // Allows selection natively
                                }}
                            >
                                {(el as TextElement).text}
                            </div>
                        );
                    }
                    if (el.type === 'audio') {
                        return (
                            <div
                                key={el.id}
                                style={{
                                    position: 'absolute',
                                    top: el.y * scale + stagePos.y,
                                    left: el.x * scale + stagePos.x,
                                    pointerEvents: 'auto',
                                    transform: `scale(${scale})`,
                                    transformOrigin: 'top left'
                                }}
                            >
                                <div className="bg-white/90 p-1.5 rounded-full shadow-md border border-zinc-200 flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                                    <audio src={(el as AudioElement).src} controls className="h-8 max-w-[200px]" />
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}

                {/* Active Text Input */}
                {activeTextInput && (
                    <div
                        ref={contentEditableRef}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={commitTextInput}
                        style={{
                            position: 'absolute',
                            top: activeTextInput.y * scale + stagePos.y,
                            left: activeTextInput.x * scale + stagePos.x,
                            fontSize: `${24 * scale}px`,
                            color: 'black',
                            fontFamily: 'sans-serif',
                            background: 'white',
                            border: '1px solid #3b82f6',
                            outline: 'none',
                            minWidth: `${20 * scale}px`,
                            minHeight: `${24 * scale}px`,
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            cursor: 'text',
                            pointerEvents: 'auto',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            padding: '2px 4px'
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                commitTextInput();
                            }
                        }}
                    >
                        {activeTextInput.value}
                    </div>
                )}
            </div>
        </div>
    );
}
