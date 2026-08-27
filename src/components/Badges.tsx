const categoryStyles: Record<string, string> = {
  "Tanah dan Bangunan": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Peralatan dan Mesin": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "Aset Tak Berwujud": "bg-purple-50 text-purple-700 ring-purple-600/20",
};

const conditionStyles: Record<string, { dot: string; badge: string }> = {
  Baik: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
  },
  "Rusak Ringan": {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 ring-amber-500/20",
  },
  "Rusak Berat": {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-rose-500/20",
  },
  Aktif: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 ring-blue-500/20",
  },
  "Kadaluwarsa (Expired)": {
    dot: "bg-slate-500",
    badge: "bg-slate-50 text-slate-700 ring-slate-500/20",
  },
};

export function CategoryBadge({
  category,
  subCategory,
}: {
  category: string;
  subCategory: string;
}) {
  const style =
    categoryStyles[category] || "bg-slate-50 text-slate-700 ring-slate-600/20";
  return (
    <div className="flex flex-col items-start gap-1">
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100">
        {category}
      </span>
      <span
        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold tracking-wide ring-1 ring-inset ${style}`}
      >
        {subCategory || category}
      </span>
    </div>
  );
}

export function ConditionBadge({ condition }: { condition: string }) {
  const style = conditionStyles[condition] || {
    dot: "bg-slate-500",
    badge: "bg-slate-50 text-slate-700 ring-slate-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ring-1 ring-inset ${style.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shadow-sm`} />
      {condition}
    </span>
  );
}
