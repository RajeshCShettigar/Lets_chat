import React from 'react'
  
const Avatar=({userId,username,online}) =>{
    const colors = ['bg-pink-300', 'bg-red-300',
                    'bg-green-300', 'bg-purple-300',
                    'bg-blue-300', 'bg-yellow-300',
                    'bg-orange-300', 'bg-amber-300', 'bg-fuchsia-300', 'bg-rose-300'];
    const userIdBase10 = parseInt(userId.substring(10), 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
    return (
      <div className={"w-8 h-8 relative rounded-full flex items-center "+color}>
        <div className="text-center w-full opacity-70">{username[0]}</div>
        {online && (
          <div className="absolute w-3 h-3 bg-green-500 bottom-0 right-0 rounded-full border border-blue-400 hover:shadow-md animate-ping-fast"></div>
        )}
        {!online && (
          <div className="absolute w-3 h-3 bg-gray-500 bottom-0 right-0 rounded-full border border-blue-400 hover:shadow-md"></div>
        )}
      </div>
    );
  }

export default Avatar;