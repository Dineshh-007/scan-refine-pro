import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface DistortionHeatmapProps {
  imageUrl: string;
  distortionSeverity?: number;
}

export const DistortionHeatmap = ({ imageUrl, distortionSeverity = 0 }: DistortionHeatmapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Create heatmap overlay
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simulate distortion detection by analyzing edge pixels
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;

          // Calculate distance from center (barrel/pincushion distortions are stronger at edges)
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const distanceFromCenter = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );
          const maxDistance = Math.sqrt(
            Math.pow(centerX, 2) + Math.pow(centerY, 2)
          );
          const distortionFactor = distanceFromCenter / maxDistance;

          // Apply heatmap coloring based on distortion
          const intensity = Math.floor(distortionFactor * 255 * (distortionSeverity / 100));
          
          // Red overlay for high distortion areas
          data[index] = Math.min(255, data[index] + intensity); // Red
          data[index + 3] = Math.min(255, data[index + 3] + intensity * 0.6); // Alpha
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };
    img.src = imageUrl;
  }, [imageUrl, distortionSeverity]);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Distortion Heatmap</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500"></div>
            <span>High</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Distortion Severity: {distortionSeverity}%
        </p>
      </div>
      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full object-contain" />
      </div>
    </Card>
  );
};
