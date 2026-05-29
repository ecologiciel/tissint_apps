import type { ReactNode } from "react";

export function DeviceFrame({ children }: { children: ReactNode }) {
  return (
    <div className="device-frame">
      <div className="device-notch" />
      <div className="flex-1 overflow-y-auto hide-scroll bg-background">
        {children}
      </div>
    </div>
  );
}
