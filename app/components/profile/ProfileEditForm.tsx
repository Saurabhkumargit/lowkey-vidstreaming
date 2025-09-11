"use client";

import React from "react";

type Props = {
  name: string;
  email: string;
  password: string;
  onChangeName: (v: string) => void;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onChangeAvatar: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export default function ProfileEditForm({
  name,
  email,
  password,
  onChangeName,
  onChangeEmail,
  onChangePassword,
  onChangeAvatar,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="p-4 border rounded space-y-3">
      <input
        type="text"
        placeholder="Full name"
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => onChangeEmail(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="password"
        placeholder="New password (optional)"
        value={password}
        onChange={(e) => onChangePassword(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChangeAvatar(e.target.files?.[0] || null)}
        className="w-full"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Save Changes
      </button>
    </form>
  );
}


