import { useState, useEffect } from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function Footer() {
  const [lastCommitTime, setLastCommitTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastCommitTime = async () => {
      try {
        const response = await fetch(
          "https://api.github.com/repos/junaydb/task-manager/commits/main",
        );
        const data = await response.json();
        const commitDate = new Date(data.commit.committer.date);

        const formattedDate = commitDate.toLocaleDateString();
        const formattedTime = commitDate.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });

        setLastCommitTime(`${formattedDate} at ${formattedTime}`);
      } catch (error) {
        console.error("Failed to fetch last commit time:", error);
        setLastCommitTime(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLastCommitTime();
  }, []);

  return (
    <footer className="border-t bg-muted mt-auto">
      <div className="container mx-auto px-4 py-4 text-center">
        <p className="text-xs font-mono text-gray-400">
          {loading ? (
            <LoadingSpinner />
          ) : lastCommitTime ? (
            <span>Last updated on {lastCommitTime}.</span>
          ) : null}
          <span className="ml-2">
            <a
              href="https://github.com/junaydb/task-manager"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-gray-400 text-xs underline underline-offset-[2px] hover:no-underline"
            >
              Source
            </a>
            .
          </span>
        </p>
      </div>
    </footer>
  );
}
