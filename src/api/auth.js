import api from "./axios";

/**
 * Client-side auth helpers
 * - Gọi backend endpoints /api/auth/login và /api/auth/register
 * - Lưu accessToken (nếu server trả) vào localStorage dưới key 'app-auth' để dùng cho UI/khác
 * - Refresh token được server set qua cookie httpOnly (axios instance đã withCredentials: true)
 *
 * Ghi chú bảo mật:
 * - Không lưu refresh token plain trên client (cookie httpOnly tốt)
 * - Access token được lưu để hiển thị trạng thái đăng nhập / truyền header nếu cần
 */

/**
 * Đăng nhập
 * @param {{email:string, password:string, expiresInMins?: number}} params
 * @param {AbortSignal} [signal] - optional, react-query truyền vào để huỷ request
 * @returns {Promise<any>} res.data từ server (thường chứa accessToken và user)
 */
export async function login(
  { email, password, expiresInMins = 60 } = {},
  signal
) {
  if (!email || !password) throw new Error("email và password là bắt buộc");

  try {
    // Gọi API login (server sẽ set httpOnly refreshToken cookie)
    const res = await api.post(
      "/auth/login",
      { email, password, expiresInMins },
      { signal }
    );

    // NOTE: Bỏ phần lưu toàn bộ payload vào localStorage vì authStore sẽ persist user.
    // Trả về dữ liệu gốc để caller xử lý
    return res.data;
  } catch (error) {
    // Xử lý các lỗi phổ biến
    if (error.response?.status === 403) {
      throw new Error(
        "Tài khoản chưa được xác thực hoặc bị khóa. Vui lòng kiểm tra email và xác thực tài khoản."
      );
    }
    if (error.response?.status === 401) {
      throw new Error("Email hoặc mật khẩu không chính xác.");
    }
    if (error.response?.status === 429) {
      throw new Error(
        "Đã thử quá nhiều lần. Vui lòng chờ ít phút rồi thử lại."
      );
    }
    if (error.response?.status === 400) {
      const errorMsg =
        error.response?.data?.error || error.response?.data?.message;
      if (errorMsg) {
        throw new Error(errorMsg);
      }
    }
    // Lỗi khác
    throw new Error(
      error.response?.data?.message || error.message || "Đăng nhập thất bại"
    );
  }
}

/**
 * Đăng ký (register)
 * @param {{name:string, email:string, password:string, confirmPassword?:string}} params
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>} res.data từ server
 */
export async function register(
  { name, email, password, confirmPassword } = {},
  signal
) {
  if (!name || !email || !password)
    throw new Error("name, email, password là bắt buộc");

  try {
    // Gọi API register; gửi cả confirmPassword như backend yêu cầu
    const res = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
        confirmPassword: confirmPassword || password, // fallback nếu không có confirmPassword
      },
      { signal }
    );

    return res.data;
  } catch (error) {
    // Xử lý các lỗi phổ biến
    if (error.response?.status === 409) {
      throw new Error(
        "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập."
      );
    }
    if (error.response?.status === 400) {
      const errorMsg =
        error.response?.data?.error || error.response?.data?.message;
      if (errorMsg) {
        throw new Error(errorMsg);
      }
    }
    // Lỗi khác
    throw new Error(
      error.response?.data?.message || error.message || "Đăng ký thất bại"
    );
  }
}

/**
 * Logout
 * - Gọi endpoint POST /auth/logout để server clear & revoke refresh token (cookie httpOnly)
 * - Dù request thành công hay thất bại, vẫn xoá localStorage client và xoá header Authorization nếu có
 * @param {AbortSignal} [signal]
 * @returns {Promise<any>} res.data từ server nếu có
 */
export async function logout(signal) {
  try {
    // gửi request để server revoke refresh token và clear cookie
    const res = await api.post("/auth/logout", {}, { signal });
    try {
      localStorage.removeItem("app-auth");
    } catch (e) {
      // ignore localStorage errors
    }
    // nếu có gán Authorization trên axios thì xoá
    try {
      delete api.defaults.headers.common["Authorization"];
    } catch (e) {}
    return res.data;
  } catch (err) {
    // Nếu có lỗi mạng, vẫn clear local client state và không ném lỗi lên UI quá chi tiết
    try {
      localStorage.removeItem("app-auth");
    } catch (e) {}
    try {
      delete api.defaults.headers.common["Authorization"];
    } catch (e) {}
    // trả về object generic để caller biết đã thực hiện logout local
    return { message: "Logged out (local)", error: err?.message || null };
  }
}

export default {
  login,
  register,
  logout,
};
