import { seedGradient } from "@/lib/mock-data";

export function MeteoriteThumb({ seed, className = "" }: { seed: string; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: seedGradient(seed) }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 30% 30%, oklch(1 0 0 / 0.3), transparent 50%),
                       radial-gradient(circle at 70% 70%, oklch(0 0 0 / 0.5), transparent 60%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, oklch(0 0 0 / 0.4) 1px, transparent 2px),
                            radial-gradient(circle at 60% 30%, oklch(1 0 0 / 0.2) 1px, transparent 2px),
                            radial-gradient(circle at 80% 60%, oklch(0 0 0 / 0.3) 1px, transparent 2px)`,
          backgroundSize: "40px 40px, 30px 30px, 50px 50px",
        }}
      />
    </div>
  );
}
