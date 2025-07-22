// DirectionOverlay.jsx
import { useRef, useEffect } from "react";
import { DomEvent } from "leaflet";
import DirectionBox from "./DirectionBox";

export default function DirectionOverlay(props) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      // Chặn mọi click, dblclick, mousedown, touchstart…
      DomEvent.disableClickPropagation(el);
      // Chặn scroll hoặc wheel zoom khi cuộn trong box
      DomEvent.disableScrollPropagation(el);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="custom-overlay"
      style={{ pointerEvents: "auto", zIndex: 1001 }}
    >
      <DirectionBox {...props} />
    </div>
  );
}
