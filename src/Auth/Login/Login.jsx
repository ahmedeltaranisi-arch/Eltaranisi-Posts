import React, { useContext, useState } from "react";
import { Button } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { loginschema } from "../../schema/loginSchema";
import { AuthContext } from "../../Context/AuthContext";
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

export default function Login() {
  let { setuserToken } = useContext(AuthContext);
  let navigate = useNavigate();

  const [apiError, setapiError] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  // حالة لإظهار/إخفاء الباسورد
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(loginschema),
  });

  function submitForm(userData) {
    setisLoading(true);
    axios
      .post("https://route-posts.routemisr.com/users/signin", userData)
      .then((response) => {
        if (response.data.message === "signed in successfully") {
          setuserToken(response.data.data.token);
          localStorage.setItem("token", response.data.data.token);
          navigate("/home");
        }
      })
      .catch((error) => {
        setapiError(error.response?.data?.message || "Something went wrong");
      })
      .finally(() => {
        setisLoading(false);
      });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Log in to Eltaranisi Posts
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Log in and continue your social journey.
        </p>
      </div>

      <form onSubmit={handleSubmit(submitForm)} autoComplete="on">
        <div className="flex flex-col gap-4">
          {/* Email / Username Input */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineUser className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("email")}
                type="text"
                placeholder="Email or username"
                autoComplete="username"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
            {formState.errors.email && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.email?.message}
              </p>
            )}
          </div>

          {/* Password Input مع أيقونة العين */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineLockClosed className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"} // تبديل النوع هنا
                placeholder="Password"
                autoComplete="current-password"
                className="w-full pl-11 pr-11 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
              />
              {/* زر أيقونة العين */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-xl text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            {formState.errors.password && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.password?.message}
              </p>
            )}
          </div>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-sm text-center py-2 my-3 rounded-xl">
            {apiError}
          </div>
        )}

        <Button
          type="submit"
          isDisabled={isLoading}
          className="mt-6 w-full bg-[#002984] text-white font-semibold py-3 rounded-xl hover:bg-blue-900 transition-all text-base"
        >
          {isLoading ? "Loading..." : "Log In"}
        </Button>

        <div className="text-center mt-4">
          <a
            href="#"
            className="text-sm text-[#002984] font-medium hover:underline"
          >
            Forgot password?
          </a>
        </div>
      </form>
    </div>
  );
}
