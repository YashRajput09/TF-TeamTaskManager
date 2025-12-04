import { useEffect, useState } from "react";
import { Search, UserPlus, Clock, X, Users } from "lucide-react";
import axiosInstance from "../../pages/utility/axiosInstance";
import toast from "react-hot-toast";

export default function AddMemberSearchModal({
  groupId,
  existingMembers,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(""); // none | member | invited
  const [loading, setLoading] = useState(false);
  const [loadingSend,setLoadingSend]=useState(false)
  const [requestStatus,setRequestStatus]=useState('');

  // 🔍 LIVE SEARCH WHEN USER TYPES
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) handleSearch();
      else {
        setUser(null);
        setStatus("");
      }
    }, 400); // WAIT 400ms after user stops typing

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      console.log(groupId)
      const res = await axiosInstance.get(`/user/api/search/${groupId}?search=${query}`);
      console.log("Search result:", res.data);

      const foundUser = Array.isArray(res.data) ? res.data : [];

      // FIX: Safe check + string comparison for ObjectIds
      const alreadyMember =
        Array.isArray(existingMembers) &&
        existingMembers.some((m) => String(m._id) === String(foundUser._id));

      setUser(foundUser);
      setStatus(alreadyMember ? "member" : "none");
    } catch (err) {
      console.log(err);
      setUser([]);
      setStatus("none");
    }

    setLoading(false);
  };

  const sendInvite = async (userId) => {
    try {
      
      if (!userId) return;
      setLoadingSend(true)
      const res = await axiosInstance.post(`/user/${groupId}/invite`, {
        userId: userId,
      });
      
      if (res.data.success) setStatus("invited");
      toast.success("Invitation sent")
    } catch (error) {
      console.log(error);
      toast.error("Invitation failed")
      
    }finally{
      setLoadingSend(false)
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-50 w-full max-w-lg bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Member
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X />
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search email or phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 text-gray-900 dark:text-white"
          />
          {/* <button className="px-4 bg-blue-600 text-white rounded-xl">
            <Search className="w-4 h-4" />
          </button> */}
        </div>

        {/* LOADING */}
        {loading && <p className="text-gray-500 text-sm">Searching…</p>}

        {/* 🔥 SHOW EXISTING MEMBERS */}
        {/* <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Users className="w-4 h-4" /> Already in this team
          </h3>

          <div className="mt-2 max-h-52 overflow-y-auto sidebar-scroll space-y-1">
            {existingMembers?.map((m) => (
              <div
                key={m?._id}
                className=" flex overflow-x-hidden gap-3 bg-gray-100 dark:bg-gray-800 px-2 py-2 rounded-md text-gray-800 dark:text-gray-200"
              >
                <div className="">
                  <img
                    src={m.profileImage.url || "/default-avatar.png"}
                    className="min-w-12 h-12 rounded-full border"
                  />
                </div>
                <div className="">
                  <p className="text-sm">{m?.name}</p>
                  <p className="text-xs">{m?.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* SEARCH RESULT */}
        {user?.length > 0 && (
          <div className="max-h-60 overflow-y-auto sidebar-scroll space-y-1 mt-4">
            {user.map((user) => {
              const alreadyMember =
                Array.isArray(existingMembers) &&
                existingMembers.some((m) => String(m._id) === String(user._id));

              return (
                <div
                  key={user._id}
                  className=" flex justify-between p-2 border rounded-xl bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.profileImage?.url || "/default-avatar.png"}
                      className="w-10 h-10 rounded-full border"
                    />

                    <div>
                      <h3 className="text-sm font-semibold">{user?.name}</h3>
                      <p className="text-xm">{user?.email}</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    {alreadyMember ? (
                      <p className="text-green-600 font-extrabold mr-4">
                         ✓
                      </p>             
                    ) : user?.status==='pending' ? (
                      <p>
                        Pending
                      </p>
                      ) : (
                      <button
                        onClick={() => sendInvite(user?._id)}
                        className="px-4 py-2 text-white rounded-xl flex items-center gap-2"
                      >
                       {!loadingSend ? <UserPlus className="w-4 h-4" /> : "Sending..."} 
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
