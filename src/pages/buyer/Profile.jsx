import React from "react";
import MainLayout from "../../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/price";
import { Mail, Phone, MapPin, LogOut, Edit3, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import useProfile from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import useAuth from "@/hooks/useAuth"; // <-- added

export default function Profile() {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const { logout } = useAuth(); // <-- added
  const [isLoggingOut, setIsLoggingOut] = React.useState(false); // <-- added

  // redirect to login when no authenticated user in store
  React.useEffect(() => {
    if (!authUser) {
      navigate("/login", { replace: true });
    }
  }, [authUser, navigate]);

  // useProfile will use authStore.user.id if no idProp passed
  const { data, isLoading, isError } = useProfile();

  // prefer fetched data, fallback to authStore user
  const fetched = data ?? null;
  const user = (fetched && (fetched.user ?? fetched)) || authUser;

  // logout handler
  const handleLogout = React.useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      // after logout, redirect to home or login
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          Đang tải thông tin người dùng...
        </div>
      </MainLayout>
    );
  }

  if (isError || !user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center text-muted-foreground">
            Không thể tải profile
          </div>
        </div>
      </MainLayout>
    );
  }

  const getInitials = (name = "") =>
    String(name)
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
          <Avatar className="w-28 h-28">
            <AvatarImage
              src={user.image ?? user.avatar}
              alt={user.name ?? user.username}
            />
            <AvatarFallback>
              {getInitials(
                user.name ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold truncate">
                  {user.name ??
                    `${user.firstName ?? ""} ${user.lastName ?? ""}`}
                </h1>
                <div className="text-sm text-muted-foreground">
                  @{user.username ?? user.email} • {user.role ?? "customer"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleLogout} // <-- wired logout
                  disabled={isLoggingOut} // <-- disable while logging out
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Đang đăng xuất..." : "Logout"}
                </Button>
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
                    {user.address.line1 ?? user.address?.address},{" "}
                    {user.address.city}
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
                                ?.map((it) => `${it.name} x${it.qty}`)
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
                  <a
                    href="/payment-methods"
                    className="text-sm hover:underline"
                  >
                    Quản lý phương thức thanh toán
                  </a>
                  <a href="/orders" className="text-sm hover:underline">
                    Xem lịch sử đơn
                  </a>
                </div>
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
