-- Create service requests table
CREATE TABLE public.service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_provider_id UUID,
  service_type TEXT NOT NULL,
  user_location_lat DOUBLE PRECISION NOT NULL,
  user_location_lng DOUBLE PRECISION NOT NULL,
  user_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create location tracking table for real-time tracking
CREATE TABLE public.provider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_provider_id UUID NOT NULL,
  request_id UUID REFERENCES public.service_requests(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service_requests
CREATE POLICY "Users can view their own requests"
ON public.service_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service providers can view requests assigned to them"
ON public.service_requests
FOR SELECT
USING (auth.uid() = service_provider_id);

CREATE POLICY "Users can create their own requests"
ON public.service_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service providers can update assigned requests"
ON public.service_requests
FOR UPDATE
USING (auth.uid() = service_provider_id);

CREATE POLICY "Users can update their own requests"
ON public.service_requests
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for provider_locations
CREATE POLICY "Users can view provider locations for their requests"
ON public.provider_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests
    WHERE service_requests.id = provider_locations.request_id
    AND service_requests.user_id = auth.uid()
  )
);

CREATE POLICY "Service providers can view their own locations"
ON public.provider_locations
FOR SELECT
USING (auth.uid() = service_provider_id);

CREATE POLICY "Service providers can insert their locations"
ON public.provider_locations
FOR INSERT
WITH CHECK (auth.uid() = service_provider_id);

CREATE POLICY "Service providers can update their locations"
ON public.provider_locations
FOR UPDATE
USING (auth.uid() = service_provider_id);

-- Enable realtime for location tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.provider_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_requests;