"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserAvatar({
  image,
  name,
}: {
  image: string;
  name: string;
}) {
  return (
    <Avatar>
      <AvatarImage src={image} referrerPolicy="no-referrer" />
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  );
}