-- Create corrections table to store report history
CREATE TABLE public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image_url TEXT NOT NULL,
  corrected_image_url TEXT NOT NULL,
  correction_method TEXT NOT NULL,
  distortion_severity TEXT NOT NULL,
  distortion_type TEXT,
  processing_time_ms INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own corrections"
  ON public.corrections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own corrections"
  ON public.corrections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own corrections"
  ON public.corrections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own corrections"
  ON public.corrections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_corrections_user_id ON public.corrections(user_id);
CREATE INDEX idx_corrections_created_at ON public.corrections(created_at DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_corrections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_corrections_updated_at
  BEFORE UPDATE ON public.corrections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_corrections_updated_at();