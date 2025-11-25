import React from "react";
import LayoutAuth from "@/components/layout/LayoutAuth";
import { Link, useNavigate } from "react-router-dom";
import { HomeIcon } from "lucide-react";
import GenericForm from "@/components/ui/form";
// import useAuthStore from "@/store/authStore";

export default function Register() {
  const navigate = useNavigate();
  // const register = useAuthStore((s) => s.register);
  const fields = [
    {
      name: "username",
      label: "Username",
      placeholder: "Tên đăng nhập",
      required: true,
      autoFocus: true,
    },
    { name: "name", label: "Họ và tên", placeholder: "Họ tên", required: true },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Email",
      required: true,
    },
    {
      name: "password",
      label: "Mật khẩu",
      type: "password",
      placeholder: "Mật khẩu",
      required: true,
    },
  ];

  //   const handleSubmit = async (values) => {
  //     const res = await register(values);
  //     if (res.ok) {
  //       navigate("/");
  //     } else {
  //       alert(res.error || "Đăng ký thất bại");
  //     }
  //   };

  return (
    <LayoutAuth title="Đăng ký">
      <GenericForm
        className="bg-white p-6 rounded-md shadow-md"
        fields={fields}
        // onSubmit={handleSubmit}
        submitLabel="Đăng ký"
      />
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>
          Đã có tài khoản?{" "}
          <Link to="/login" className="hover:underline">
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
