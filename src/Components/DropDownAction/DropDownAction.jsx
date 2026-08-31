import React, { useState, useRef, useEffect } from "react";
import { Dropdown, Button, Label, Modal, TextArea, Input } from "@heroui/react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { setPostSaved } from "../../utils/bookmarkStorage";

export default function DropDownAction({
  postId,
  isBookmarked = false,
  isOwner = true,
}) {
  const [isOpen, setisOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(isBookmarked);
  const query = useQueryClient();
  const navigate = useNavigate();

  let image = useRef(null);
  let body = useRef(null);

  // ✅ useState(isBookmarked) بياخد القيمة أول render بس وبعدين مبيتحدثش
  // لوحده لو الـ prop اتغيّر (لما الداتا تترفتش بعد invalidateQueries مثلاً).
  // الـ useEffect ده بيخلي isSaved يفضل متزامن مع الداتا الحقيقية الجاية من السيرفر.
  useEffect(() => {
    setIsSaved(isBookmarked);
  }, [isBookmarked]);

  // 1. Delete Post API
  function deletPost() {
    return axios.delete(`https://route-posts.routemisr.com/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  const { mutate: handelDeletePost } = useMutation({
    mutationFn: deletPost,
    onSuccess: () => {
      toast.success("Post deleted successfully");
      query.invalidateQueries({ queryKey: ["getPost"] });
      query.invalidateQueries({ queryKey: ["getProfilePost"] });
      navigate("/home");
    },
    onError: () => {
      toast.error("Cannot delete post");
    },
  });

  // 2. Save / Bookmark Post API
  function toggleSavePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/bookmark`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  }

  const { mutate: handleToggleSave, isPending: isSavePending } = useMutation({
    mutationFn: toggleSavePost,
    onSuccess: (res) => {
      // ✅ الإصلاح الأساسي: بدل ما نفترض إن التوجل نجح في الاتجاه اللي احنا
      // متخيلينه محليًا (!isSaved) — واللي ممكن يبقى غلط لو السيرفر أصلاً
      // شايف المنشور ده متسجل عنده save=true من قبل (مثلاً من جلسة/جهاز
      // تاني) بينما localStorage الجهاز الحالي معندوش أي تسجيل له —
      // بنقرأ القيمة الحقيقية الراجعة من رد السيرفر لو موجودة، بنفس
      // الأسلوب المستخدم بالظبط مع زرار الـ Like (res.data.data.liked)
      // في PosrCard.jsx و Profile.jsx.
      const serverValue =
        res?.data?.data?.bookmarked ??
        res?.data?.data?.saved ??
        res?.data?.data?.isSaved ??
        res?.data?.bookmarked ??
        res?.data?.saved;

      const nextSaved =
        typeof serverValue === "boolean" ? serverValue : !isSaved;

      toast.success(
        nextSaved ? "Post saved successfully" : "Post unsaved successfully",
      );
      setIsSaved(nextSaved);

      // ✅ السيرفر مفهوش endpoint يرجّع قائمة المحفوظات (GET /posts/bookmarks
      // مش موجود)، فبنسجل حالة الحفظ محليًا في localStorage عشان تاب "Saved"
      // يقدر يفلتر عليها.
      setPostSaved(postId, nextSaved);

      // بعد ما السيرفر يأكد إن الحفظ نجح، بنعمل invalidate لكل الكاشات
      // اللي فيها حالة الحفظ ظاهرة، وده اللي بيخلي تاب "Saved" يتحدث فورًا
      query.invalidateQueries({ queryKey: ["getPost"] });
      query.invalidateQueries({ queryKey: ["getProfilePost"] });
      query.invalidateQueries({ queryKey: ["getBookmarkPost"] });
      query.invalidateQueries({ queryKey: ["getSinglePost", postId] });
    },
    onError: (err) => {
      // ✅ قبل كده أي فشل في الطلب (مثلاً postId غلط/undefined فبيبعت
      // لـ /posts/undefined/bookmark) كان بيرجع رسالة عامة من غير أي أثر
      // واضح ليه، فكان صعب نلاحظ إن المنشورات "القديمة" بالذات هي اللي
      // بتفشل. دلوقتي بنطبع تفاصيل الخطأ الحقيقي في الـ console عشان
      // تقدر تشوف بالظبط السبب (400/404/غيره) لو المشكلة استمرت.
      console.error(
        "[DropDownAction] toggleSavePost failed for postId:",
        postId,
        err?.response?.status,
        err?.response?.data || err?.message,
      );
      toast.error(
        err?.response?.data?.message || "Failed to update bookmark status",
      );
    },
  });

  function handleSaveClick() {
    // ✅ حماية: لو postId مش موجود (مثلاً منشور جاله شكل بيانات مختلف
    // من endpoint تاني) منبعتش طلب فاضي لـ /posts/undefined/bookmark —
    // ده كان بالظبط سبب إن الحفظ "يفشل بصمت" من غير أي توست ولا تحديث
    // للزرار على بعض المنشورات بالذات.
    if (!postId) {
      console.error("[DropDownAction] Missing postId — cannot toggle save.");
      toast.error("Cannot save this post right now");
      return;
    }
    if (!isSavePending) handleToggleSave();
  }

  // 3. Edit Post API
  function prepareData() {
    let formData = new FormData();
    if (body.current?.value) {
      formData.append("body", body.current.value);
    }
    if (image.current?.files[0]) {
      formData.append("image", image.current.files[0]);
    }
    return formData;
  }

  const [uploadedImg, setuploadedImg] = useState(null);

  function hanleImagePreview(e) {
    if (e.target.files[0]) {
      let imgSrc = URL.createObjectURL(e.target.files[0]);
      setuploadedImg(imgSrc);
    }
  }

  function handleCloseImg() {
    setuploadedImg(null);
    if (image.current) image.current.value = null;
  }

  function updatePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}`,
      prepareData(),
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  }

  const { mutate: handelUpdatePost } = useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      toast.success("Post updated successfully");
      setisOpen(false);
      query.invalidateQueries({ queryKey: ["getPost"] });
      query.invalidateQueries({ queryKey: ["getProfilePost"] });
      query.invalidateQueries({ queryKey: ["getSinglePost", postId] });
    },
  });

  return (
    <>
      <Dropdown>
        {/* زر الثلاث نقاط */}
        <Button
          aria-label="Menu"
          variant="light"
          className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </Button>

        <Dropdown.Popover>
          <Dropdown.Menu
            onAction={(key) => {
              if (key === "save-post") {
                handleSaveClick();
              } else if (key === "edit-file" && isOwner) {
                setisOpen(true);
              } else if (key === "delete-file" && isOwner) {
                handelDeletePost();
              }
            }}
          >
            {/* خيار الحفظ / إلغاء الحفظ */}
            <Dropdown.Item id="save-post" textValue="Save post">
              <div className="flex items-center gap-2.5 py-0.5 text-slate-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isSaved ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                  />
                </svg>
                <Label className="text-sm font-medium">
                  {isSaved ? "Unsave post" : "Save post"}
                </Label>
              </div>
            </Dropdown.Item>

            {/* خيار التعديل — للمالك بس */}
            {isOwner && (
              <Dropdown.Item id="edit-file" textValue="Edit post">
                <div className="flex items-center gap-2.5 py-0.5 text-slate-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                  <Label className="text-sm font-medium">Edit post</Label>
                </div>
              </Dropdown.Item>
            )}

            {/* خيار الحذف — للمالك بس */}
            {isOwner && (
              <Dropdown.Item
                id="delete-file"
                textValue="Delete post"
                variant="danger"
              >
                <div className="flex items-center gap-2.5 py-0.5 text-rose-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  <Label className="text-sm font-medium">Delete post</Label>
                </div>
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      {/* Modal التعديل */}
      <Modal isOpen={isOpen} onOpenChange={setisOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Edit Post</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex gap-4 items-end">
                  <TextArea
                    ref={body}
                    aria-label="Quick project update"
                    className="h-32 w-100 mb-4"
                    placeholder="What is on your mind ....?"
                  />
                  <label htmlFor={postId} className="cursor-pointer">
                    <Input
                      ref={image}
                      onChange={hanleImagePreview}
                      type="file"
                      id={postId}
                      hidden
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 mb-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </label>
                </div>
                {uploadedImg && (
                  <div className="relative">
                    <img
                      src={uploadedImg}
                      alt="Preview"
                      className="rounded-lg max-h-48 w-full object-cover"
                    />
                    <svg
                      onClick={handleCloseImg}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 absolute top-2 right-2 bg-white rounded-full p-1 cursor-pointer shadow"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  className="w-full"
                  slot="close"
                  onClick={handelUpdatePost}
                >
                  Update Post
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
