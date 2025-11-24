import React from "react";
import LayoutAuth from "@/components/layout/LayoutAuth";
import { useNavigate } from "react-router-dom";
import GenericForm from "@/components/ui/form";
import useAuth from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
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

  // gọi login mutation
  const handleSubmit = (values) => {
    login({
      username: values.username,
      password: values.password,
      expiresInMins: 30,
    });
  };

  // redirect khi login thành công
  React.useEffect(() => {
    if (mutation.isSuccess) {
      navigate("/", { replace: true });
    }
  }, [mutation.isSuccess, navigate]);

  return (
    <LayoutAuth title="Đăng nhập">
      <div className="bg-white p-6 rounded-md shadow-md">
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
      </div>
    </LayoutAuth>
  );
}
