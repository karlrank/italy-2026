"use client";

import { useState } from "react";

// Photo that falls back to a gradient when the image fails to load.
export default function Photo({
  src,
  alt,
  gradient = "from-iseo to-garda",
  className = "",
  imgClassName = "",
  children,
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        aria-hidden="true"
      />
      {!failed && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      )}
      {children}
    </div>
  );
}
