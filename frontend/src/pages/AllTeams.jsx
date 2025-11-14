import React, { useState } from "react";
import Card from "../components/Card";
import { CheckCircle, Clock, MoreVertical, TrendingUp } from "lucide-react";

let initialTeams = [
  {
    id: 1,
    name: "Design Team",
    ownerUsername: "Vishal Patidar", // <-- added
    color: "bg-purple-500",
    members: [
      { id: "u1", name: "Alice Johnson", role: "Lead Designer" },
      { id: "u2", name: "Bob Smith", role: "UI Designer" },
      { id: "u3", name: "Vishal Patidar", role: "UX Researcher" },
      { id: "u4", name: "Karen Lee", role: "Illustrator" },
      { id: "u5", name: "Luke Adams", role: "Motion" },
    ],
    tasks: [
      {
        id: "t1",
        title: "Homepage redesign",
        assignee: "Alice Johnson",
        status: "In Progress",
        priority: "High",
      },
      {
        id: "t2",
        title: "Mobile mockups",
        assignee: "Vishal Patidar",
        status: "Pending",
        priority: "Medium",
      },
      {
        id: "t3",
        title: "Icon set v2",
        assignee: "Bob Smith",
        status: "Completed",
        priority: "Low",
      },
    ],
    activeTasks: 12,
    completedTasks: 45,
    progress: 78,
  },
  {
    id: 2,
    name: "Dev Team",
    ownerUsername: "Vishal Patidar", // <-- added (you can change owner as needed)
    color: "bg-blue-500",
    members: [
      { id: "u6", name: "John Doe", role: "Backend" },
      { id: "u7", name: "Jane Smith", role: "Frontend" },
      { id: "u3", name: "Vishal Patidar", role: "Full Stack" },
      { id: "u8", name: "Priya Shah", role: "QA" },
      { id: "u9", name: "Ravi Kumar", role: "DevOps" },
      { id: "u10", name: "Emily Davis", role: "Frontend" },
      { id: "u11", name: "Tom Brown", role: "Mobile" },
      { id: "u12", name: "Sara Ali", role: "SRE" },
    ],
    tasks: [
      {
        id: "t4",
        title: "API integration",
        assignee: "John Doe",
        status: "Completed",
        priority: "High",
      },
      {
        id: "t5",
        title: "Bug fix #234",
        assignee: "Jane Smith",
        status: "In Progress",
        priority: "Critical",
      },
      {
        id: "t6",
        title: "Auth refactor",
        assignee: "Vishal Patidar",
        status: "In Progress",
        priority: "High",
      },
    ],
    activeTasks: 23,
    completedTasks: 127,
    progress: 65,
  },
  {
    id: 3,
    name: "Marketing",
    ownerUsername: "Sarah Williams", // <-- added (owner is someone else)
    color: "bg-green-500",
    members: [
      { id: "u13", name: "Sarah Williams", role: "Manager" },
      { id: "u14", name: "Mike Johnson", role: "Content" },
      { id: "u15", name: "Isha Gupta", role: "SEO" },
      { id: "u3", name: "Vishal Patidar", role: "Analyst" },
    ],
    tasks: [
      {
        id: "t7",
        title: "Q4 Campaign",
        assignee: "Sarah Williams",
        status: "Completed",
        priority: "Medium",
      },
      {
        id: "t8",
        title: "Social media plan",
        assignee: "Mike Johnson",
        status: "In Progress",
        priority: "Low",
      },
      {
        id: "t9",
        title: "Newsletter template",
        assignee: "Vishal Patidar",
        status: "Pending",
        priority: "Low",
      },
    ],
    activeTasks: 8,
    completedTasks: 32,
    progress: 82,
  },
  {
    id: 4,
    name: "Product",
    ownerUsername: "Emily Davis", // <-- added
    color: "bg-orange-500",
    members: [
      { id: "u16", name: "Emily Davis", role: "PM" },
      { id: "u17", name: "Tom Brown", role: "PM" },
      { id: "u18", name: "Arjun Mehta", role: "BA" },
      { id: "u3", name: "Vishal Patidar", role: "PM" },
      { id: "u19", name: "Wei Chen", role: "Analyst" },
      { id: "u20", name: "Olivia Park", role: "Research" },
    ],
    tasks: [
      {
        id: "t10",
        title: "Feature roadmap",
        assignee: "Tom Brown",
        status: "In Progress",
        priority: "High",
      },
      {
        id: "t11",
        title: "User research",
        assignee: "Emily Davis",
        status: "Completed",
        priority: "Medium",
      },
      {
        id: "t12",
        title: "Spec v1.2",
        assignee: "Vishal Patidar",
        status: "Pending",
        priority: "High",
      },
    ],
    activeTasks: 15,
    completedTasks: 89,
    progress: 71,
  },
];

const currentUser = "Vishal Patidar";

const AllTeams = () => {

  const [teams,setTeams]=useState(initialTeams)

  console.log(teams)
  return (
    // All Teams Grid (overview)
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {teams?.map((team) => (
        <Card key={team.id} hover className="cursor-pointer">
          {console.log(team)}
          {/* ✅ MOVED onClick TO INNER WRAPPER */}
          <div onClick={() => handleSelect(team.id)} className="space-y-4">
            {/* Team Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${team.color} rounded-xl`} />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {team.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {team?.members?.length} members
                  </p>
                </div>
              </div>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()} // prevent opening detail when clicking kebab
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.activeTasks}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Active
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.completedTasks}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
              Completed
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {team.progress}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Progress
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Overall Progress
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {team.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${team.color} transition-all duration-500`}
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
