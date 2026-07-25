export type Env = {
  SITE_URL: string;
  // Mindbody Public API v6 (sandbox hasta el go-live del developer account)
  MINDBODY_API_KEY?: string;
  MINDBODY_SITE_ID?: string;
  MINDBODY_STAFF_USER?: string;
  MINDBODY_STAFF_PASSWORD?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  META_PIXEL_ID: string;
  META_CAPI_ACCESS_TOKEN: string;
  GA4_MEASUREMENT_ID: string;
  GA4_API_SECRET: string;
};

/** Payload que manda el front al iniciar checkout */
export type CheckoutRequest = {
  priceId: string;           // stripe_price_id elegido
  email?: string;            // si ya lo tenemos (form previo)
  attribution: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    fbclid?: string;
    fbp?: string;            // cookie _fbp
    fbc?: string;            // cookie _fbc
    gclid?: string;
    ga_client_id?: string;   // gtag('get', ..., 'client_id')
    landing_path?: string;
    referrer?: string;
  };
};
