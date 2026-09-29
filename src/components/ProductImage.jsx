import { useState } from "react";

export default function ProductImage({ src, alt, eager = false }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="img-fallback" role="img" aria-label={`No photo available for ${alt}`}>
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
          <path d="M11 18.5h2" strokeLinecap="round" />
        </svg>
        <span>No photo yet</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
