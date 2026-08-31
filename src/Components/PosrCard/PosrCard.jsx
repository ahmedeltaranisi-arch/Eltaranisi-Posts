import React, { useContext } from "react";
import CommentCard from "../CommentCard/CommentCard";
import { Link } from "react-router-dom";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CreateCommentCard from "../CreateCommentCard/CreateCommentCard";
import Spinner from "../Spinner/Spinner";
import DropDownAction from "../DropDownAction/DropDownAction";
import { AuthContext } from "../../Context/AuthContext";
import { isPostSaved } from "../../utils/bookmarkStorage";

export default function PostCard({ post, isSinglePost = false }) {
  // CALL ID
  const { userData } = useContext(AuthContext);
  // Display Rerander
  const query = useQueryClient();

  const postId = post?._id
    ? String(post._id)
    : post?.id
      ? String(post.id)
      : null;
  const isOwner = userData?._id === post?.user?._id;

  function getPostComment() {
    return axios.get(
      `https://route-posts.routemisr.com/posts/${postId}/comments`,
      {
        params: {
          limit: 10,
          sort: "-createdAt",
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Fixed extra space before Bearer
        },
      },
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ["getPostComments", postId],
    queryFn: getPostComment,
    enabled: isSinglePost,
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["getPost"] }); // Home
      query.invalidateQueries({ queryKey: ["getProfilePost"] }); // profile
      query.invalidateQueries({ queryKey: ["getSinglePost", postId] }); //post Details
    },
  });

  // Like post
  function likePost() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${postId}/like`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  }

  const {
    data: LikeDate,
    isPending: LikePending,
    mutate: handelLikePost,
  } = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      query.invalidateQueries({ queryKey: ["getPost"] }); // Home
      query.invalidateQueries({ queryKey: ["getProfilePost"] }); // profile
      query.invalidateQueries({ queryKey: ["getSinglePost", postId] }); //post Details
    },
  });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {/* Post Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-xl mx-auto mb-5 mt-3 overflow-hidden">
        <header className="flex justify-between items-start gap-3 px-4 pt-4 pb-3">
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
              <p className="font-semibold text-gray-900 text-[15px] leading-tight hover:underline truncate">
                {post.user?.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <span>{post.createdAt}</span>
                <span>·</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-3.5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.79-8.75a.75.75 0 0 0-1.06-1.06L9.5 10.44 8.03 8.97a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.76-3.78Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </Link>

          {postId && (
            <DropDownAction
              postId={postId}
              isOwner={isOwner}
              isBookmarked={isPostSaved(postId)}
            />
          )}
        </header>

        {post.body && (
          <p className="px-4 pb-3 text-gray-900 text-[15px] leading-relaxed whitespace-pre-line">
            {post.body}
          </p>
        )}
        {post.image && (
          <img
            src={post.image}
            alt={post.body}
            className="w-full max-h-[560px] object-cover"
          />
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between px-4 py-2 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="bg-blue-600 text-white rounded-full p-1 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-2.5"
              >
                <path d="M1 8.25a1.25 1.25 0 1 1 2.5 0v7.5a1.25 1.25 0 1 1-2.5 0v-7.5ZM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0 1 14 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 0 1-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 0 1-1.341-.317l-2.734-1.366A3 3 0 0 0 6.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 0 1 2.166-1.73c.432-.143.79-.483.921-.925A5.001 5.001 0 0 0 11 3Z" />
              </svg>
            </span>
            {post.likesCount <= 0 ? "0" : post.likesCount} likes
          </span>
          <Link to={`/postDetails/${postId}`} className="hover:underline">
            {post.sharesCount > 0 && <span>{post.sharesCount} shares · </span>}
            {post.commentsCount ?? 0} comments
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center border-t border-b border-gray-100 mx-2 text-gray-600 text-sm font-semibold">
          <button
            onClick={handelLikePost}
            disabled={LikePending}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${LikeDate?.data?.data?.liked ? "text-blue-600" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z"
              />
            </svg>
            <span>Like</span>
          </button>

          <Link to={`/postDetails/${postId}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                />
              </svg>
              <span>Comment</span>
            </button>
          </Link>

          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
              />
            </svg>
            <span>Share</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          {/* Create comment */}
          <CreateCommentCard
            postId={postId}
            queryKey={isSinglePost ? ["getPostComments", postId] : ["getPost"]}
          />

          {/* single Comment */}
          {!isSinglePost && post.topComment && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Top comment
              </p>
              <CommentCard
                comment={post.topComment}
                postId={postId}
                queryKey={["getPost"]}
              />
            </div>
          )}

          {/* all comments */}
          {isSinglePost && (
            <div className="mt-3 flex flex-col gap-2">
              {data?.data?.data?.comments?.map((comment) => {
                return (
                  <CommentCard
                    key={comment._id}
                    comment={comment}
                    postId={postId}
                    queryKey={["getPostComments", postId]}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
