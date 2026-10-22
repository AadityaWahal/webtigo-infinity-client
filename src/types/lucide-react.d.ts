declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }

  export type LucideIcon = React.ComponentType<LucideProps>;

  export const Pen: LucideIcon;
  export const Eraser: LucideIcon;
  export const Square: LucideIcon;
  export const Circle: LucideIcon;
  export const Minus: LucideIcon;
  export const MoveRight: LucideIcon;
  export const Star: LucideIcon;
  export const PaintBucket: LucideIcon;
  export const Palette: LucideIcon;
  export const Sliders: LucideIcon;
  export const Rocket: LucideIcon;
  export const Compass: LucideIcon;
  export const MapPin: LucideIcon;
  export const X: LucideIcon;
  export const Wifi: LucideIcon;
  export const WifiOff: LucideIcon;
  export const Flame: LucideIcon;
  export const Check: LucideIcon;
  export const Plus: LucideIcon;
  export const Type: LucideIcon;
  export const Image: LucideIcon;
  export const ImageIcon: LucideIcon;
  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Volume2: LucideIcon;
  export const FileText: LucideIcon;
  export const BookOpen: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Layers: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Radio: LucideIcon;
  export const Globe2: LucideIcon;
  export const PenTool: LucideIcon;
  export const MousePointer: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const Share2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const Terminal: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Users: LucideIcon;
  export const Settings: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Volume1: LucideIcon;
  export const Music: LucideIcon;
  export const SkipForward: LucideIcon;

  const icons: { [key: string]: LucideIcon };
  export default icons;
}
