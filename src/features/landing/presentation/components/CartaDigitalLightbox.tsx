import React from "react";
import { X } from "lucide-react";

interface CartaDigitalLightboxProps {
  image: string | null;
  onClose: () => void;
}

const CartaDigitalLightbox: React.FC<CartaDigitalLightboxProps> = ({
  image,
  onClose,
}) => {
  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Ampliar imagen"
      className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <button
        type="button"
        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={image}
        alt="Imagen ampliada"
        className="relative max-w-5xl w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
      />
    </div>
  );
};

export default CartaDigitalLightbox;
