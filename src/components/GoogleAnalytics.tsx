import Script from "next/script";

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-3BDFQNGNGX"
        strategy="afterInteractive"
        nonce="google-analytics"
      />
      <Script 
        id="google-analytics" 
        strategy="afterInteractive"
        nonce="google-analytics"
      >
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-3BDFQNGNGX');
        `}
      </Script>
    </>
  );
} 