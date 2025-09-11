"use client";

import React from "react";

type Props = {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  editing: boolean;
  onToggleEditing: () => void;
};

export default function ProfileHeader({
  userName,
  userEmail,
  userImage,
  editing,
  onToggleEditing,
}: Props) {
  return (
    <div className="flex items-center gap-4">
      {userImage && (
        <img
          src={userImage}
          alt={userName || "User"}
          className="w-16 h-16 rounded-full border"
        />
      )}
      <div>
        <h1 className="text-2xl font-bold">{userName || ""}</h1>
        <p className="text-gray-600">{userEmail || ""}</p>
        <button
          onClick={onToggleEditing}
          className="mt-2 px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
        >
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}


