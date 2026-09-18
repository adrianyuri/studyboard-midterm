import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGroupById, createTask } from "@/lib/data";
import { createTaskSchema } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const group = await getGroupById(params.id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group.tasks);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsedResponse = createTaskSchema.safeParse(body);

  if (!parsedResponse.success) {
    return NextResponse.json(
      { error: parsedResponse.error.issues[0]?.message },
      { status: 400 }
    );
  }

  const group = await getGroupById(params.id);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.isDefault) {
    return NextResponse.json(
      { error: "Tasks cannot be added to default groups" },
      { status: 403 }
    );
  }

  const newTask = await createTask(params.id, parsedResponse.data.title);
  return NextResponse.json(newTask, { status: 201 });
}