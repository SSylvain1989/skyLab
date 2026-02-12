import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  url: string;
  onClose: () => void;
}

export function QRCodeModal({ url, onClose }: QRCodeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-[var(--bg-primary)] border border-[var(--border-strong)] rounded-xl p-6 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div className="bg-white p-3 rounded-lg">
          <QRCodeSVG value={url} size={200} />
        </div>
        <p className="text-[11px] text-[var(--text-tertiary)] max-w-[240px] text-center break-all">
          {url}
        </p>
      </div>
    </div>
  );
}
