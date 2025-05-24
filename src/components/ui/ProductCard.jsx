import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Settings, ShoppingCart, CreditCard } from "lucide-react";
import ProductEditor from "../admin/ProductEditor";
import EditableText from "../admin/EditableText";
import EditableImage from "../admin/EditableImage";
import EditablePrice from "../admin/EditablePrice";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const ProductCard = ({ product, onProductUpdate }) => {
  const { isAdmin, isEditMode } = useAdmin();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleProductUpdate = (updatedProduct) => {
    setCurrentProduct(updatedProduct);
    if (onProductUpdate) {
      onProductUpdate(updatedProduct);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.image,
      quantity: 1,
    });

    toast.success(`${currentProduct.name} đã được thêm vào giỏ hàng của bạn`);
  };

  const handleBuyNow = () => {
    addToCart({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.image,
      quantity: 1,
    });

    toast.success(`Đang tiến hành thanh toán ${currentProduct.name}`);

    // Navigate to checkout
    setTimeout(() => {
      navigate("/checkout");
    }, 500);
  };

  return (
    <>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 relative group">
        {/* Product Image with Link */}
        <Link to={`/product/${currentProduct.id}`} className="block">
          <EditableImage
            src={currentProduct.image}
            alt={currentProduct.name}
            className="w-full h-64 object-cover"
          />
        </Link>

        {/* Product Details */}
        <div className="p-5">
          <div className="mb-2">
            <p className="text-brown/70 text-sm">{currentProduct.category}</p>
          </div>
          <Link to={`/product/${currentProduct.id}`} className="block">
            <EditableText
              initialText={currentProduct.name}
              className="font-playfair text-xl text-brown hover:text-gold transition-colors mb-2"
              as="h3"
              onSave={(text) =>
                handleProductUpdate({ ...currentProduct, name: text })
              }
            />
          </Link>
          <EditableText
            initialText={currentProduct.description}
            className="text-brown/80 text-sm mb-4 line-clamp-2"
            as="p"
            onSave={(text) =>
              handleProductUpdate({ ...currentProduct, description: text })
            }
          />
          <div className="flex justify-between items-center mb-3">
            <EditablePrice
              initialPrice={currentProduct.price}
              className="text-brown font-semibold text-lg"
              onSave={(price) =>
                handleProductUpdate({ ...currentProduct, price: price })
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-2">
            <Button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center bg-brown text-cream hover:bg-brown/90"
            >
              <ShoppingCart className="mr-1 h-4 w-4" /> Thêm vào giỏ hàng
            </Button>
            <Button
              variant="outline"
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center border-brown text-brown hover:bg-brown/10"
            >
              <CreditCard className="mr-1 h-4 w-4" /> Mua ngay
            </Button>
          </div>
        </div>

        {/* Admin edit button */}
        {isAdmin && isEditMode && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Settings size={18} className="text-brown" />
          </button>
        )}
      </div>

      {/* Product Editor Modal */}
      {isAdmin && (
        <ProductEditor
          product={currentProduct}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleProductUpdate}
        />
      )}
    </>
  );
};

export default ProductCard;
