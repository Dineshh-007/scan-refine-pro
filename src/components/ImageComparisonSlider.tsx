import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export const ImageComparisonSlider = ({
  beforeImage,
  afterImage,
  beforeLabel = "Original",
  afterLabel = "Corrected"
}: ImageComparisonSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <Card className="relative overflow-hidden select-none">
      <div
        ref={containerRef}
        className="relative w-full aspect-square cursor-col-resize"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* After Image (Right side - full width) */}
        <div className="absolute inset-0">
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {afterLabel}
          </div>
        </div>

        {/* Before Image (Left side - clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-cover"
            style={{ width: containerRef.current ? `${(containerRef.current.offsetWidth / sliderPosition) * 100}%` : '100%' }}
            draggable={false}
          />
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {beforeLabel}
          </div>
        </div>

        {/* Slider Line and Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-2 border-primary">
            <div className="flex gap-1">
              <div className="w-0.5 h-4 bg-primary"></div>
              <div className="w-0.5 h-4 bg-primary"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm">
        Drag slider to compare
      </div>
    </Card>
  );
};
