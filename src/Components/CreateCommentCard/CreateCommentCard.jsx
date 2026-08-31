import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Image, Smile, Send, X } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";
import dataEmoji from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export default function CreateCommentCard({ postId, queryKey }) {
  const { userData } = useContext(AuthContext);
  const query = useQueryClient();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      content: "",
      image: "",
    },
  });

  const contentValue = watch("content") || "";
  const imageValue = watch("image");

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setValue("image", "");
    setImagePreview(null);
  };

  const handleSelectEmoji = (emoji) => {
    setValue("content", contentValue + emoji.native);
  };

  function createCommentFunc(formData) {
    return axios.post(
      `https://route-posts.routemisr.com/posts/${postId}/comments`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  }

  const { isPending, mutate } = useMutation({
    mutationFn: createCommentFunc,

    onSuccess: () => {
      reset();
      setImagePreview(null);
      setShowEmojiPicker(false);

      toast.success("comment Created Successfully");

      query.invalidateQueries({
        queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      });
    },

    onError: () => {
      toast.error("cannot Create Comment");
    },
  });

  function handleCreateComment(data) {
    if (!data.content && !data.image?.[0]) return;

    const formData = new FormData();

    if (data.content) {
      formData.append("content", data.content);
    }

    if (data.image?.[0]) {
      formData.append("image", data.image[0]);
    }

    mutate(formData);
  }

  const isFormValid = contentValue.trim() || imageValue?.[0];

  // نفس صورة الحساب المستخدمة في CreatePostCard
  const userAvatar =
    userData?.photo ||
    `https://ui-avatars.com/api/?name=${userData?.name || "User"}&background=random`;

  return (
    <div className="relative w-full my-3">
      <form onSubmit={handleSubmit(handleCreateComment)} className="w-full">
        <div className="flex items-start gap-3">
          {/* صورة صاحب الحساب */}
          <img
            src={userAvatar}
            alt={userData?.name || "User Avatar"}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0 border border-gray-200"
          />

          <div className="flex-1 bg-[#f0f2f5] rounded-2xl p-3 border border-gray-100 focus-within:border-gray-300 transition-colors">
            <textarea
              {...register("content")}
              rows={2}
              placeholder="Write a comment..."
              className="w-full bg-transparent border-none outline-none resize-none text-gray-800 text-sm placeholder-gray-500 focus:ring-0"
            />

            {imagePreview && (
              <div className="relative mb-2 inline-block max-w-[120px]">
                <img
                  src={imagePreview}
                  alt="Selected preview"
                  className="h-20 w-20 object-cover rounded-lg border border-gray-300"
                />

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-3 text-gray-500">
                <label
                  htmlFor={`imgFile-${postId}`}
                  className="cursor-pointer hover:text-gray-700 transition-colors"
                  title="Attach Image"
                >
                  <Image size={19} />
                </label>

                <input
                  {...register("image", {
                    onChange: handleImageChange,
                  })}
                  id={`imgFile-${postId}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="hover:text-gray-700 transition-colors"
                  title="Add Emoji"
                >
                  <Smile size={19} />
                </button>
              </div>

              <button
                disabled={isPending || !isFormValid}
                type="submit"
                className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
                  isFormValid && !isPending
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer"
                    : "bg-blue-500 text-white opacity-80 cursor-not-allowed"
                }`}
                title="Send"
              >
                {isPending ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4 animate-spin"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                ) : (
                  <Send size={15} className="translate-x-[-1px]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {showEmojiPicker && (
        <div className="absolute z-50 bottom-14 left-12 shadow-xl rounded-xl">
          <Picker
            data={dataEmoji}
            onEmojiSelect={handleSelectEmoji}
            theme="light"
            previewPosition="none"
          />
        </div>
      )}
    </div>
  );
}
