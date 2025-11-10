'use client'

import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useUser, useClerk } from "@clerk/nextjs";
import { getAvatarName } from "@/lib/getAvatarName";

const UserAvatar = () => {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar className="w-10 h-10 drop-shadow cursor-pointer">
          <AvatarImage src={user?.imageUrl} />
          <AvatarFallback>
            {getAvatarName(user?.fullName || user?.username || "User")}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent>
        <p className="font-semibold py-2">{user?.fullName || user?.username}</p>
        <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
        <div className="p-[0.5px] bg-gray-200 my-2"></div>

        <Button
          variant={"destructive"}
          className="w-full mt-2 cursor-pointer"
          onClick={() => signOut()}
        >
          Logout
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default UserAvatar;
