import Link from "next/link";

interface HistoryItemProps {
  id: string;
  title: string;
  thumbnailUrl: string;
  watchedAt: string;
}

export default function WatchHistoryItem({
  id,
  title,
  thumbnailUrl,
  watchedAt,
}: HistoryItemProps) {
  return (
    <li className="border rounded shadow p-2">
      <Link href={`/video/${id}`}>
        <div className="cursor-pointer">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-40 object-cover rounded"
          />
          <p className="mt-2 font-medium truncate">{title}</p>
          <p className="text-xs text-gray-500">
            Watched on {new Date(watchedAt).toLocaleDateString()}
          </p>
        </div>
      </Link>
    </li>
  );
}
