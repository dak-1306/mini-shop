import React from "react";
import LayoutAuth from "@/components/layout/LayoutAuth";
import { Link, useNavigate } from "react-router-dom";
import { HomeIcon } from "lucide-react";
import GenericForm from "@/components/ui/form";
import useAuth from "@/hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { register, registerMutation } = useAuth();

  const fields = [
    {
      name: "name",
      label: "Họ và tên",
      placeholder: "Họ và tên",
      required: true,
      autoFocus: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Email",
      required: true,
      validate: (v) => {
        if (!v) return null;
        // simple email check
        return /\S+@\S+\.\S+/.test(v) ? null : "Email không hợp lệ";
      },
    },
    {
      name: "password",
      label: "Mật khẩu",
      type: "password",
      placeholder: "Mật khẩu (ít nhất 8 ký tự)",
      required: true,
      validate: (v) => {
        if (!v) return null;
        return v.length >= 8 ? null : "Mật khẩu phải có ít nhất 8 ký tự";
      },
    },
    {
      name: "confirmPassword",
      label: "Nhập lại mật khẩu",
      type: "password",
      placeholder: "Nhập lại mật khẩu",
      required: true,
      validate: (v, values) => {
        if (!v) return null;
        return v === values.password ? null : "Mật khẩu không khớp";
      },
    },
  ];

  // redirect khi đăng ký thành công (server có thể auto login hoặc chỉ tạo tài khoản)
  React.useEffect(() => {
    if (registerMutation.isSuccess) {
      navigate("/", { replace: true });
    }
  }, [registerMutation.isSuccess, navigate]);

  const handleSubmit = async (values) => {
    // gửi chỉ các trường backend yêu cầu: name, email, password
    await register({
      name: values.name,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <LayoutAuth title="Đăng ký">
      <GenericForm
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={registerMutation.isLoading ? "Đang đăng ký..." : "Đăng ký"}
        className="bg-white p-6 rounded-md shadow-md"
      />

      {registerMutation.isError && (
        <div className="mt-3 text-sm text-destructive">
          {registerMutation.error?.message ?? "Đăng ký thất bại"}
        </div>
      )}

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>
        </p>
        <Link to="/" className="inline-flex items-center gap-1 hover:underline">
          <HomeIcon className="w-4 h-4" /> Trang chủ
        </Link>
      </div>
    </LayoutAuth>
  );
}
