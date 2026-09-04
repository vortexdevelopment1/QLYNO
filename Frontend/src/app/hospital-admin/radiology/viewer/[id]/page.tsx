"use client";

import React, { useState, useEffect, useMemo, useRef, use } from "react";
import Link from "next/link";
import {
  AlertOctagon,
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FlipHorizontal,
  FlipVertical,
  Grid2X2,
  Hand,
  Info,
  Layers,
  Maximize2,
  Minimize2,
  Move,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Ruler,
  Scan,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
  SunMedium,
  Volume2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Badge } from "@/hospital-admin/components/ui/badge";
import { Button } from "@/hospital-admin/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/hospital-admin/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/hospital-admin/components/ui/select";
import { mockExtendedRadiologyOrders } from "@/hospital-admin/lib/mock-data/radiology-extended-operations";
import { RadiologyOrder } from "@/hospital-admin/lib/types";

// Medical Window/Level Presets
const WL_PRESETS = [
  { label: "Default", ww: 350, wl: 50, desc: "Standard Diagnostic Grayscale" },
  { label: "Brain / Soft Tissue", ww: 80, wl: 40, desc: "High Contrast Parenchyma" },
  { label: "Bone Window", ww: 1500, wl: 300, desc: "Cortex & Skeletal Trabeculae" },
  { label: "Lung / Pulmonary", ww: 1500, wl: -600, desc: "Alveolar & Bronchovascular" },
  { label: "Subdural / Stroke", ww: 100, wl: 50, desc: "Acute MCA / Infarct & Edema" },
  { label: "Angiography / Vessel", ww: 600, wl: 200, desc: "Contrast-Enhanced Lumen" },
];

interface DicomSeries {
  id: string;
  name: string;
  slicesCount: number;
  thickness: string;
  plane: "Axial" | "Coronal" | "Sagittal" | "3D Angio";
  thumbnailDesc: string;
}

