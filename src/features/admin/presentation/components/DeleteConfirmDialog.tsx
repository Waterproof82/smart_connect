import React from "react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Close dialog"
      />
      <div className="relative bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-6 max-w-sm w-full shadow-lg">
        <h4 className="text-lg font-bold text-default mb-2">
          ¿Eliminar documento?
        </h4>
        <p className="text-sm text-muted mb-6">
          Se eliminará permanentemente &quot;{title}...&quot;. Esta acción no se
          puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-default hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 rounded-lg"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 text-white rounded-lg"
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
