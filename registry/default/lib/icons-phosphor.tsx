"use client";

// ---------------------------------------------------------------------------
// Phosphor glyphs for every slot the components look up (see icon-context).
// Pass the map to IconProvider and every component draws them:
//
//   <IconProvider icons={phosphorIcons}>{children}</IconProvider>
//
// Each adapter maps the shared props (size, strokeWidth, className) onto
// what Phosphor takes. Phosphor draws filled paths per weight, so strokeWidth
// picks a weight instead of a stroke.
// ---------------------------------------------------------------------------

import {
  CaretRightIcon as PhCaretRight,
  CaretDownIcon as PhCaretDown,
  EyedropperIcon as PhEyedropper,
  XIcon as PhX,
  CopyIcon as PhCopy,
  ListIcon as PhList,
  DotOutlineIcon as PhDotOutline,
  MonitorIcon as PhMonitor,
  SunIcon as PhSun,
  MoonIcon as PhMoon,
  RectangleIcon as PhRectangle,
  CircleIcon as PhCircle,
  BooksIcon as PhBooks,
  ClockIcon as PhClock,
  StarIcon as PhStar,
  GearIcon as PhGear,
  PlusIcon as PhPlus,
  ArrowLeftIcon as PhArrowLeft,
  ArrowRightIcon as PhArrowRight,
  ArrowUpIcon as PhArrowUp,
  ArrowDownIcon as PhArrowDown,
  MagnifyingGlassIcon as PhMagnifyingGlass,
  SpinnerIcon as PhSpinner,
  UsersIcon as PhUsers,
  LockIcon as PhLock,
  EnvelopeIcon as PhEnvelope,
  BellIcon as PhBell,
  ShieldIcon as PhShield,
  PaletteIcon as PhPalette,
  LightbulbIcon as PhLightbulb,
  RocketIcon as PhRocket,
  HeartIcon as PhHeart,
  PaintBrushIcon as PhPaintBrush,
  BrainIcon as PhBrain,
  GlobeIcon as PhGlobe,
  UserIcon as PhUser,
  ImageIcon as PhImage,
  LinkIcon as PhLink,
  CheckIcon as PhCheck,
  ArrowCounterClockwiseIcon as PhRotateCcw,
  PlayIcon as PhPlay,
  PauseIcon as PhPause,
  HouseIcon as PhHouse,
  ChatCircleIcon as PhChatCircle,
  TrayIcon as PhTray,
  PencilIcon as PhPencil,
  ResizeIcon as PhResize,
  SkipForwardIcon as PhSkipForward,
  ArrowElbowDownRightIcon as PhArrowElbowDownRight,
  ArrowElbowDownLeftIcon as PhArrowElbowDownLeft,
  SidebarSimpleIcon as PhSidebarSimple,
  CaretUpDownIcon as PhCaretUpDown,
  DotsThreeIcon as PhDotsThree,
  DotsThreeVerticalIcon as PhDotsThreeVertical,
  SlidersHorizontalIcon as PhSlidersHorizontal,
  InfoIcon as PhInfo,
  CalendarBlankIcon as PhCalendarBlank,
  FolderSimpleIcon as PhFolderSimple,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import type { IconComponent, IconComponentProps, IconName } from "@/lib/icon-context";

// Phosphor: uses filled paths per weight variant, not CSS stroke.
// Map numeric strokeWidth → discrete weight prop.
type PhosphorWeight = "thin" | "light" | "regular" | "bold";
function phosphor(Icon: ComponentType<{ size?: number; weight?: PhosphorWeight; className?: string }>): IconComponent {
  return function PhosphorAdapter({ size, strokeWidth, className }: IconComponentProps) {
    const weight: PhosphorWeight = strokeWidth != null && strokeWidth >= 1.75 ? "regular" : "light";
    return <Icon size={size} weight={weight} className={className} />;
  };
}

// Phosphor ships no right-hand sidebar glyph — mirror the left one.
function phosphorFlipped(Icon: ComponentType<{ size?: number; weight?: PhosphorWeight; className?: string }>): IconComponent {
  return function PhosphorFlippedAdapter({ size, strokeWidth, className }: IconComponentProps) {
    const weight: PhosphorWeight = strokeWidth != null && strokeWidth >= 1.75 ? "regular" : "light";
    return <Icon size={size} weight={weight} className={`-scale-x-100 ${className ?? ""}`} />;
  };
}

export const phosphorIcons: Record<IconName, IconComponent> = {
  "chevron-right": phosphor(PhCaretRight),
  "chevron-down": phosphor(PhCaretDown),
  "pipette": phosphor(PhEyedropper),
  "x": phosphor(PhX),
  "copy": phosphor(PhCopy),
  "menu": phosphor(PhList),
  "dot": phosphor(PhDotOutline),
  "monitor": phosphor(PhMonitor),
  "sun": phosphor(PhSun),
  "moon": phosphor(PhMoon),
  "rectangle-horizontal": phosphor(PhRectangle),
  "circle": phosphor(PhCircle),
  "square-library": phosphor(PhBooks),
  "clock": phosphor(PhClock),
  "star": phosphor(PhStar),
  "settings": phosphor(PhGear),
  "plus": phosphor(PhPlus),
  "arrow-left": phosphor(PhArrowLeft),
  "arrow-right": phosphor(PhArrowRight),
  "arrow-up": phosphor(PhArrowUp),
  "arrow-down": phosphor(PhArrowDown),
  "search": phosphor(PhMagnifyingGlass),
  "loader": phosphor(PhSpinner),
  "users": phosphor(PhUsers),
  "lock": phosphor(PhLock),
  "mail": phosphor(PhEnvelope),
  "bell": phosphor(PhBell),
  "shield": phosphor(PhShield),
  "palette": phosphor(PhPalette),
  "lightbulb": phosphor(PhLightbulb),
  "rocket": phosphor(PhRocket),
  "heart": phosphor(PhHeart),
  "paintbrush": phosphor(PhPaintBrush),
  "brain": phosphor(PhBrain),
  "globe": phosphor(PhGlobe),
  "user": phosphor(PhUser),
  "image": phosphor(PhImage),
  "link": phosphor(PhLink),
  "check": phosphor(PhCheck),
  "rotate-ccw": phosphor(PhRotateCcw),
  "play": phosphor(PhPlay),
  "pause": phosphor(PhPause),
  "home": phosphor(PhHouse),
  "message-circle": phosphor(PhChatCircle),
  "inbox": phosphor(PhTray),
  "pencil": phosphor(PhPencil),
  "scaling": phosphor(PhResize),
  "skip-forward": phosphor(PhSkipForward),
  "corner-down-right": phosphor(PhArrowElbowDownRight),
  "corner-down-left": phosphor(PhArrowElbowDownLeft),
  "panel-left": phosphor(PhSidebarSimple),
  "panel-right": phosphorFlipped(PhSidebarSimple),
  "chevrons-up-down": phosphor(PhCaretUpDown),
  "more-horizontal": phosphor(PhDotsThree),
  "more-vertical": phosphor(PhDotsThreeVertical),
  "calendar": phosphor(PhCalendarBlank),
  "folder": phosphor(PhFolderSimple),
  "sliders-horizontal": phosphor(PhSlidersHorizontal),
  "info": phosphor(PhInfo),
};
