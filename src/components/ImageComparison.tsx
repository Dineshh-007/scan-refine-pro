import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ImageComparisonProps {
  originalUrl: string;
  correctedUrl: string;
}

export const ImageComparison = ({ originalUrl, correctedUrl }: ImageComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState([50]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Create distortion visualization overlay
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const distortionIntensity = (distance / maxDistance) * 0.6;

          const index = (y * canvas.width + x) * 4;

          // Add red overlay to highly distorted areas
          if (distortionIntensity > 0.3) {
            data[index] = Math.min(255, data[index] + distortionIntensity * 200); // Red
            data[index + 3] = Math.min(255, data[index + 3] + 100); // Alpha
          }
          // Add yellow overlay to moderate distortion
          else if (distortionIntensity > 0.15) {
            data[index] = Math.min(255, data[index] + distortionIntensity * 180); // Red
            data[index + 1] = Math.min(255, data[index + 1] + distortionIntensity * 180); // Green
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
    img.src = originalUrl;
  }, [originalUrl]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Before & After Comparison with Distortion Overlay</h3>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/60" />
          <span>High Distortion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/60" />
          <span>Moderate Distortion</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/60" />
          <span>Corrected</span>
        </div>
      </div>

      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        {/* Distortion Overlay Canvas (Left Side) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition[0]}%)`,
          }}
        />
        
        {/* Corrected Image (Right Side) */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)` }}
        >
          <img
            src={correctedUrl}
            alt="Corrected MRI"
            className="w-full h-full object-contain"
          />
        </div>

        {/* Slider line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize shadow-lg z-10"
          style={{ left: `${sliderPosition[0]}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 border-2 border-white rounded-full" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
          Original + Distortion Map
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm font-medium">
          Corrected
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>← Drag slider to compare</span>
          <span>Corrected →</span>
        </div>
        <Slider
          value={sliderPosition}
          onValueChange={setSliderPosition}
          max={100}
          step={1}
          className="cursor-pointer"
        />
      </div>
    </Card>
  );
};
