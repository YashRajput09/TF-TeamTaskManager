import React, { useEffect, useState } from "react";
import { Calendar, Clock, Users, Send, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";

const CreateMeeting = () => {
  const { profile } = useAuth();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    groupId: "",
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: ""
  });

  // Fetch user's groups
  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get(`/group/get-allUserGroup/${profile._id}`);
      setGroups(res.data || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.groupId || !form.title || !form.date || !form.startTime || !form.endTime) {
      return alert("Please fill all fields");
    }

    setLoading(true);

    const start = `${form.date}T${form.startTime}:00`;
    const end = `${form.date}T${form.endTime}:00`;

    try {
      const response = await axiosInstance.post("/api/calendar/group/meeting", {
        groupId: form.groupId,
        title: form.title,
        description: form.description,
        start,
        end
      });

      const data = response.data;

      if (data.success) {
        toast.success("Meeting created & Google Calendar invites sent!");
        // console.log("Meet link:", data.meetLink);
      } else {
        toast.error(data.message || "Failed to create meeting");
      }
    } catch (error) {
      console.error("Meeting creation failed:", error);
      toast.error("Meeting creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 shadow rounded-xl p-6 space-y-6">
      <h2 className="text-2xl font-bold flex items-center space-x-2 mb-4 text-gray-900 dark:text-white">
        <Calendar className="w-6 h-6 text-blue-500" />
        <span>Schedule Team Meeting</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Group dropdown */}
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            <Users className="inline w-4 h-4 mr-1" /> Select Group
          </label>
          <select
            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white"
            onChange={(e) => setForm({ ...form, groupId: e.target.value })}
          >
            <option value="">Choose Group</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Meeting Title
          </label>
          <input
            type="text"
            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white"
            placeholder="Example: Weekly Sync-up"
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Description (optional)
          </label>
          <textarea
            rows="3"
            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white"
            placeholder="Meeting agenda…"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          ></textarea>
        </div>

        {/* Date */}
        <div>
          <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              <Clock className="inline w-4 h-4 mr-1" /> Start Time
            </label>
            <input
              type="time"
              className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white"
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-gray-700 dark:text-gray-300">
              <Clock className="inline w-4 h-4 mr-1" /> End Time
            </label>
            <input
              type="time"
              className="w-full p-3 rounded-lg border dark:bg-gray-700 dark:text-white"
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>{loading ? "Scheduling..." : "Create Meeting"}</span>
        </button>
      </form>
    </div>
  );
};

export default CreateMeeting;
