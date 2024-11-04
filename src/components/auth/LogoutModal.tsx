"use client";

import React, { Dispatch, SetStateAction } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { signOut } from 'next-auth/react';
  
export default function LogoutModal({open , setOpen}:{open:boolean , setOpen:Dispatch<SetStateAction<boolean>>}) {

    const handleLogout =() => {
        signOut({
            callbackUrl:"/",
            redirect:true
        })
    }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
  <AlertDialogTrigger>Open</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader> 
      <AlertDialogTitle>Do you want to logout?</AlertDialogTitle>
      <AlertDialogDescription>
        This will remove your current session and will log you out from the website.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleLogout}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

  )
}
