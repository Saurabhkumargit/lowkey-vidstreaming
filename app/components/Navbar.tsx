import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-md mb-8">
      <div className="text-xl font-bold text-gray-900">
        Lowkey VidStreaming
      </div>
      <div>
        <Link href="/upload">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors">
            Upload
          </button>
        </Link>
      </div>
    </nav>
  );
}
