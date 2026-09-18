import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { getGroupById } from "@/lib/data";
import { authOptions } from "@/lib/auth";
import DeleteGroupButton from "@/components/DeleteGroupButton";
import NewTaskForm from "@/components/NewTaskForm";
import TaskItem from "@/components/TaskItem";

export default async function GroupDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [group, session] = await Promise.all([
    getGroupById(params.id),
    getServerSession(authOptions),
  ]);

  // Next.js's built-in way to render the closest not-found.tsx (or a
  // default 404) when a dynamic route doesn't match real data.
  if (!group) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          <p className="text-gray-500">
            {group.subject} · {group.memberCount} members · Created by{" "}
            {group.owner.name}
          </p>
        </div>
        {session && !group.isDefault && <DeleteGroupButton groupId={group.id} />}
      </div>

      <h2 className="mt-8 text-lg font-semibold">Tasks</h2>
      {session && !group.isDefault && (
        <div className="mt-3">
          <NewTaskForm groupId={group.id} />
        </div>
      )}
      <ul className="mt-3 flex flex-col gap-2">
        {group.tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            groupId={group.id}
            canDelete={Boolean(session) && !group.isDefault}
          />
        ))}
      </ul>
    </div>
  );
}
