import { useState, useEffect } from "react";
import { Account } from "@/assets/icons/account_icon";
import { supabase } from "../supabaseClient";
import { getLinkedUsers } from "@/api/getLinkedUsers";

export default function UserList() {
  const [activeSection, setActiveSection] = useState<"profiles" | "myProfile">(
    "profiles"
  );
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [users, setUsers] = useState<
    { id: string; fullName: string; email: string }[]
  >([]);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    fullName: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const adminId = sessionData.session?.user.id;
      if (!adminId) return;

      setCurrentAdminId(adminId);

      const linkedUsers = await getLinkedUsers(adminId);
      setUsers(linkedUsers);
      setSelectedUser(linkedUsers[0] || null);
    };

    fetchUsers();
  }, []);
  <div className="bg-bgwhite my-10 flex flex-row mx-10 rounded-lg">
    <div className="p-6 border-r border-lightgrey">
      <h2 className="text-3xl font-normal mb-4">User profiles</h2>

      <div className="space-y-2">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`w-full flex items-center gap-3 px-8 py-3 rounded-lg text-2xl font-medium transition-colors ${
              selectedUser?.id === user.id
                ? "bg-primary-100 text-primary"
                : "text-darkgrey"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Account className="w-4 h-4" />
            </div>
            {user.fullName} 
          </button>
        ))}
        <div className="px-8 py-3 text-primary text-2xl">
          <button>Add new user +</button>
        </div>
      </div>
    </div>
  </div>;
}
