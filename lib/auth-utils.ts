import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Check if user is authenticated on the server side
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Redirect to login if user is not authenticated (use in server components)
 */
export async function requireAuth() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * API route handler that requires authentication
 */
export function withAuth(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    const session = await getAuthSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, session);
  };
}
