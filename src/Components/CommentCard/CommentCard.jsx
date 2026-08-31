import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { MoreHorizontal, Pencil, Trash2, AlertTriangle, X } from "lucide-react";
import { AuthContext } from "../../Context/AuthContext";

// تحويل التاريخ لصيغة مختصرة زي "1m" / "2h" / "3d" بدل التاريخ الكامل
function timeAgo(dateString) {
  if (!dateString) return "";

  const diffSeconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );

  if (diffSeconds < 60) return "now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;

  return new Date(dateString).toLocaleDateString("en-GB");
}

// ✅ postId و queryKey بيتبعتوا لـ CommentCard بالظبط زي ما بيتبعتوا
// لـ CreateCommentCard (نفس الـ interface)، عشان نقدر نعمل update/delete
// على الكومنت ونعمل invalidate للـ query الصح بعدها.
export default function CommentCard({ comment, postId, queryKey }) {
  const { userData } = useContext(AuthContext);
  const query = useQueryClient();

  const [imgError, setImgError] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment?.content || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // لايك بسيط على الكومنت (اختياري) — نفس الـ endpoint الموثق في الـ API
  const [isLikedLocal, setIsLikedLocal] = useState(Boolean(comment?.liked));
  const [likesCount, setLikesCount] = useState(
    comment?.likesCount ?? comment?.likes?.length ?? 0,
  );

  const menuRef = useRef(null);

  // قفل المنيو لما اليوزر يدوس بره الـ dropdown
  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  if (!comment) return null;

  const commentId = comment?._id || comment?.id;
  const authorName = comment?.commentCreator?.name || "User";
  const authorPhoto = comment?.commentCreator?.photo;
  const authorId = comment?.commentCreator?._id || comment?.commentCreator?.id;
  const isOwner =
    Boolean(authorId) && authorId === (userData?._id || userData?.id);
  const authorUsername =
    comment?.commentCreator?.username ||
    authorName.toLowerCase().replace(/\s+/g, "");

  // صورة افتراضية ملونة بأسماء المستخدمين
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0D8ABC&color=fff`;

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const invalidateComments = () => {
    query.invalidateQueries({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    });
  };

  // -------------------- Edit --------------------
  function updateCommentFunc(content) {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
      { content },
      { headers: authHeaders },
    );
  }

  const { mutate: updateComment, isPending: isSaving } = useMutation({
    mutationFn: updateCommentFunc,
    onSuccess: () => {
      toast.success("Comment updated successfully");
      setIsEditing(false);
      invalidateComments();
    },
    onError: () => {
      toast.error("Couldn't update comment");
    },
  });

  function handleStartEdit() {
    setEditValue(comment?.content || "");
    setIsEditing(true);
    setIsMenuOpen(false);
  }

  function handleCancelEdit() {
    setEditValue(comment?.content || "");
    setIsEditing(false);
  }

  function handleSaveEdit() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === comment?.content) {
      setIsEditing(false);
      return;
    }
    updateComment(trimmed);
  }

  // -------------------- Delete --------------------
  function deleteCommentFunc() {
    return axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
      { headers: authHeaders },
    );
  }

  const { mutate: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: deleteCommentFunc,
    onSuccess: () => {
      toast.success("Comment deleted");
      setShowDeleteConfirm(false);
      invalidateComments();
    },
    onError: () => {
      toast.error("Couldn't delete comment");
      setShowDeleteConfirm(false);
    },
  });

  // -------------------- Like (toggle بسيط) --------------------
  function likeCommentFunc() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}/like`,
      {},
      { headers: authHeaders },
    );
  }

  const { mutate: toggleLike } = useMutation({
    mutationFn: likeCommentFunc,
    onError: () => {
      // رجّع الحالة زي ما كانت لو السيرفر رفض
      setIsLikedLocal((prev) => !prev);
      setLikesCount((prev) => (isLikedLocal ? prev + 1 : prev - 1));
    },
  });

  function handleLikeClick() {
    setIsLikedLocal((prev) => !prev);
    setLikesCount((prev) => (isLikedLocal ? Math.max(prev - 1, 0) : prev + 1));
    toggleLike();
  }

  return (
    <div className="flex items-start gap-2.5 my-2">
      <img
        src={!imgError && authorPhoto ? authorPhoto : fallbackAvatar}
        alt={authorName}
        className="h-8 w-8 rounded-full object-cover shrink-0 border border-gray-200"
        onError={() => {
          // لما السيرفر يرفض رابط Cloudflare R2 بيفعل ده فوراً
          setImgError(true);
        }}
      />

      <div className="flex-1 min-w-0 relative">
        {/* هيدر: اسم المعلّق + يوزرنيم + وقت النشر، مع منيو الإدارة على اليمين */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-1.5 min-w-0">
            <span className="font-bold text-sm text-gray-900">
              {authorName}
            </span>
            <span className="text-xs text-gray-400 truncate">
              @{authorUsername} · {timeAgo(comment?.createdAt)}
            </span>
          </div>

          {/* منيو التعديل/الحذف — تظهر بس لصاحب الكومنت */}
          {isOwner && !isEditing && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20">
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* المحتوى: نص عادي، أو فورم التعديل لو في وضع Edit */}
        {isEditing ? (
          <div className="flex items-center gap-2 mt-1.5">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="bg-white border border-gray-300 text-gray-700 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          comment?.content && (
            <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-line break-words">
              {comment.content}
            </p>
          )
        )}

        {/* صف الإجراءات: وقت النشر / لايك / رد */}
        {!isEditing && (
          <div className="flex items-center gap-2.5 mt-1.5 px-0.5 text-[11px] text-gray-400">
            <span>{timeAgo(comment?.createdAt)}</span>
            <button
              type="button"
              onClick={handleLikeClick}
              className={`font-semibold hover:underline transition-colors ${
                isLikedLocal ? "text-blue-600" : "text-gray-500"
              }`}
            >
              Like ({likesCount})
            </button>
            <span className="text-gray-500">Reply</span>
          </div>
        )}
      </div>

      {/* مودال تأكيد الحذف */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">
                Confirm action
              </h3>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-start gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Delete this comment?
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  This comment will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteComment()}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete comment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
