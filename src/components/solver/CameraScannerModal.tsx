import React, { useState, useRef, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  RotateCw,
  Crop,
  RefreshCw,
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  Check,
  SwitchCamera,
  Layers,
  ArrowRight
} from "lucide-react";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeImages: (images: string[]) => void;
}

export function CameraScannerModal({
  isOpen,
  onClose,
  onAnalyzeImages,
}: CameraScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize or restart camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera API is not supported in this browser environment. You can upload an image file instead.");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setCameraError(
        err.name === "NotAllowedError"
          ? "Camera permission was denied. Please allow camera access in your browser or upload an image."
          : "Unable to start camera stream. Please use image upload."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Apply rotation if any
    if (rotationAngle !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180);
      ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImages((prev) => [...prev, dataUrl]);
  };

  const handleRotate = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  const handleRemoveImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleComplete = () => {
    if (capturedImages.length === 0) return;
    setIsProcessing(true);
    stopCamera();
    onAnalyzeImages(capturedImages);
    onClose();
    setIsProcessing(false);
  };

  // Mock capture fallback if camera is unavailable on desktop without webcam
  const handleSimulateCapture = () => {
    // Generate a high quality mock question image for testing
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 800;
    sampleCanvas.height = 450;
    const sCtx = sampleCanvas.getContext("2d");
    if (sCtx) {
      sCtx.fillStyle = "#ffffff";
      sCtx.fillRect(0, 0, 800, 450);
      sCtx.fillStyle = "#1e293b";
      sCtx.font = "bold 24px sans-serif";
      sCtx.fillText("Practice Problem 4.2", 40, 60);
      sCtx.font = "20px serif";
      sCtx.fillText("Solve for x in the quadratic equation:", 40, 110);
      sCtx.font = "bold 26px serif";
      sCtx.fillStyle = "#c2410c";
      sCtx.fillText("2x² - 7x + 3 = 0", 80, 170);
      sCtx.fillStyle = "#475569";
      sCtx.font = "18px sans-serif";
      sCtx.fillText("Show all steps using the quadratic formula and state the discriminant.", 40, 230);
      sCtx.lineWidth = 2;
      sCtx.strokeStyle = "#cbd5e1";
      sCtx.strokeRect(30, 30, 740, 390);

      const mockData = sampleCanvas.toDataURL("image/jpeg");
      setCapturedImages((prev) => [...prev, mockData]);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-orange-400" />
          <span>Camera Scanner</span>
        </div>
      }
      description="Position the question, equation, or diagram inside the viewfinder."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Hidden processing canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder area */}
        <div className="relative aspect-[4/3] sm:aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shadow-inner">
          {cameraError ? (
            <div className="p-6 text-center max-w-md space-y-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-sm text-gray-300">{cameraError}</p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={startCamera}>
                  <RefreshCw className="h-4 w-4 mr-1.5" /> Try Again
                </Button>
                <Button variant="default" size="sm" onClick={handleSimulateCapture}>
                  <Sparkles className="h-4 w-4 mr-1.5" /> Load Sample Exam Question
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ transform: `rotate(${rotationAngle}deg)` }}
                className="w-full h-full object-cover transition-transform duration-300"
              />

              {/* Viewfinder Scan Overlays */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-orange-500/60 rounded-xl pointer-events-none">
                {/* Viewfinder corners */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-orange-400" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-orange-400" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-orange-400" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-orange-400" />

                {/* Animated scan line */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-[0_0_12px_#f97316] animate-bounce" />
              </div>

              {/* Camera Controls inside preview */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleFlipCamera}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10"
                  title="Switch camera"
                >
                  <SwitchCamera className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              {/* Fallback button overlay for simulated snapshot */}
              <button
                onClick={handleSimulateCapture}
                className="absolute bottom-3 left-3 text-[11px] text-gray-400 hover:text-orange-300 bg-black/70 px-2.5 py-1 rounded-lg border border-white/10"
              >
                Insert Sample Question
              </button>
            </>
          )}
        </div>

        {/* Capture Action Controls */}
        <div className="flex items-center justify-center gap-4 py-1">
          <Button
            size="lg"
            variant="gradient"
            onClick={handleCapture}
            className="rounded-full h-16 w-16 p-0 shadow-glow-amber border-4 border-white/20"
            title="Take Photo"
          >
            <div className="w-6 h-6 rounded-full bg-white" />
          </Button>
        </div>

        {/* Multi-Image Captured Thumbnails Strip */}
        {capturedImages.length > 0 && (
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5 font-medium text-white">
                <Layers className="h-3.5 w-3.5 text-orange-400" />
                Captured Pages / Diagrams ({capturedImages.length})
              </span>
              <span className="text-[11px] text-amber-300">
                Multi-image questions will be solved together
              </span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {capturedImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/20 bg-black"
                >
                  <img src={img} alt={`Capture ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 text-[10px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                    P{idx + 1}
                  </span>
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="default"
            size="md"
            disabled={capturedImages.length === 0 || isProcessing}
            onClick={handleComplete}
            className="gap-2"
          >
            <span>Analyze Question ({capturedImages.length})</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
