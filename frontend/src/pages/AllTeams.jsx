import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import axiosInstance from "./utility/axiosInstance";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Clock, MoreVertical, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthProvider";

const AllTeams = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

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
              color:
                randomColors[Math.floor(Math.random() * randomColors.length)],
              activeTasks: active,
              completedTasks: completed,
              progress,
            };
          } catch (err) {
            // In case task fetch fails
            return {
              _id: group._id,
              name: group.name,
              members: group.members || [],
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
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.activeTasks}
                </p>
                <p className="text-xs text-gray-600">Active</p>
              </div>

              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.completedTasks}
                </p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>

              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.progress}%
                </p>
                <p className="text-xs text-gray-600">Progress</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold text-white">
                  {team.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${team.color}`}
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
