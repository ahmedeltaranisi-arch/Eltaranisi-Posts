import React, { useContext, useState } from "react";
import { Button } from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { changePasswordSchema } from "../schema/changePasswordSchema";
import { AuthContext } from "../Context/AuthContext";
import {
  HiOutlineKey,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";
import Navbar from "../Components/Navbar/Navbar";
import { Helmet } from "react-helmet-async";

export default function Settings() {
  let { setuserToken } = useContext(AuthContext);

  const [apiError, setapiError] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      rePassword: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(changePasswordSchema),
  });

  function submitForm(userData) {
    // إرسال الحقول المطلوبة فقط للسيرفر وتجاهل rePassword
    const payload = {
      password: userData.currentPassword,
      newPassword: userData.newPassword,
    };

    setapiError(null);
    setisLoading(true);

    axios
      .patch(
        "https://route-posts.routemisr.com/users/change-password",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )
      .then((response) => {
        const newToken = response?.data?.data?.token;
        if (newToken) {
          setuserToken(newToken);
          localStorage.setItem("token", newToken);
        }
        toast.success(
          response?.data?.message || "Password updated successfully",
        );
        reset();
      })
      .catch((error) => {
        setapiError(error.response?.data?.message || "Something went wrong");
      })
      .finally(() => {
        setisLoading(false);
      });
  }

  return (
    <div className="mt-12 max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
       <Helmet>
                 <title>  Change Password | Eltaranisi Posts </title>
             </Helmet>
      <div className="mb-6 flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <HiOutlineKey className="text-xl text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Keep your account secure by using a strong password.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(submitForm)} autoComplete="off">
        <div className="flex flex-col gap-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Current password
            </label>
            <div className="relative flex items-center">
              <input
                {...register("currentPassword")}
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 pr-11 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 text-xl text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={
                  showCurrentPassword ? "Hide password" : "Show password"
                }
              >
                {showCurrentPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            {formState.errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.currentPassword?.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              New password
            </label>
            <div className="relative flex items-center">
              <input
                {...register("newPassword")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-11 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-xl text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            {formState.errors.newPassword ? (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.newPassword?.message}
              </p>
            ) : (
              <p className="text-blue-600 text-xs mt-1 px-1">
                At least 8 characters with uppercase, lowercase, number, and
                special character.
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Confirm new password
            </label>
            <div className="relative flex items-center">
              <input
                {...register("rePassword")}
                type={showRePassword ? "text" : "password"}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                className="w-full px-4 py-2.5 pr-11 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowRePassword(!showRePassword)}
                className="absolute right-3.5 text-xl text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={showRePassword ? "Hide password" : "Show password"}
              >
                {showRePassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            {formState.errors.rePassword && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.rePassword?.message}
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
          className="mt-6 w-full bg-[#5B9DF5] text-white font-semibold py-3 rounded-full hover:bg-blue-500 transition-all text-base"
        >
          {isLoading ? "Updating..." : "Update password"}
        </Button>
      </form>
    </div>
  );
}
