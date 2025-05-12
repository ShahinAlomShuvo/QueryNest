import { Button } from "@heroui/button";
import { signOut } from "next-auth/react";

import { requireAuth } from "@/lib/auth-utils";

export default async function SettingsPage() {
  // This will redirect to login if not authenticated
  const session = await requireAuth();

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Profile Information
              </h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-[#8e24aa] flex items-center justify-center text-white text-xl font-bold">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-lg">{session.user.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <Button
                    color="danger"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