export default function DicomPacsViewerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const report: RadiologyOrder =
    mockExtendedRadiologyOrders.find((o) => o.id === id) || {
      id,
      orderNo: "RAD-2026-8802",
      patientId: "P-9102",
      patientName: "Kavita Patil",
      uhid: "UHID-2026-9102",
      age: 48,
      gender: "Female",
      modality: "MRI",
      bodyPart: "Brain with Contrast & MR Angiography",
      orderingDoctor: "Dr. Kavita Verma",
      source: "Emergency",
      scheduledAt: "2026-08-24T10:15:00Z",
      status: "Report Ready",
      priority: "Stat Emergency",
      criticalFinding: true,
      criticalDetails: "CRITICAL ALERT: Acute right MCA territory ischemic infarct with subtle mass effect.",
      roomName: "3.0 Tesla High-Field MRI Suite",
      radiologistName: "Dr. Sunita Kulkarni, MD (Neuroradiology)",
      technologistName: "Amit Shinde (Lead MRI Technologist)",
      patientLocation: "Emergency Resuscitation Bay 2",
      reportNotes: "Diffusion-weighted imaging (DWI) demonstrates hyperintense signal in the right frontotemporoparietal cortex with corresponding ADC hypointensity. Non-hemorrhagic right MCA territory acute stroke.",
      impressionNotes: "Acute right MCA ischemic stroke. Immediate neurology/stroke team escalation completed.",
    };

  // Mock Available Series
  const seriesList: DicomSeries[] = useMemo(() => [
    {
      id: "ser_01",
      name: `${report.modality} Axial Primary Recon`,
      slicesCount: 24,
      thickness: "2.5 mm",
      plane: "Axial",
      thumbnailDesc: "Diffusion Weighted DWI / High Contrast",
    },
    {
      id: "ser_02",
      name: `${report.modality} Coronal T2 FLAIR`,
      slicesCount: 20,
      thickness: "3.0 mm",
      plane: "Coronal",
      thumbnailDesc: "Sulcal & Ventricular Fluid Attenuation",
    },
    {
      id: "ser_03",
      name: `${report.modality} Sagittal 3D MPR`,
      slicesCount: 18,
      thickness: "1.2 mm",
      plane: "Sagittal",
      thumbnailDesc: "Midline & Brainstem Multi-Planar",
    },
    {
      id: "ser_04",
      name: `${report.modality} 3D Angiography / Bone`,
      slicesCount: 16,
      thickness: "0.6 mm",
      plane: "3D Angio",
      thumbnailDesc: "Vascular Circle of Willis Reconstruction",
    },
  ], [report.modality]);

  // Active Viewing State
  const [activeSeriesId, setActiveSeriesId] = useState("ser_01");
  const activeSeries = useMemo(() => {
    return seriesList.find((s) => s.id === activeSeriesId) || seriesList[0];
  }, [seriesList, activeSeriesId]);

  const [currentSlice, setCurrentSlice] = useState(12);
  const [layout, setLayout] = useState<"1x1" | "1x2" | "2x2">("1x1");
  const [activeTool, setActiveTool] = useState<"ww" | "zoom" | "pan" | "caliper">("ww");

  // Window/Level State
  const [windowWidth, setWindowWidth] = useState(350);
  const [windowLevel, setWindowLevel] = useState(50);
  const [activePreset, setActivePreset] = useState("Default");

  // Image Geometry Transforms
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [inverted, setInverted] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Cine Playback Loop
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [cineFps, setCineFps] = useState(15);

  // Measurement Calipers State
  const [caliperPoints, setCaliperPoints] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 170,
    y1: 160,
    x2: 290,
    y2: 240,
  });

  // Mouse Drag Tracking State
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startWw: number; startWl: number; startPanX: number; startPanY: number; startZoom: number }>({
    x: 0,
    y: 0,
    startWw: 350,
    startWl: 50,
    startPanX: 0,
    startPanY: 0,
    startZoom: 1.0,
  });

  // Clinical Report Drawer Modal
  const [reportDrawerOpen, setReportDrawerOpen] = useState(false);

  // Cine Loop Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlayingCine) {
      timer = setInterval(() => {
        setCurrentSlice((prev) => (prev >= activeSeries.slicesCount - 1 ? 0 : prev + 1));
      }, 1000 / cineFps);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingCine, cineFps, activeSeries.slicesCount]);

  // When series changes, adjust slice to middle of new series
  const handleSelectSeries = (ser: DicomSeries) => {
    setActiveSeriesId(ser.id);
    setCurrentSlice(Math.floor(ser.slicesCount / 2));
  };

  // Mouse Wheel Slice Scrolling
  const handleCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setCurrentSlice((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentSlice((prev) => Math.min(activeSeries.slicesCount - 1, prev + 1));
    }
  };

  // Mouse Drag Handlers for Active Tools (WW/WL, Pan, Zoom, Caliper)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startWw: windowWidth,
      startWl: windowLevel,
      startPanX: pan.x,
      startPanY: pan.y,
      startZoom: zoom,
    };

    if (activeTool === "caliper") {
      setCaliperPoints({
        x1: clickX,
        y1: clickY,
        x2: clickX,
        y2: clickY,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (activeTool === "ww") {
      const newWw = Math.max(20, Math.min(2500, dragStartRef.current.startWw + dx * 2));
      const newWl = Math.max(-1000, Math.min(1000, dragStartRef.current.startWl - dy * 2));
      setWindowWidth(Math.round(newWw));
      setWindowLevel(Math.round(newWl));
      setActivePreset("Custom");
    } else if (activeTool === "pan") {
      setPan({
        x: dragStartRef.current.startPanX + dx,
        y: dragStartRef.current.startPanY + dy,
      });
    } else if (activeTool === "zoom") {
      const scaleDelta = -dy * 0.005;
      const newZoom = Math.max(0.4, Math.min(4.0, dragStartRef.current.startZoom + scaleDelta));
      setZoom(Number(newZoom.toFixed(2)));
    } else if (activeTool === "caliper") {
      const rect = e.currentTarget.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      setCaliperPoints((prev) => ({
        ...prev,
        x2: currentX,
        y2: currentY,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Preset Selection Handler
  const handleSelectPreset = (label: string) => {
    setActivePreset(label);
    const p = WL_PRESETS.find((x) => x.label === label);
    if (p) {
      setWindowWidth(p.ww);
      setWindowLevel(p.wl);
    }
  };

  // Reset View Tool
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
    setInverted(false);
    setFlipH(false);
    setFlipV(false);
    setWindowWidth(350);
    setWindowLevel(50);
    setActivePreset("Default");
  };

  // Calculate Caliper Length in Millimeters
  const caliperLengthMm = useMemo(() => {
    if (!caliperPoints) return "0.0";
    const dx = caliperPoints.x2 - caliperPoints.x1;
    const dy = caliperPoints.y2 - caliperPoints.y1;
    const pixelDist = Math.sqrt(dx * dx + dy * dy);
    // Simulated DICOM pixel pitch: 0.42 mm/pixel
    return (pixelDist * 0.42).toFixed(1);
  }, [caliperPoints]);

  // Render Medical Anatomical SVG based on Series Plane and Current Slice
  const renderAnatomySvg = (plane: "Axial" | "Coronal" | "Sagittal" | "3D Angio", sliceIdx: number) => {
    const sliceFactor = (sliceIdx + 1) / 24;

    if (plane === "Axial") {
      const skullRx = 180 + Math.sin(sliceFactor * Math.PI) * 15;
      const skullRy = 205 + Math.sin(sliceFactor * Math.PI) * 15;
      const ventH = 30 + Math.sin(sliceFactor * Math.PI) * 40;

      return (
        <svg className="w-[450px] h-[450px] sm:w-[500px] sm:h-[500px]" viewBox="0 0 500 500">
          <defs>
            <radialGradient id="axialGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="65%" stopColor="#1e293b" />
              <stop offset="88%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          <rect width="500" height="500" fill="#000000" />
          {/* Skull Bone Matrix */}
          <ellipse cx="250" cy="250" rx={skullRx} ry={skullRy} fill="url(#axialGlow)" stroke="#cbd5e1" strokeWidth="7" />
          <ellipse cx="250" cy="250" rx={skullRx - 10} ry={skullRy - 10} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="6 3" />
          {/* Interhemispheric Fissure */}
          <path d="M 250 60 Q 249 250 250 440" stroke="#0f172a" strokeWidth="4" fill="none" />
          {/* Lateral Ventricles */}
          <path
            d={`M 220 ${250 - ventH} Q 195 250 225 ${250 + ventH} Q 235 250 220 ${250 - ventH}`}
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="2.5"
          />
          <path
            d={`M 280 ${250 - ventH} Q 305 250 275 ${250 + ventH} Q 265 250 280 ${250 - ventH}`}
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="2.5"
          />
          {/* Sulci patterns */}
          <path d="M 120 180 Q 160 200 135 240" stroke="#334155" strokeWidth="2.5" fill="none" />
          <path d="M 380 180 Q 340 200 365 240" stroke="#334155" strokeWidth="2.5" fill="none" />
          <path d="M 140 290 Q 180 320 155 360" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M 360 290 Q 320 320 345 360" stroke="#334155" strokeWidth="2" fill="none" />

          {/* Stroke Infarct (If Flagged) */}
          {report.criticalFinding && sliceIdx >= 8 && sliceIdx <= 18 && (
            <g className="animate-pulse">
              <ellipse
                cx="335"
                cy="235"
                rx={24 + (sliceIdx - 12) * 1.8}
                ry={34 + (sliceIdx - 12) * 1.8}
                fill="#f43f5e"
                fillOpacity="0.45"
                stroke="#fb7185"
                strokeWidth="2.5"
              />
              <text x="375" y="230" fill="#f43f5e" fontSize="11" fontWeight="bold" fontFamily="monospace">
                ACUTE MCA INFARCT
              </text>
              <line x1="335" y1="235" x2="370" y2="230" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>
          )}
        </svg>
      );
    }

    if (plane === "Coronal") {
      return (
        <svg className="w-[450px] h-[450px] sm:w-[500px] sm:h-[500px]" viewBox="0 0 500 500">
          <defs>
            <radialGradient id="coronalGlow" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="60%" stopColor="#1e293b" />
              <stop offset="90%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          <rect width="500" height="500" fill="#000000" />
          {/* Coronal Cranium & Vertex */}
          <path
            d="M 100 380 C 70 200, 150 70, 250 70 C 350 70, 430 200, 400 380 C 370 430, 130 430, 100 380 Z"
            fill="url(#coronalGlow)"
            stroke="#cbd5e1"
            strokeWidth="7"
          />
          {/* Falx Cerebri Midline */}
          <line x1="250" y1="70" x2="250" y2="330" stroke="#0f172a" strokeWidth="4" />
          {/* Temporal Lobes & Sylvian Fissures */}
          <path d="M 120 250 Q 180 260 210 320" stroke="#475569" strokeWidth="3" fill="none" />
          <path d="M 380 250 Q 320 260 290 320" stroke="#475569" strokeWidth="3" fill="none" />
          {/* Third & Lateral Ventricles */}
          <path d="M 230 200 Q 210 230 235 260" stroke="#1e293b" strokeWidth="3" fill="none" />
          <path d="M 270 200 Q 290 230 265 260" stroke="#1e293b" strokeWidth="3" fill="none" />
          {/* Brainstem Base */}
          <path d="M 220 340 L 220 440 L 280 440 L 280 340 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        </svg>
      );
    }

    if (plane === "Sagittal") {
      return (
        <svg className="w-[450px] h-[450px] sm:w-[500px] sm:h-[500px]" viewBox="0 0 500 500">
          <defs>
            <radialGradient id="sagGlow" cx="45%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="65%" stopColor="#1e293b" />
              <stop offset="90%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>
          <rect width="500" height="500" fill="#000000" />
          {/* Sagittal Head Profile */}
          <path
            d="M 120 380 C 80 250, 120 90, 250 80 C 370 70, 420 200, 390 340 C 350 400, 280 460, 220 460 L 170 460 Z"
            fill="url(#sagGlow)"
            stroke="#cbd5e1"
            strokeWidth="7"
          />
          {/* Corpus Callosum C-Shape Arch */}
          <path
            d="M 180 210 C 200 160, 310 160, 330 220 C 310 200, 210 200, 180 210 Z"
            fill="#e2e8f0"
            stroke="#64748b"
            strokeWidth="2"
          />
          {/* Pons & Brainstem */}
          <ellipse cx="260" cy="300" rx="26" ry="38" fill="#1e293b" stroke="#475569" strokeWidth="2" />
          {/* Cerebellum */}
          <ellipse cx="320" cy="320" rx="38" ry="32" fill="#0f172a" stroke="#475569" strokeWidth="2" strokeDasharray="3 2" />
          {/* Cervical Spinal Cord (C1-C3) */}
          <rect x="245" y="340" width="28" height="110" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
        </svg>
      );
    }

    // 3D Angiography / Vessel Recon
    return (
      <svg className="w-[450px] h-[450px] sm:w-[500px] sm:h-[500px]" viewBox="0 0 500 500">
        <rect width="500" height="500" fill="#000000" />
        {/* Calvarium Outline */}
        <ellipse cx="250" cy="250" rx="180" ry="200" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6 4" />
        {/* Vertebral & Basilar Arteries (Glowing Cyan/White) */}
        <path d="M 235 440 Q 248 380 250 320" stroke="#38bdf8" strokeWidth="5" fill="none" />
        <path d="M 265 440 Q 252 380 250 320" stroke="#38bdf8" strokeWidth="5" fill="none" />
        {/* Basilar Trunk */}
        <line x1="250" y1="320" x2="250" y2="240" stroke="#0284c7" strokeWidth="6" />
        {/* Posterior Cerebral Arteries (PCA) */}
        <path d="M 250 240 Q 200 220 160 210" stroke="#38bdf8" strokeWidth="4" fill="none" />
        <path d="M 250 240 Q 300 220 340 210" stroke="#38bdf8" strokeWidth="4" fill="none" />
        {/* Internal Carotid & Middle Cerebral Arteries (MCA Tree) */}
        <path d="M 210 260 Q 180 200 110 180" stroke="#0ea5e9" strokeWidth="5" fill="none" />
        <path d="M 290 260 Q 320 200 390 180" stroke="#0ea5e9" strokeWidth="5" fill="none" />
        {/* Anterior Cerebral Arteries (ACA) */}
        <path d="M 230 200 Q 245 140 250 100" stroke="#38bdf8" strokeWidth="4.5" fill="none" />
        <path d="M 270 200 Q 255 140 250 100" stroke="#38bdf8" strokeWidth="4.5" fill="none" />
        {/* Circle of Willis Communicating Arteries */}
        <circle cx="250" cy="200" r="40" fill="none" stroke="#7dd3fc" strokeWidth="3" strokeDasharray="4 2" />
        <text x="250" y="475" fill="#38bdf8" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
          3D CIRCLE OF WILLIS MRA
        </text>
      </svg>
    );
  };

  if (!mounted) {
    return (
      <div className="bg-black text-slate-100 min-h-screen flex items-center justify-center font-mono text-xs">
        Loading Web DICOM PACS Workstation...
      </div>
    );
  }

  return (
    <div className="bg-black text-slate-100 min-h-screen flex flex-col font-sans select-none overflow-hidden fixed inset-0 z-50">
      {/* 1. TOP PACS MASTER HEADER */}
      <header className="h-12 border-b border-slate-800 bg-slate-950 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            asChild
            className="h-8 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
          >
            <Link href={`/hospital-admin/radiology/reports/${report.id}`}>
              <ArrowLeft className="h-4 w-4" /> Back to Report
            </Link>
          </Button>

          <div className="h-5 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-mono uppercase">
              {report.modality}
            </Badge>
            <span className="font-bold text-xs text-slate-100 truncate max-w-[260px]">
              {report.bodyPart}
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              ({report.orderNo})
            </span>
          </div>
        </div>

        {/* Center: Patient Identity Badge */}
        <div className="hidden md:flex items-center gap-3 bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800 text-xs">
          <div className="font-semibold text-slate-100">{report.patientName}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            {report.uhid} • {report.age || 48}Y/{report.gender || "M"}
          </div>
          {report.criticalFinding && (
            <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 animate-pulse">
              CRITICAL
            </Badge>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Layout Selector */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded border border-slate-800">
            <Button
              size="sm"
              variant={layout === "1x1" ? "secondary" : "ghost"}
              className="h-6 w-7 p-0 text-[11px] font-bold"
              onClick={() => setLayout("1x1")}
              title="Single Viewport (1x1)"
            >
              1×1
            </Button>
            <Button
              size="sm"
              variant={layout === "1x2" ? "secondary" : "ghost"}
              className="h-6 w-7 p-0 text-[11px] font-bold"
              onClick={() => setLayout("1x2")}
              title="Dual Viewport (1x2)"
            >
              1×2
            </Button>
            <Button
              size="sm"
              variant={layout === "2x2" ? "secondary" : "ghost"}
              className="h-6 w-7 p-0 text-[11px] font-bold"
              onClick={() => setLayout("2x2")}
              title="Quad Multi-Planar (2x2)"
            >
              2×2
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs bg-slate-900 border-slate-700 text-cyan-300 hover:bg-slate-800 gap-1.5"
            onClick={() => setReportDrawerOpen(true)}
          >
            <FileText className="h-3.5 w-3.5" /> Clinical Notes
          </Button>
        </div>
      </header>

      {/* 2. DIAGNOSTIC TOOLBAR RIBBON */}
      <div className="h-11 border-b border-slate-800/80 bg-slate-900/90 px-3 flex items-center justify-between gap-2 overflow-x-auto shrink-0 text-xs">
        {/* Tool Action Buttons */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant={activeTool === "ww" ? "default" : "ghost"}
            className={`h-7 px-2.5 gap-1.5 text-xs ${
              activeTool === "ww" ? "bg-cyan-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
            onClick={() => setActiveTool("ww")}
            title="Window / Level: Drag on image to adjust Contrast & Brightness"
          >
            <Sliders className="h-3.5 w-3.5" /> WW/WL
          </Button>

          <Button
            size="sm"
            variant={activeTool === "zoom" ? "default" : "ghost"}
            className={`h-7 px-2.5 gap-1.5 text-xs ${
              activeTool === "zoom" ? "bg-cyan-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
            onClick={() => setActiveTool("zoom")}
            title="Zoom: Drag up/down on image to magnify"
          >
            <ZoomIn className="h-3.5 w-3.5" /> Zoom
          </Button>

          <Button
            size="sm"
            variant={activeTool === "pan" ? "default" : "ghost"}
            className={`h-7 px-2.5 gap-1.5 text-xs ${
              activeTool === "pan" ? "bg-cyan-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
            onClick={() => setActiveTool("pan")}
            title="Pan: Drag on image to reposition"
          >
            <Hand className="h-3.5 w-3.5" /> Pan
          </Button>

          <Button
            size="sm"
            variant={activeTool === "caliper" ? "default" : "ghost"}
            className={`h-7 px-2.5 gap-1.5 text-xs ${
              activeTool === "caliper" ? "bg-cyan-600 text-white font-bold" : "text-slate-300 hover:bg-slate-800"
            }`}
            onClick={() => setActiveTool("caliper")}
            title="Length Caliper: Click and drag 2 points on image to measure distance"
          >
            <Ruler className="h-3.5 w-3.5" /> Caliper ({caliperLengthMm} mm)
          </Button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Preset Selector */}
          <Select value={activePreset} onValueChange={handleSelectPreset}>
            <SelectTrigger className="h-7 w-[160px] text-xs bg-slate-950 border-slate-700 text-slate-200">
              <SelectValue placeholder="Preset" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-slate-100">
              {WL_PRESETS.map((p) => (
                <SelectItem key={p.label} value={p.label} className="text-xs focus:bg-slate-800">
                  {p.label} (W:{p.ww} L:{p.wl})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="icon"
            variant={inverted ? "secondary" : "ghost"}
            className={`h-7 w-7 ${inverted ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
            onClick={() => setInverted(!inverted)}
            title="Invert Grayscale Polarity"
          >
            <SunMedium className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-slate-300 hover:bg-slate-800"
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            title="Rotate 90° Clockwise"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="icon"
            variant={flipH ? "secondary" : "ghost"}
            className={`h-7 w-7 ${flipH ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
            onClick={() => setFlipH(!flipH)}
            title="Flip Horizontal"
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
          </Button>

          <Button
            size="icon"
            variant={flipV ? "secondary" : "ghost"}
            className={`h-7 w-7 ${flipV ? "bg-cyan-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}
            onClick={() => setFlipV(!flipV)}
            title="Flip Vertical"
          >
            <FlipVertical className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Right Tools: Zoom In/Out & Reset */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-slate-300 hover:bg-slate-800 text-[11px]"
            onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
          >
            - Zoom
          </Button>
          <span className="font-mono text-[10px] text-slate-400 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-slate-300 hover:bg-slate-800 text-[11px]"
            onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.15).toFixed(2))))}
          >
            + Zoom
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs bg-slate-950 border-slate-700 text-slate-300 hover:text-white"
            onClick={handleResetView}
            title="Reset All Viewport Transforms"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
          </Button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE BODY: SERIES SIDEBAR + MEDICAL CANVAS */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Series Thumbnails Sidebar */}
        <aside className="w-56 border-r border-slate-800 bg-slate-950 p-2 overflow-y-auto space-y-2 shrink-0 hidden sm:block">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Study Series ({seriesList.length})
          </div>

          {seriesList.map((ser) => (
            <div
              key={ser.id}
              className={`p-2 rounded-md border cursor-pointer transition-all ${
                activeSeriesId === ser.id
                  ? "bg-slate-800/90 border-cyan-500 text-white shadow-sm ring-1 ring-cyan-500/50"
                  : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
              onClick={() => handleSelectSeries(ser)}
            >
              {/* Simulated Thumbnail Box */}
              <div className="h-20 bg-slate-950 rounded border border-slate-800 flex items-center justify-center relative overflow-hidden mb-1.5 group">
                <div className="scale-[0.25] pointer-events-none">
                  {renderAnatomySvg(ser.plane, 10)}
                </div>
                <Badge
                  variant="outline"
                  className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1 py-0 border-slate-700 font-mono text-slate-300"
                >
                  {ser.slicesCount} imgs
                </Badge>
              </div>

              <div className="text-xs font-bold text-slate-100 truncate">{ser.name}</div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-0.5">
                <span className="font-semibold text-cyan-400">{ser.plane}</span>
                <span>{ser.thickness}</span>
              </div>
            </div>
          ))}
        </aside>

        {/* Main Canvas Viewport Area */}
        <main
          className="flex-1 bg-black relative flex items-center justify-center overflow-hidden cursor-crosshair"
          onWheel={handleCanvasWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* LAYOUT 1: SINGLE VIEWPORT (1x1) */}
          {layout === "1x1" && (
            <div className="w-full h-full relative flex items-center justify-center">
              {/* Medical Image Canvas */}
              <div
                className="transition-transform duration-75 relative flex items-center justify-center pointer-events-none"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  filter: `contrast(${windowWidth / 350}) brightness(${(windowLevel + 200) / 250}) ${inverted ? "invert(1)" : ""}`,
                }}
              >
                {renderAnatomySvg(activeSeries.plane, currentSlice)}

                {/* Interactive Caliper Overlay */}
                {activeTool === "caliper" && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 500">
                    <line
                      x1={caliperPoints.x1}
                      y1={caliperPoints.y1}
                      x2={caliperPoints.x2}
                      y2={caliperPoints.y2}
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />
                    <circle cx={caliperPoints.x1} cy={caliperPoints.y1} r="5" fill="#06b6d4" />
                    <circle cx={caliperPoints.x2} cy={caliperPoints.y2} r="5" fill="#06b6d4" />
                    <rect
                      x={(caliperPoints.x1 + caliperPoints.x2) / 2 - 28}
                      y={(caliperPoints.y1 + caliperPoints.y2) / 2 - 18}
                      width="56"
                      height="18"
                      fill="#020617"
                      rx="3"
                      stroke="#06b6d4"
                      strokeWidth="1"
                    />
                    <text
                      x={(caliperPoints.x1 + caliperPoints.x2) / 2}
                      y={(caliperPoints.y1 + caliperPoints.y2) / 2 - 4}
                      fill="#06b6d4"
                      fontSize="11"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {caliperLengthMm} mm
                    </text>
                  </svg>
                )}
              </div>

              {/* 4-CORNER MEDICAL OSD HUD (ON-SCREEN DISPLAY) */}
              {/* Top-Left Corner */}
              <div className="absolute top-3 left-3 pointer-events-none text-[11px] font-mono leading-tight space-y-0.5 text-cyan-300 drop-shadow-md">
                <div className="font-bold text-white text-xs">{report.patientName}</div>
                <div>UHID: {report.uhid || report.patientId}</div>
                <div>DOB/Age: {report.age || 48}Y / {report.gender || "M"}</div>
                <div>Study Date: {report.scheduledAt ? report.scheduledAt.slice(0, 10) : "2026-08-24"}</div>
              </div>

              {/* Top-Right Corner */}
              <div className="absolute top-3 right-3 pointer-events-none text-[11px] font-mono leading-tight text-right space-y-0.5 text-slate-300 drop-shadow-md">
                <div className="font-bold text-cyan-400">QLYNO CENTRAL PACS</div>
                <div>Modality: {report.modality}</div>
                <div>Suite: {report.roomName.split(" ")[0]}</div>
                <div className="text-slate-400">{report.source} Study</div>
              </div>

              {/* Bottom-Left Corner */}
              <div className="absolute bottom-4 left-3 pointer-events-none text-[11px] font-mono leading-tight space-y-0.5 text-slate-300 drop-shadow-md">
                <div className="font-bold text-cyan-400">
                  Img: {currentSlice + 1} / {activeSeries.slicesCount}
                </div>
                <div>Thick: {activeSeries.thickness}</div>
                <div>Plane: {activeSeries.plane}</div>
                <div>FOV: 240.0 mm</div>
              </div>

              {/* Bottom-Right Corner */}
              <div className="absolute bottom-4 right-3 pointer-events-none text-[11px] font-mono leading-tight text-right space-y-0.5 text-slate-300 drop-shadow-md">
                <div>W: {windowWidth} L: {windowLevel}</div>
                <div>Zoom: {Math.round(zoom * 100)}%</div>
                <div>Preset: {activePreset}</div>
                <div className="text-cyan-400 font-bold">R / L [{activeSeries.plane}]</div>
              </div>
            </div>
          )}

          {/* LAYOUT 2: DUAL VIEWPORT (1x2 Side-by-Side Comparison) */}
          {layout === "1x2" && (
            <div className="w-full h-full grid grid-cols-2 divide-x divide-slate-800">
              {/* Left Pane: Series 1 (Axial) */}
              <div className="relative flex items-center justify-center p-2 overflow-hidden">
                <div className="scale-90">
                  {renderAnatomySvg("Axial", currentSlice)}
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300">
                  <div className="font-bold text-white">Series 1: Axial Recon</div>
                  <div>Slice: {currentSlice + 1} / 24</div>
                </div>
              </div>

              {/* Right Pane: Series 2 (Coronal) */}
              <div className="relative flex items-center justify-center p-2 overflow-hidden">
                <div className="scale-90">
                  {renderAnatomySvg("Coronal", currentSlice)}
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300">
                  <div className="font-bold text-white">Series 2: Coronal T2</div>
                  <div>Slice: {currentSlice + 1} / 20</div>
                </div>
              </div>
            </div>
          )}

          {/* LAYOUT 3: QUAD MULTI-PLANAR VIEWPORT (2x2) */}
          {layout === "2x2" && (
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 divide-x divide-y divide-slate-800">
              {/* Pane 1: Axial */}
              <div className="relative flex items-center justify-center p-1 overflow-hidden">
                <div className="scale-[0.55]">
                  {renderAnatomySvg("Axial", currentSlice)}
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300">
                  Axial (Primary) • Img: {currentSlice + 1}
                </div>
              </div>

              {/* Pane 2: Coronal */}
              <div className="relative flex items-center justify-center p-1 overflow-hidden">
                <div className="scale-[0.55]">
                  {renderAnatomySvg("Coronal", currentSlice)}
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300">
                  Coronal T2 • Img: {currentSlice + 1}
                </div>
              </div>

              {/* Pane 3: Sagittal */}
              <div className="relative flex items-center justify-center p-1 overflow-hidden">
                <div className="scale-[0.55]">
                  {renderAnatomySvg("Sagittal", currentSlice)}
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300">
                  Sagittal 3D • Img: {currentSlice + 1}
                </div>
              </div>

              {/* Pane 4: 3D Angiography */}
              <div className="relative flex items-center justify-center p-1 overflow-hidden">
                <div className="scale-[0.55]">
                  {renderAnatomySvg("3D Angio", currentSlice)}
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-300">
                  3D Angiography / Bone
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. BOTTOM CINE & SLICE NAVIGATION BAR */}
      <footer className="h-14 border-t border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4 shrink-0">
        {/* Cine Loop Player */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className={`h-8 text-xs font-bold gap-1.5 ${
              isPlayingCine
                ? "bg-rose-600 text-white border-rose-500 hover:bg-rose-700"
                : "bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-700"
            }`}
            onClick={() => setIsPlayingCine(!isPlayingCine)}
          >
            {isPlayingCine ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlayingCine ? "Pause Cine" : "Play Cine"}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-white"
            onClick={() => setCurrentSlice((s) => Math.max(0, s - 1))}
            title="Previous Slice"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="font-mono text-xs font-bold text-slate-200 min-w-[70px] text-center">
            {currentSlice + 1} / {activeSeries.slicesCount}
          </span>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-slate-400 hover:text-white"
            onClick={() => setCurrentSlice((s) => Math.min(activeSeries.slicesCount - 1, s + 1))}
            title="Next Slice"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Slice Scrubber Slider */}
        <div className="flex-1 max-w-xl flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={activeSeries.slicesCount - 1}
            step={1}
            value={currentSlice}
            onChange={(e) => setCurrentSlice(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
          />
        </div>

        {/* Cine Speed Controller */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Speed:</span>
          <div className="flex items-center bg-slate-900 rounded border border-slate-800 p-0.5">
            {[10, 15, 25].map((fps) => (
              <Button
                key={fps}
                size="sm"
                variant={cineFps === fps ? "secondary" : "ghost"}
                className="h-6 px-1.5 text-[10px]"
                onClick={() => setCineFps(fps)}
              >
                {fps} fps
              </Button>
            ))}
          </div>
        </div>
      </footer>

      {/* 5. SLIDE-OUT CLINICAL REPORT DRAWER */}
      <Dialog open={reportDrawerOpen} onOpenChange={setReportDrawerOpen}>
        <DialogContent className="sm:max-w-xl bg-slate-950 border-slate-800 text-slate-100 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-cyan-400">
              <Camera className="h-5 w-5" /> Authorized Radiology Diagnostic Report
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Order #{report.orderNo} • Modality: {report.modality} {report.bodyPart}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs text-slate-200">
            {/* Demographics */}
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Patient Name:</span>
                <span className="font-bold text-slate-100 text-xs">{report.patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">UHID / ID:</span>
                <span className="font-mono text-cyan-300">{report.uhid || report.patientId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Ordering Physician:</span>
                <span className="text-slate-200">{report.orderingDoctor} ({report.source})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Reporting Radiologist:</span>
                <span className="text-slate-200">{report.radiologistName || "Dr. Vikram Seth"}</span>
              </div>
            </div>

            {/* Critical Alert Banner */}
            {report.criticalFinding && (
              <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-300 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4 text-rose-400" /> Life-Threatening Emergency Finding Flagged
                </span>
                <p className="leading-relaxed">{report.criticalDetails}</p>
              </div>
            )}

            {/* Report Notes */}
            <div className="p-4 rounded-lg border border-slate-800 bg-slate-900 space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Radiological Findings &amp; Observations:
                </span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed whitespace-pre-line">
                  {report.reportNotes}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Clinical Impression / Conclusion:
                </span>
                <p className="text-xs text-slate-100 font-semibold mt-1 leading-relaxed">
                  {report.impressionNotes}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
