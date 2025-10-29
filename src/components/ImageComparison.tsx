import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ImageComparisonProps {
  originalUrl: string;
  correctedUrl: string;
}

export const ImageComparison = ({ originalUrl, correctedUrl }: ImageComparisonProps) => {
  const [sliderPosition, setSliderPosition] = useState([50]);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Before & After Comparison</h3>
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
        {/* Original Image */}
        <img
          src={originalUrl}
          alt="Original MRI"
          className="absolute inset-0 w-full h-full object-contain"
        />
        
        {/* Corrected Image with clip path */}
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
          className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
          style={{ left: `${sliderPosition[0]}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 border-2 border-white rounded-full" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
          Original
        </div>
        <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded text-sm">
          Corrected
        </div>
      </div>

      <div className="mt-4">
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
