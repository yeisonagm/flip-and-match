import type { ReactNode } from "react";

export function Modal({ children }: { readonly children: ReactNode }) {
  return (
    <div className="modal-overlay">
      <div className="modal-panel" role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  );
}
