import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, CreditCard } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { formatCurrency } from "@/utils/price";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const increase = useCartStore((s) => s.increase);
  const decrease = useCartStore((s) => s.decrease);
  const updateItemQuantity = useCartStore((s) => s.updateItemQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const setItems = useCartStore((s) => s.setItems);

  const subtotal = React.useMemo(
    () =>
      items.reduce(
        (acc, it) => acc + (Number(it.price) || 0) * (it.qty || 0),
        0
      ),
    [items]
  );

  const handleCheckout = () => {
    // placeholder: connect to checkout flow
    console.log("Checkout payload:", items);
    alert("Checkout demo — xem console");
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-semibold mb-4">Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-muted-foreground">Giỏ hàng trống.</p>
            <Link to="/" className="inline-block">
              <Button>Quay về mua sắm</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center gap-4 p-4 rounded-md border bg-card"
                >
                  <img
                    src={it.images?.[0] || "/placeholder.png"}
                    alt={it.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{it.name}</h3>
                    {it.sku && (
                      <p className="text-sm text-muted-foreground">
                        SKU: {it.sku}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          aria-label="Giảm"
                          onClick={() => decrease(it.id, 1)}
                          className="px-3 py-1 hover:bg-muted-foreground/10"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <input
                          aria-label="Số lượng"
                          value={it.qty}
                          onChange={(e) =>
                            updateItemQuantity(
                              it.id,
                              Math.max(1, Number(e.target.value || 0))
                            )
                          }
                          className="w-12 text-center bg-transparent outline-none"
                        />

                        <button
                          aria-label="Tăng"
                          onClick={() => increase(it.id, 1)}
                          className="px-3 py-1 hover:bg-muted-foreground/10"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(it.id)}
                        className="text-destructive"
                        aria-label={`Xóa ${it.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <div className="text-sm text-muted-foreground">Đơn giá</div>
                    <div className="font-medium">
                      {formatCurrency(it.price)}
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">
                      Tổng:{" "}
                      {formatCurrency((Number(it.price) || 0) * (it.qty || 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* summary */}
            <aside className="p-4 rounded-md border bg-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium">Tóm tắt đơn hàng</h2>
                <Button variant="link" size="sm" onClick={() => clearCart()}>
                  Xóa tất cả
                </Button>
              </div>

              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tạm tính</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between mb-4">
                <span className="text-sm text-muted-foreground">
                  Phí vận chuyển
                </span>
                <span className="font-medium">Miễn phí</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm">Tổng</span>
                  <span className="text-2xl font-semibold">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Thanh toán
                </Button>

                <Link
                  to="/"
                  className="block text-center mt-3 text-sm text-muted-foreground hover:underline"
                >
                  Tiếp tục mua sắm
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
