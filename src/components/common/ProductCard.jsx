import React, { useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useCartStore } from "../../store/cartStore";

import { ShoppingCart } from "lucide-react";

import { Link, generatePath } from "react-router-dom";

import formatCurrency from "@/utils/price";

export default function ProductCard({
  product,
  role = "buyer", // buyer | seller
  onAddToCart,
  onEdit,
  className,
  ...props
}) {
  if (!product) return null;

  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = useCallback(
    (p) => {
      if (!p.id) return;
      addItem({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        sku: p.sku,
        qty: 1,
      });
      onAddToCart?.(p);
    },
    [addItem, onAddToCart]
  );

  const productLink = generatePath("/product/:id", {
    id: encodeURIComponent(product.id),
  });
  return (
    <Link
      to={productLink}
      aria-label={`View details for ${product.name}`}
      className="block"
    >
      <Card className={cn("overflow-hidden", className)} {...props}>
        {/* make content full width and align start so title/description can use full width */}
        <div className="flex flex-col items-start gap-4 w-full p-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-48 h-48 object-cover rounded flex-shrink-0"
          />
          <CardContent className="w-full">
            <CardHeader className="px-0">
              <CardTitle className="w-full truncate" title={product.name}>
                {product.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {product.shortDescription}
              </CardDescription>
            </CardHeader>

            <div className="mt-3 flex flex-col items-center justify-between">
              <div className="flex items-center gap-4 mb-2">
                <div className="text-lg font-semibold">
                  {formatCurrency(product.price)}
                </div>
                {product.sku && (
                  <div className="text-xs text-muted">SKU: {product.sku}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {product.stock !== undefined && (
                  <Badge>
                    {product.stock > 0
                      ? `In stock: ${product.stock}`
                      : "Out of stock"}
                  </Badge>
                )}

                {role === "seller" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit?.(product)}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
