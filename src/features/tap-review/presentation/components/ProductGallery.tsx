import React from "react";

interface ProductGalleryProps {
  products?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ products = [] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="aspect-square overflow-hidden rounded-lg"
        >
          <img
            src={product.id} // Placeholder for image logic
            alt={`Product image ${product.name}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
};

export default ProductGallery;
