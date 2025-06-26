import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import React from 'react';

const Comment = ({ comment }) => {
  return (
    <div className="my-2">
      <div className="flex gap-3 items-center">
        <Avatar>
          <AvatarImage
            className="h-10 w-10 rounded-full object-cover"
            src={comment?.author?.profilePicture || ""}
            alt="author"
          />
          <AvatarFallback>
            {comment?.author?.username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-white">
          <span className="font-semibold">{comment?.author?.username}</span>{" "}
          <span className="text-gray-300">{comment?.text}</span>
        </p>
      </div>
    </div>
  );
};

export default Comment;
