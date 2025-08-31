import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  try {
    const authenticationParameters = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVAT_KEY as string,
      publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,
    });

    return Response.json({
      authenticationParameters,
      publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY,
    });
  } catch (error) {
    return Response.json(
      {
        error: "AUthentication for Imagekit Failed",
      },
      { status: 500 }
    );
  }
}
