"use client";

interface Props {
  image: { src: string; title: string } | null;
  onClose: () => void;
}

export default function ImageViewerModal({ image, onClose }: Props) {
  if (!image) return null;

  return (
    <div
      id="imageViewerModal"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 print:hidden"
    >
      <div
        className="absolute inset-0 bg-slate-900/95 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none">
        <div className="relative group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.title}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl pointer-events-auto ring-1 ring-white/10 bg-black/20"
          />
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-4 -right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-rose-500 rounded-full h-10 w-10 flex items-center justify-center transition-all shadow-xl pointer-events-auto"
            aria-label="Tutup"
          >
            <i className="ph-bold ph-x text-lg" />
          </button>
        </div>
        <div className="mt-5 pointer-events-auto text-center">
          <span className="text-white font-bold text-lg px-4 py-2 bg-slate-800/50 rounded-full backdrop-blur-sm border border-white/10">
            {image.title}
          </span>
        </div>
      </div>
    </div>
  );
}
