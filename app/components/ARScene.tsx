"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Script from "next/script";

export default function ARScene({
  src,
  iosSrc,
  alt,
}: {
  src: string;
  iosSrc?: string;
  alt?: string;
}) {
  // Only render on client side
  const [isClient, setIsClient] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Return a placeholder during SSR
    return (
      <div
        style={{
          width: "100%",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <div>Loading 3D viewer...</div>
      </div>
    );
  }

  return (
    <div>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.3.0/model-viewer.min.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="afterInteractive"
      />

      {scriptLoaded ? (
        <div style={{ width: "100%", height: "400px" }}>
          {/* @ts-ignore - model-viewer is a custom element */}
          <model-viewer
            src={src || null} // Use null instead of empty string
            ios-src={iosSrc || null}
            alt={alt}
            camera-controls
            ar
            ar-modes="webxr scene-viewer quick-look"
            style={{ width: "100%", height: "100%" }}
          >
            <button slot="ar-button">
              Ver plato virtualmente prueba{" "}
              <span className=" transition-all hover:ease-in-out ease-in-out duration-100 hover:animate-bounce hover:delay-75">
                <Image
                  src="/Icons/icons8-ar-white-64.png"
                  alt="Augmented Reality icon"
                  width={24}
                  height={24}
                />
              </span>
            </button>
          </model-viewer>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          <div>Loading 3D viewer...</div>
        </div>
      )}
    </div>
  );
}
