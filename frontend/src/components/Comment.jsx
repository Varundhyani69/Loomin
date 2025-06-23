import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import React from 'react'

const Comment = ({ comment }) => {
  return (
    <div className='my-2'>
      <div className='flex gap-3 items-center'>
        <Avatar>
          <AvatarImage className='h-10 w-10 rounded-full' src={comment?.author?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h1 className='font-bold text-sm'>{comment?.author?.username} <span className='font-normal pl-1'>{comment?.text}</span></h1>
      </div>
    </div>
  )
}

export default Comment
