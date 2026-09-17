"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/data";

// "use client" is required because this component owns interactive state
// (useState) and responds to a click event. Note: since there's no backend
// yet, toggling here only affects this component's local state and will
// reset on page refresh — real persistence arrives in Week 5 (database)
// and Week 4 (API routes).
export default function TaskItem({
  task,
  groupId,
  canDelete,
}: {
  task: Task;
  groupId: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [done, setDone] = useState(task.done);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!canDelete) return;
    if (!window.confirm("Delete this task?")) return;

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/groups/${groupId}/tasks/${task.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete task.");
        return;
      }

      router.refresh();
    } catch {
      setError("Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-md border px-3 py-2">
      <input
        type="checkbox"
        checked={done}
        onChange={() => setDone(!done)}
        className="h-4 w-4"
      />
      <span className={done ? "line-through text-gray-400" : ""}>
        {task.title}
      </span>
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-auto text-sm text-red-600 hover:underline disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </li>
  );
}