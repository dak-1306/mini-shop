import React from "react";
import LayoutAuth from "@/components/layout/LayoutAuth";
import { useNavigate } from "react-router-dom";
import GenericForm from "@/components/ui/form";
// import useAuthStore from "@/store/authStore";

export default function Login() {
  const navigate = useNavigate();
  //   const login = useAuthStore((s) => s.login);

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

  //   const handleSubmit = async (values) => {
  //     const res = await login({
  //       username: values.username,
  //       password: values.password,
  //     });
  //     if (res.ok) {
  //       navigate("/");
  //     } else {
  //       // simple alert; replace with UI toast
  //       alert(res.error || "Đăng nhập thất bại");
  //     }
  //   };

  return (
    <LayoutAuth title="Đăng nhập">
      <GenericForm
        className="bg-white p-6 rounded-md shadow-md"
        fields={fields}
        // onSubmit={handleSubmit}
        submitLabel="Đăng nhập"
      />
    </LayoutAuth>
  );
}
