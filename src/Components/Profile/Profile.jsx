import React, { useContext, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AuthContext } from "../../Context/AuthContext";
import CommentCard from "../CommentCard/CommentCard";
import CreateCommentCard from "../CreateCommentCard/CreateCommentCard";
import Spinner from "../Spinner/Spinner";
import DropDownAction from "../DropDownAction/DropDownAction";

import {
  getSavedPostIds,
  isPostSaved,
  onBookmarksUpdated,
} from "../../utils/bookmarkStorage";
import { Helmet } from "react-helmet-async";

/* =========================================================
   1. مكون المنشور (PostCard)
========================================================= */
function PostCard({ post, isSinglePost = false, isBookmarked = false }) {
  const { userData } = useContext(AuthContext);
  const query = useQueryClient();

  const postId = post?._id
    ? String(post._id)
    : post?.id
      ? String(post.id)
      : null;

  const [isLikedLocal, setIsLikedLocal] = useState(false);
  const [sharesCount, setSharesCount] = useState(post?.sharesCount || 0);

  function getPostComment() {
    return axios.get(
      `https://route-posts.routemisr.com/posts/${postId}/comments`,
      {
        params: { limit: 10, sort: "-createdAt" },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
  }

  const { data: commentsData, isLoading: isCommentsLoading } = useQuery({
    queryKey: ["getPostComments", postId],
    queryFn: getPostComment,
    enabled: isSinglePost,
  });

  function likePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/like`,
      {},
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
  }

  const { mutate: handelLikePost, isPending: LikePending } = useMutation({
    mutationFn: likePost,
    onSuccess: (res) => {
      query.invalidateQueries({ queryKey: ["getPost"] });
      query.invalidateQueries({ queryKey: ["getProfilePost"] });
      query.invalidateQueries({ queryKey: ["getBookmarkPost"] });
      query.invalidateQueries({ queryKey: ["getSinglePost", postId] });
      setIsLikedLocal(res?.data?.data?.liked);
    },
  });

  const handleLikeClick = () => {
    setIsLikedLocal(!isLikedLocal);
    handelLikePost();
  };

  const handleShareClick = () => {
    setSharesCount((prev) => prev + 1);
  };

  if (isCommentsLoading) return <Spinner />;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full mx-auto mb-5 overflow-hidden">
      <Helmet>
        <title> Profile | Eltaranisi Posts </title>
      </Helmet>

      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3">
        <Link
          to={`/postDetails/${postId}`}
          className="flex items-center gap-3 min-w-0"
        >
          <img
            src={post.user?.photo || "https://ui-avatars.com/api/?name=User"}
            className="h-10 w-10 rounded-full object-cover shrink-0"
            alt={post.user?.name}
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm hover:underline truncate">
              {post.user?.name}
            </p>
            <p className="text-xs text-gray-500">
              @{post.user?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/postDetails/${postId}`}
            className="text-blue-600 text-xs font-medium hover:underline"
          >
            View details
          </Link>
          {postId && (
            <DropDownAction
              postId={postId}
              isOwner={userData?._id === post?.user?._id}
              isBookmarked={
                isBookmarked || post.bookmarked || isPostSaved(postId)
              }
            />
          )}
        </div>
      </header>

      {/* Body Text */}
      {post.body && (
        <p className="px-4 pb-3 text-gray-800 text-sm leading-relaxed whitespace-pre-line">
          {post.body}
        </p>
      )}

      {/* Image Container */}
      {post.image && (
        <div className="w-full bg-[#0a0f18] flex justify-center max-h-[550px] overflow-hidden">
          <img
            src={post.image}
            alt="post visual"
            className="w-auto h-auto max-h-[550px] object-contain"
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 10.133a1.5 1.5 0 00-.8.2z" />
            </svg>
            {post.likesCount || (isLikedLocal ? 1 : 0)} likes
          </span>

          <span
            className="flex items-center gap-1 hover:text-gray-700 cursor-pointer"
            onClick={handleShareClick}
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              ></path>
            </svg>
            {sharesCount} shares
          </span>

          <Link
            to={`/postDetails/${postId}`}
            className="flex items-center gap-1 hover:text-gray-700"
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
            {post.commentsCount ?? 0} comments
          </Link>
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          {post.createdAt
            ? new Date(post.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Aug 25, 12:02 AM"}
        </div>
      </div>

      {/* Dynamic Action Buttons */}
      <div className="flex items-center border-b border-gray-100 px-2 py-1 text-gray-600 text-sm font-semibold">
        <button
          onClick={handleLikeClick}
          disabled={LikePending}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
            isLikedLocal ? "text-blue-600" : ""
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={isLikedLocal ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"
            ></path>
          </svg>
          <span>Like</span>
        </button>

        <Link to={`/postDetails/${postId}`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
            <span>Comment</span>
          </button>
        </Link>

        <button
          onClick={handleShareClick}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            ></path>
          </svg>
          <span>Share</span>
        </button>
      </div>

      {/* Comments Area */}
      <div className="px-4 py-3">
        <CreateCommentCard
          postId={postId}
          queryKey={isSinglePost ? ["getPostComments"] : ["getPost"]}
        />

        {!isSinglePost && post.topComment && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
              Top comment
            </p>
            <CommentCard comment={post.topComment} />
          </div>
        )}

        {isSinglePost && (
          <div className="mt-3 flex flex-col gap-2">
            {commentsData?.data?.data?.comments?.map((comment) => (
              <CommentCard key={comment._id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   2. المكون الرئيسي للصفحة (Profile)
========================================================= */
export default function Profile() {
  const { userData } = useContext(AuthContext);
  const query = useQueryClient();

  const [coverUrl, setCoverUrl] = useState(() => {
    return (
      localStorage.getItem("coverUrl") || "/default-cover.jpg" // يرجى التأكد من وضع صورة بهذا الاسم داخل مجلد public لتجنب مشاكل الروابط الخارجية
    );
  });

  const [activeTab, setActiveTab] = useState("myPosts");
  const fileInputRef = useRef(null);

  const [profilePhotoUrl, setProfilePhotoUrl] = useState(() => {
    return localStorage.getItem("profilePhotoUrl") || null;
  });
  const profilePhotoInputRef = useRef(null);

  const handleViewCover = () => {
    if (coverUrl) {
      if (coverUrl.startsWith("data:image")) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <title>Cover Photo</title>
            <body style="margin: 0; background: #0e0e0e; display: flex; justify-content: center; align-items: center; height: 100vh;">
              <img src="${coverUrl}" style="max-width: 100%; max-height: 100vh; object-fit: contain;" alt="Cover" />
            </body>
          `);
        } else {
          alert("Please allow pop-ups to view the cover photo.");
        }
      } else {
        window.open(coverUrl, "_blank");
      }
    } else {
      alert("No cover image set!");
    }
  };

  const handleChangeCover = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // حماية سعة المتصفح: منع رفع صورة أكبر من 1.5 ميجا بايت
      if (file.size > 1.5 * 1024 * 1024) {
        alert(
          "حجم الصورة كبير جداً! يرجى اختيار صورة بحجم أقل من 1.5 ميجابايت ليتم حفظها بنجاح.",
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        try {
          setCoverUrl(base64Image);
          localStorage.setItem("coverUrl", base64Image);
        } catch (error) {
          console.error("Storage quota exceeded:", error);
          alert("تعذر حفظ الصورة في ذاكرة المتصفح بسبب كبر حجمها.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCover = () => {
    setCoverUrl(null);
    localStorage.removeItem("coverUrl");
  };

  const handleViewProfilePhoto = () => {
    const photo = profilePhotoUrl || userData?.photo;
    if (photo) {
      window.open(photo, "_blank");
    } else {
      alert("No profile photo set!");
    }
  };

  function uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append("photo", file);
    return axios.put(
      "https://route-posts.routemisr.com/users/upload-photo",
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
  }

  const { mutate: handleUploadProfilePhoto, isPending: isUploadingPhoto } =
    useMutation({
      mutationFn: uploadProfilePhoto,
      onSuccess: (res) => {
        const newPhotoUrl =
          res?.data?.data?.photo ||
          res?.data?.data?.user?.photo ||
          res?.data?.photo ||
          null;

        if (newPhotoUrl) {
          setProfilePhotoUrl(newPhotoUrl);
          localStorage.setItem("profilePhotoUrl", newPhotoUrl);
        }

        query.invalidateQueries({ queryKey: ["getProfilePost"] });
      },
      onError: () => {
        alert("Failed to update profile photo. Please try again.");
      },
    });

  const handleChangeProfilePhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadProfilePhoto(file);
    }
    e.target.value = "";
  };

  function getProfilePosts() {
    return axios.get(
      `https://route-posts.routemisr.com/users/${userData?._id}/posts`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      },
    );
  }

  const { data, isLoading: isProfileLoading } = useQuery({
    queryKey: ["getProfilePost"],
    queryFn: getProfilePosts,
    enabled: !!userData?._id,
  });

  const postsList = data?.data?.data?.posts || [];

  const savedPostIds = new Set(getSavedPostIds());
  const savedIdsArray = Array.from(savedPostIds).reverse();

  function getBookmarkedPostById(id) {
    return axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
  }

  const savedPostQueries = useQueries({
    queries: savedIdsArray.map((id) => ({
      queryKey: ["getBookmarkPost", id],
      queryFn: () => getBookmarkedPostById(id),
      enabled: activeTab === "saved" && !!id,
      retry: false,
    })),
  });

  const isSavedLoading =
    activeTab === "saved" && savedPostQueries.some((q) => q.isLoading);

  const savedPostsList = savedPostQueries
    .map((q) => {
      const d = q.data?.data;
      return d?.data?.post || d?.post || d?.data || null;
    })
    .filter(Boolean);

  useEffect(() => {
    const unsubscribe = onBookmarksUpdated(() => {
      query.invalidateQueries({ queryKey: ["getBookmarkPost"] });
    });
    return unsubscribe;
  }, [query]);

  const displayedPosts = activeTab === "myPosts" ? postsList : savedPostsList;
  const isLoading = activeTab === "myPosts" ? isProfileLoading : isSavedLoading;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 bg-[#f8fafc] min-h-screen">
      {/* -------------------- قسم الغلاف والبروفايل العلوى -------------------- */}
      <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="relative h-64 md:h-80 w-full bg-slate-900 flex items-center justify-center">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-sm font-medium">
              No Cover Photo
            </div>
          )}

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleViewCover}
              className="bg-black/40 hover:bg-black/60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/20 transition flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                ></path>
              </svg>
              View cover
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-black/40 hover:bg-black/60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/20 transition flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Change cover
            </button>

            <button
              onClick={handleRemoveCover}
              className="bg-black/40 hover:bg-black/60 text-white text-xs font-semibold px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/20 transition flex items-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              Remove
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleChangeCover}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 md:-mt-20 bg-white p-3 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative group shrink-0 w-28 h-28 md:w-32 md:h-32">
                <img
                  className="w-full h-full rounded-full border-4 border-white shadow-md object-cover bg-white"
                  src={
                    profilePhotoUrl ||
                    userData?.photo ||
                    "https://ui-avatars.com/api/?name=User"
                  }
                  alt="Profile Avatar"
                />

                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/35 transition-colors duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                  <button
                    type="button"
                    onClick={handleViewProfilePhoto}
                    title="View profile photo"
                    className="bg-white/90 hover:bg-white text-gray-800 w-8 h-8 rounded-full flex items-center justify-center shadow transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                      ></path>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    title="Update profile photo"
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white w-8 h-8 rounded-full flex items-center justify-center shadow transition"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      ></path>
                    </svg>
                  </button>
                </div>

                <input
                  type="file"
                  ref={profilePhotoInputRef}
                  onChange={handleChangeProfilePhoto}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="text-center sm:text-left mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                  {userData?.name || "User"}
                </h1>
                <p className="text-sm font-medium text-gray-500">
                  @{userData?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  Route Posts member
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center gap-3 mt-4 md:mt-0">
              <div className="border border-gray-100 rounded-2xl px-5 py-3 text-center min-w-[100px] bg-white shadow-xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  FOLLOWERS
                </p>
                <p className="text-xl font-bold text-gray-900">0</p>
              </div>
              <div className="border border-gray-100 rounded-2xl px-5 py-3 text-center min-w-[100px] bg-white shadow-xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  FOLLOWING
                </p>
                <p className="text-xl font-bold text-gray-900">0</p>
              </div>
              <div className="border border-gray-100 rounded-2xl px-5 py-3 text-center min-w-[100px] bg-white shadow-xs">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  BOOKMARKS
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {savedPostsList.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- قسم About والإحصائيات الجانبية -------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 text-base">About</h3>
          <div className="flex flex-col gap-3 text-sm text-gray-600 font-medium">
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
              <span>{userData?.email || "user@email.com"}</span>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
              <span>Active on Route Posts</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
              MY POSTS
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {postsList.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
              SAVED POSTS
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {savedPostsList.length}
            </p>
          </div>
        </div>
      </div>

      {/* -------------------- شريط التابات (Tabs Bar) -------------------- */}
      <div className="bg-white rounded-2xl p-2 mb-6 border border-gray-100 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("myPosts")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "myPosts"
                ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            My Posts
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "saved"
                ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              ></path>
            </svg>
            Saved
          </button>
        </div>

        <div className="pr-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
            {displayedPosts.length}
          </span>
        </div>
      </div>

      {/* -------------------- قائمة المنشورات -------------------- */}
      <div className="w-full">
        {isLoading ? (
          <Spinner />
        ) : displayedPosts.length > 0 ? (
          displayedPosts.map((post) => {
            const id = post._id
              ? String(post._id)
              : post.id
                ? String(post.id)
                : null;
            return (
              <PostCard
                key={id}
                post={post}
                isBookmarked={
                  activeTab === "saved" ||
                  savedPostIds.has(id) ||
                  post.bookmarked ||
                  false
                }
              />
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center text-gray-500 font-medium">
            {activeTab === "saved"
              ? "No saved posts yet."
              : "No posts published yet."}
          </div>
        )}
      </div>
    </div>
  );
}
