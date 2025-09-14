import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  name?: string;
  email: string;
  password: string;
  avatar?: string;
  _id?: mongoose.Types.ObjectId;
  uploaded?: mongoose.Types.ObjectId[];
  liked?: mongoose.Types.ObjectId[];
  history?: { videoId: mongoose.Types.ObjectId; watchedAt: Date }[];
  following: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];

  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    uploaded: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    liked: [{ type: Schema.Types.ObjectId, ref: "Video" }],
    history: [
      {
        videoId: { type: Schema.Types.ObjectId, ref: "Video" },
        watchedAt: { type: Date, default: Date.now },
      },
    ],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = models?.User || model<IUser>("User", userSchema);

export default User;
