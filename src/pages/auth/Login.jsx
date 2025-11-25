import React from "react";
import LayoutAuth from "@/components/layout/LayoutAuth";
import { HomeIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GenericForm from "@/components/ui/form";
import useAuth from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, mutation } = useAuth();

  const fields = [
    {
      name: "username",
      label: "Username",
      placeholder: "Tên đăng nhập",
      required: true,
      autoFocus: true,
    },
    {
      name: "password",
      label: "Mật khẩu",
      type: "password",
      placeholder: "Mật khẩu",
      required: true,
    },
  ];

  // trang đến trước đó (fallback "/")
  const from = location.state?.from?.pathname || "/";

  // redirect khi login thành công
  React.useEffect(() => {
    if (mutation.isSuccess) {
      navigate(from, { replace: true });
    }
  }, [mutation.isSuccess, from, navigate]);

  // gọi login mutation
  const handleSubmit = (values) => {
    login({
      username: values.username,
      password: values.password,
      expiresInMins: 30,
    });
  };

  return (
    <LayoutAuth title="Đăng nhập">
      <GenericForm
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={mutation.isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      />

      {mutation.isError && (
        <div className="mt-3 text-sm text-destructive">
          {mutation.error?.message ?? "Đăng nhập thất bại"}
        </div>
      )}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Bạn chưa có tài khoản?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
        <Link to="/" className="inline-flex items-center gap-1 hover:underline">
          <HomeIcon className="w-4 h-4" /> Trang chủ
        </Link>
      </div>
    </LayoutAuth>
  );
}
