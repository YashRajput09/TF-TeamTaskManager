import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import axiosInstance from "./utility/axiosInstance";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, MoreVertical, TrendingUp, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import DeleteButton from "../UI/reusable-components/DeleteButton";
import toast from "react-hot-toast";

const AllTeams = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const randomColors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];

  // --------------------------
  // FETCH GROUPS + TASK STATS
  // --------------------------
  const fetchGroups = async () => {
    try {
      if (!profile?._id) return;

      const res = await axiosInstance.get(
        `/group/get-allUserGroup/${profile._id}`
      );
      
      const groups = res?.data || [];

      const updated = await Promise.all(
        groups.map(async (group) => {
          try {
            const taskRes = await axiosInstance.get(
              `/task/getAll-task/${group._id}`
            );

            const tasks = taskRes?.data?.groupTasks || [];
            
            let active = 0;
            let completed = 0;

            tasks.forEach((t) => {
              if (t.status === "In-progress") active++;
              if (t.status === "Completed") completed++;
            });

            const progress =
              tasks.length === 0
                ? 0
                : Math.round((completed / tasks.length) * 100);

            return {
              _id: group._id,
              name: group.name,
              members: group.members || [],
              owner: group.owner || group.createdBy, // Add owner field
              color:
                randomColors[Math.floor(Math.random() * randomColors.length)],
              activeTasks: active,
              completedTasks: completed,
              progress,
            };
          } catch (err) {
            return {
              _id: group._id,
              name: group.name,
              members: group.members || [],
              owner: group.owner || group.createdBy,
              color:
                randomColors[Math.floor(Math.random() * randomColors.length)],
              activeTasks: 0,
              completedTasks: 0,
              progress: 0,
            };
          }
        })
      );

      setTeams(updated);
    } catch (err) {
      console.log("Fetch error:", err);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?._id) fetchGroups();
  }, [profile]);

  const handleSelect = (id) => {
    navigate(`/teams/${id}`);
  };

  // Check if user is owner
  const isOwner = (team) => {
    return team.owner === profile._id || team.owner?._id === profile._id;
  };

  // --------------------------
  // LOADING STATE
  // --------------------------
  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500">Loading groups...</p>
    );
  }

  // --------------------------
  // EMPTY STATE
  // --------------------------
  if (teams.length === 0) {
    return (
      <p className="text-center py-10 text-gray-500">
        No teams found.
      </p>
    );
  }

  // --------------------------
  // TEAM GRID
  // --------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {teams.map((team) => (
        <Card key={team._id} hover className="cursor-pointer">
          <div onClick={() => handleSelect(team._id)} className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${team.color} rounded-xl`} />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {team.members?.length || 0} members
                  </p>
                </div>
              </div>

              {/* Three Dot Menu - Only for owner */}
              {isOwner(team) && (
                <div className="relative">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === team._id ? null : team._id);
                    }}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdown === team._id && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(null);
                        }}
                      />
                      
                      <div 
                        className="absolute right-8 top-0 z-20 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DeleteButton
                          onDelete={async () => {
                            await axiosInstance.delete(`/group/delete-team/${team._id}`);
                            toast.success("Group deleted successfully");
                            setOpenDropdown(null);
                            fetchGroups(); // Refresh the list
                          }}
                          title="Delete Group"
                          message="Are you sure you want to delete this group? All tasks and data associated with this group will be permanently removed."
                          itemName={team.name}
                          confirmText="Delete Group"
                          variant="icon"
                          size="sm"
                          className="w-full justify-start px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.activeTasks}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
              </div>

              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.completedTasks}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
              </div>

              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.progress}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {team.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${team.color} transition-all duration-300`}
                  style={{ width: `${team.progress}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AllTeams;