import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image, Upload, RotateCw, Video, AlertCircle, Sparkles, Check, Trash } from 'lucide-react';

const TEAM_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
];

interface ImagePickerProps {
  currentImage: string;
  onChange: (image: string) => void;
  label?: string;
}

export default function ImagePicker({ currentImage, onChange, label = "Upload or Take Photo" }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 150, height: 150, facingMode: "user" }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera access denied or unavailable.");
      setActiveTab('upload');
    }
  };

  const handleTabChange = (tab: 'upload' | 'camera') => {
    if (tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    setActiveTab(tab);
  };

  // Convert files to optimized Base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files are accepted here.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        // Optimize the image density by fitting it inside a 150x150 canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement('canvas');
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to canvas
        ctx.scale(-1, 1); // Flip horizontally for standard mirror view
        ctx.drawImage(videoRef.current, -150, 0, 150, 150);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onChange(dataUrl);
        stopCamera();
        setActiveTab('upload');
      }
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-left space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        {currentImage.startsWith('data:image/') && (
          <span className="text-[9px] bg-green-50 text-green-700 border border-green-150 px-2 py-0.5 rounded font-bold flex items-center gap-1.5 animate-pulse">
            <Check className="w-3 h-3 text-green-600" />
            Custom Photo Captured
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Rounded Current Photo Preview Container */}
        <div className="relative group shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-primary shadow-md bg-white flex items-center justify-center">
            {currentImage ? (
              <img src={currentImage} className="w-full h-full object-cover" alt="Explorer Preview" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                ?
              </div>
            )}
          </div>
          {currentImage && currentImage.startsWith('data:image/') && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute -top-1 -right-1 bg-brand-danger hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors cursor-pointer"
              title="Remove custom photo"
            >
              <Trash className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Tab switcher options */}
        <div className="flex p-0.5 bg-slate-152 rounded-xl text-[10px] h-8 items-center grow">
          <button
            type="button"
            onClick={() => handleTabChange('upload')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-center cursor-pointer transition-colors ${
              activeTab === 'upload' ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('camera')}
            className={`flex-1 py-1 px-2 rounded-lg font-bold text-center cursor-pointer transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'camera' ? 'bg-white shadow-sm text-slate-900 border border-slate-100' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3 h-3" /> Snap Photo
          </button>
        </div>
      </div>

      {/* Tabs panels render screens */}
      <div className="border border-slate-200 bg-white rounded-xl p-3 min-h-[96px] flex items-center justify-center">
        {/* UPLOAD FILE PANEL */}
        {activeTab === 'upload' && (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-brand-primary bg-blue-50/50' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
            <p className="text-[11px] font-bold text-slate-600">Drag files here, or tap to choose</p>
            <p className="text-[9px] text-slate-400 font-medium mt-0.5">Supports PNG, JPG (Auto-cropped to active tile)</p>
          </div>
        )}

        {/* WEBCAM CAMERA SNAP PANEL */}
        {activeTab === 'camera' && (
          <div className="w-full space-y-3 flex flex-col items-center">
            {cameraError ? (
              <div className="text-center p-2 text-xs text-red-500 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p>{cameraError}</p>
              </div>
            ) : (
              <div className="relative text-center w-full flex flex-col items-center">
                {/* Mirror view camera stream card box */}
                <div className="w-28 h-28 bg-black rounded-full overflow-hidden border-2 border-brand-primary relative shadow-sm">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover -scale-x-100"
                  />
                  <div className="absolute inset-x-0 bottom-1 hover:opacity-100 text-[8px] bg-black/60 text-white py-0.5 pointer-events-none select-none font-bold uppercase tracking-wider">
                    Webcam Access
                  </div>
                </div>

                <div className="flex gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="bg-brand-primary hover:bg-slate-800 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all shadow-slate-900/15"
                  >
                    <Camera className="w-3.5 h-3.5 stroke-[2.5px]" /> Take snap photo
                  </button>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-[10px] p-1.5 rounded-lg cursor-pointer transition-colors"
                    title="Refresh stream"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
