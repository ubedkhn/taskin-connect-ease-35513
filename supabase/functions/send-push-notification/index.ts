import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { requestId, serviceType, userAddress } = await req.json();

    console.log('New service request:', { requestId, serviceType, userAddress });

    // Get all service providers (you could filter by service type in the future)
    const { data: providers, error: providersError } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'service_provider');

    if (providersError) {
      throw providersError;
    }

    // Create notifications for all service providers
    const notifications = providers?.map(provider => ({
      user_id: provider.user_id,
      type: 'service',
      title: 'New Service Request',
      message: `New ${serviceType} request near ${userAddress || 'your area'}`,
      related_id: requestId,
      action_url: `/service-provider`,
    })) || [];

    if (notifications.length > 0) {
      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notifError) {
        throw notifError;
      }

      console.log(`Sent notifications to ${notifications.length} providers`);
    }

    // In a production app, you would also send actual push notifications here
    // using a service like Firebase Cloud Messaging (FCM) or OneSignal

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${notifications.length} service providers` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending push notification:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
