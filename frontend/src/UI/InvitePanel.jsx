import { useEffect, useState } from "react";
import axios from "../pages/utility/axiosInstance.js";
import { Users, Check, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../pages/utility/axiosInstance.js";

export default function InvitePanel() {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const res = await axios.get("/user/my-group/invites");
      console.log(res.data);

      setInvites(res.data.invites || []);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleRespond = async (id, action) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post(`/user/request/${id}/respond`, {
        action,
      });

      toast.success(
        action === "accept"
          ? "You joined the team 🎉"
          : "Invitation rejected ❌"
      );
      setLoading(false);
      // remove from UI
      setInvites((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      setLoading(false);
      toast.error("Action failed");
    }
  };

  if (loading) return null;

  if (invites.length === 0) return null;

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
      rounded-xl shadow-sm mt-4"
    >
      {/* <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
        <Users className="w-5 h-5 text-blue-500" />
        Team Invitation
      </h2> */}
      {console.log(invites)}
      <div className="space-y-3">
        {invites?.map((inv) => (
          <div
            key={inv._id}
            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 
              dark:border-gray-700 flex justify-between items-center"
          >
            <div>
              {/* <p className="font-medium text-gray-900 dark:text-white">
               Team: {inv.group.name}
              </p> */}
              <p className="text-sm text-gray-900 dark:text-white">
                Team: {inv?.group?.name}, Invited by: {inv?.invitedBy?.name}
              </p>

              {/* <div className="flex items-center gap-1 text-xs mt-1 text-gray-500">
                <Clock className="w-3 h-3" />
                {new Date(inv.createdAt).toLocaleString()}
              </div> */}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {/* ACCEPT BUTTON */}
              <button
                onClick={() => handleRespond(inv._id, "accept")}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 
    text-white rounded-lg text-sm"
              >
                <Check className="w-4 h-4" />
                {/* Text hidden on mobile, shown on md+ */}
                <span className="hidden md:inline">Accept</span>
              </button>

              {/* REJECT BUTTON */}
              <button
                onClick={() => handleRespond(inv._id, "reject")}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-900 hover:bg-red-800 
    text-white rounded-lg text-sm"
              >
                <X className="w-4 h-4" />
                {/* Text hidden on mobile, shown on md+ */}
                <span className="hidden md:inline">Reject</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
