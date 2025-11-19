import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { mockUsers, getUserById } from "@/data/mockData";
import { formatCurrency } from "@/utils/price";
import {
  Mail,
  Phone,
  MapPin,
  LogOut,
  Edit3,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Profile() {
  // nếu route /profile/:id thì useParams, nếu không có thì lấy user đầu tiên
  const { id } = useParams?.() ?? {};
  const user = React.useMemo(() => getUserById(id) || mockUsers[0], [id]);

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center text-muted-foreground">
            User not found
          </div>
        </div>
      </MainLayout>
    );
  }

  // thêm helper lấy initials gần đầu component
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((s) => s[0] || "")
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Thay thế <img src={user.avatar} ... /> bằng Avatar component */}
          <Avatar className="w-28 h-28">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold truncate">{user.name}</h1>
                <div className="text-sm text-muted-foreground">
                  @{user.username} • {user.role}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md border hover:bg-muted-foreground/5"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>

                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-destructive text-white"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {user.bio && (
              <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-card">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-card">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address?.city && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-card">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {user.address.line1}, {user.address.city}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* stats + actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 gap-4">
            {/* Orders as Card */}
            <section aria-labelledby="orders-title">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <h2 id="orders-title" className="text-lg font-medium">
                      Đơn hàng gần đây
                    </h2>
                    <Link
                      to="/orders"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Xem tất cả
                    </Link>
                  </div>
                </CardHeader>

                <CardContent>
                  {user.orders?.length ? (
                    <ul className="space-y-3">
                      {user.orders.map((o) => (
                        <li key={o.id} className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">#{o.id}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(o.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {o.items
                                .map((it) => `${it.name} x${it.qty}`)
                                .join(", ")}
                            </div>
                            <div className="mt-2 text-sm">
                              Tổng:{" "}
                              <span className="font-medium">
                                {formatCurrency(o.total)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs px-2 py-1 rounded-md bg-[color:var(--color-card)] text-muted-foreground">
                            {o.status}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Chưa có đơn hàng.
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Favorites as Card */}
            <section aria-labelledby="favorites-title">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <h2 id="favorites-title" className="text-lg font-medium">
                      Yêu thích
                    </h2>
                    <Link
                      to="/wishlist"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Quản lý
                    </Link>
                  </div>
                </CardHeader>

                <CardContent>
                  {user.favorites?.length ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {user.favorites.map((pid) => (
                        <div
                          key={pid}
                          className="p-2 rounded-md border bg-white/5 text-sm text-center"
                        >
                          {pid}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Không có sản phẩm yêu thích.
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* sidebar: summary as Card */}
          <aside aria-labelledby="summary-title">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <h3 id="summary-title" className="text-lg font-medium">
                    Tóm tắt
                  </h3>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">
                      Tổng chi
                    </div>
                    <div className="text-lg font-semibold">
                      {formatCurrency(user.stats?.totalSpent ?? 0)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Đơn hàng</span>
                    <span className="font-medium">
                      {user.stats?.ordersCount ?? 0}
                    </span>
                  </div>
                  {user.role === "seller" && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Sản phẩm</span>
                      <span className="font-medium">
                        {user.stats?.productsCount ?? 0}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>Wishlist</span>
                    <span className="font-medium">
                      {user.stats?.wishlistCount ?? 0}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-muted-foreground">
                    Phương thức thanh toán
                  </div>
                  {user.paymentMethods?.length ? (
                    <ul className="space-y-2 mt-3">
                      {user.paymentMethods.map((pm) => (
                        <li
                          key={pm.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            <div className="text-sm">
                              {pm.brand} • **** {pm.last4}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {pm.expiry}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-3">
                      Chưa có phương thức thanh toán
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/payment-methods"
                    className="text-sm hover:underline"
                  >
                    Quản lý phương thức thanh toán
                  </Link>
                  <Link to="/orders" className="text-sm hover:underline">
                    Xem lịch sử đơn
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
