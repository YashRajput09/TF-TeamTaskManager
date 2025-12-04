import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "../components/Card";
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  MoreVertical,
  UserPlus,
  UserMinus,
  ListChecks,
  Search,
  ArrowLeft,
  User,
  Trash2,
} from "lucide-react";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";
import ConfirmDialog from "../UI/reusable-components/ConfirmDialog";
import DeleteButton from "../UI/reusable-components/DeleteButton";
import AddMemberSearchModal from "../UI/reusable-components/AddMember";

// Helper to read ?team= from URL
const useQuery = () => new URLSearchParams(useLocation().search);

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

const Teams = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [teams, setTeams] = useState(initialTeams);
  const [teamData, setTeamData] = useState();
  const [selectedId, setSelectedId] = useState(
    () => Number(query.get("team")) || null
  );

  const [visibleTasks, setVisibleTasks] = useState();
  // UI state for simple modals/forms
  const [showCreate, setShowCreate] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [alluser, setAlluser] = useState();
  const [loading, setLoading] = useState();
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "",
    cancelText: "Cancel",
    onConfirm: () => {},
  });

  const { profile } = useAuth();
  // NEW: create task modal state
  const [showCreateTask, setShowCreateTask] = useState(false); // <-- added

  const [searchMember, setSearchMember] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  const { teamId } = useParams();
  useEffect(() => {
    const getSingleGroup = async () => {
      try {
        const { data } = await axiosInstance.get(
          `/group/get-single-group/${teamId}`
        );

        setTeamData(data);
      } catch (error) {
        console.log(error);
      }
    };
    const getGroupTask = async () => {
      try {
        const { data } = await axiosInstance.get(`/task/getAll-task/${teamId}`);
        setVisibleTasks(data?.groupTasks);
      } catch (error) {
        console.log(error);
      }
    };

    const getAllUsers = async () => {
      try {
        const { data } = await axiosInstance.get(`/user/get-all-users`);
        setAlluser(data);
      } catch (error) {
        console.log(error);
      }
    };

    getAllUsers();
    getSingleGroup();
    getGroupTask();
  }, [showAdd, showRemove, confirm]);

  useEffect(() => {
    const id = Number(query.get("team")) || null;
    setSelectedId(id);
  }, [query]);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedId) || null,
    [teams, selectedId]
  );

  // owner check — either ownerUsername matches or role 'Owner' in members list (for newly created groups)
  const isOwner = (team) => team?.createdBy?._id === profile?._id; // <-- added

  const handleSelect = (id) => {
    setSelectedId(id);
    navigate(`/teams?team=${id}`);
  };

  // Create Group
  const createGroup = (name) => {
    const nextId = Math.max(...teams.map((t) => t.id)) + 1;
    const newTeam = {
      id: nextId,
      name,
      ownerUsername: currentUser, // <-- added to new group
      color: "bg-gray-500",
      members: [{ id: "u3", name: currentUser, role: "Owner" }],
      tasks: [],
      activeTasks: 0,
      completedTasks: 0,
      progress: 0,
    };
    setTeams((prev) => [...prev, newTeam]);
    handleSelect(nextId);
  };

  // Add Member
  const addMember = (memberName, role = "Member") => {
    if (!selectedTeam) return;
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTeam.id) return t;
        const newMember = { id: `u${Date.now()}`, name: memberName, role };
        return { ...t, members: [...t.members, newMember] };
      })
    );
  };

  // Remove Member
  const removeMember = (memberName) => {
    if (!selectedTeam) return;
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTeam.id) return t;
        return {
          ...t,
          members: t.members.filter((m) => m.name !== memberName),
        };
      })
    );
  };

  const filteredMembers = useMemo(() => {
    if (!selectedTeam) return [];
    return selectedTeam.members.filter((m) =>
      m.name.toLowerCase().includes(searchMember.toLowerCase())
    );
  }, [selectedTeam, searchMember]);

  //Assigned to me code
  const visibleTask = useMemo(() => {
    if (!teamData) return [];
    const base = onlyMine
      ? visibleTasks?.filter((task) => task.assignedTo?._id === profile?._id)
      : visibleTasks;
    return base;
  }, [teamData, visibleTasks, profile, onlyMine]);

  const handleDelete = async (taskId) => {
    // const isConfirm = await handleConfirmation();

    // if (!isConfirm) return;
    try {
      const res = await axiosInstance.delete(`/task/delete-task/${taskId}`, {
        withCredentials: true,
      });

      toast.success("Task deleted successfully");
      // Refresh UI or remove task from state
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete task");
    }
  };

  // TO open dialogbox
  const openConfirm = ({ title, message, confirmText, onConfirm }) => {
    setConfirm({
      open: true,
      title,
      message,
      confirmText,
      cancelText: "Cancel",
      onConfirm,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-3">
          {!selectedTeam && (
            <button
              onClick={() => navigate("/teams")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Back to all teams"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <div>
            <h1 className="flex gap-3 text-xl items-center md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {teamData?.name}
              {isOwner(teamData) && (
                <div className="rounded-md overflow-hidden">
                  <DeleteButton
                    onDelete={async () => {
                      await axiosInstance.delete(
                        `/group/delete-group/${teamId}`
                      );
                      toast.success("Group deleted successfully");
                      navigate("/dashboard");
                      // setOpenDropdown(null);
                      // fetchGroups(); // Refresh the list
                    }}
                    title="Delete Group"
                    message="Are you sure you want to delete this group? All tasks and data associated with this group will be permanently removed."
                    itemName={teamData?.name}
                    confirmText="Delete Group"
                    variant="icon"
                    size="sm"
                    className="w-full justify-start px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none"
                  />
                </div>
              )}
            </h1>
            <div className="flex flex-col md:flex-row gap-1 items-start md:items-center">
              <span className=" flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <User className="w-4 h-4" />
                <i> Admin: </i> {teamData?.createdBy?.name}
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                |{" "}
                {selectedTeam
                  ? "Team overview, members, and tasks"
                  : "Manage your teams and track their progress"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
          {isOwner(teamData) && (
            <button
              onClick={() => navigate(`/create-task`, { state: { teamData } })}
              className="px-3 py-1 md:py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 
                 text-white shadow-lg hover:bg-white/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          )}

          {isOwner(teamData) && (
            <>
              {/* <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-1 md:py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 
                   text-white shadow-lg hover:bg-white/20 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button> */}

              <button
                onClick={() => setShowAdd(true)}
                className="px-3 py-1 md:py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 
     text-white shadow-lg hover:bg-white/20 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add
              </button>

              <button
                onClick={() => setShowRemove(true)}
                className="px-3 py-1 md:py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 
                   text-white shadow-lg hover:bg-white/20 transition flex items-center gap-2"
              >
                <UserMinus className="w-4 h-4" />
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {selectedTeam ? (
        // All Teams Grid (overview)
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map((team) => (
            <Card key={team.id} hover className="cursor-pointer">
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
                        {team.members.length} members
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
      ) : (
        // Team Detail
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Members */}
          <Card className="lg:col-span-1">
            <div className="flex gap-2 items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Members
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute right-4 top-2.5 text-gray-500" />
                <input
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Search member..."
                  className="pl-2 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 text-sm outline-none"
                />
              </div>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {teamData?.members?.map((m) => (
                <li
                  key={m.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {/* <div className={`w-8 h-8 rounded-lg ${selectedTeam.color}`} /> */}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {m.name}{" "}
                        {teamData?.createdBy?._id === m?._id ? (
                          <i>(Admin)</i>
                        ) : (
                          ""
                        )}{" "}
                        {m._id === profile._id ? <i>(You)</i> : ""}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {m.role}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              {teamData?.members?.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                  No members found.
                </p>
              )}
            </ul>
            <div
              className="absolute right-4 bottom-4 z-20 bg-red-900/60 hover:bg-red-800/40 text-red-500 rounded-lg shadow-lg py-1 "
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteButton
                onDelete={async () => {
                  await axiosInstance.delete(
                   `group/${teamId}/self-leave`
                  );
                  toast.success("Group leaved Successfully");
                  navigate("/dashboard");
                
                }}
                title="Leave Team"
                message="Are you sure you want to leave this team? All tasks and data associated with this group will be permanently removed."
                itemName={teamData?.name}
                confirmText="Leave"
                variant="icon"
                size="sm"
                className="w-full justify-start px-4  text-left text-sm text-red-400 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none"
              />
            </div>
            {/* <button onClick={()=>{

              }} className=" px-4 py-0.5  ml-auto rounded-md bg-red-900/70 hover:bg-red-800/50 text-red-500">
                Leave Team
              </button> */}
          </Card>

          {/* Tasks */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5" /> Tasks
              </h2>
              <div className="flex items-center gap-3">
                {!isOwner(teamData) && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={onlyMine}
                      onChange={(e) => setOnlyMine(e.target.checked)}
                    />
                    Assigned to me
                  </label>
                )}
                {/* <DeleteButton
                          onDelete={async () => {
                            await axiosInstance.delete(`/group/delete-team/${teams._id}`);
                            toast.success("Group deleted successfully");
                            // setOpenDropdown(null);
                            // fetchGroups(); // Refresh the list
                          }}
                          title="Delete Group"
                          message="Are you sure you want to delete this group? All tasks and data associated with this group will be permanently removed."
                          itemName={teams.name}
                          confirmText="Delete Group"
                          variant="icon"
                          size="sm"
                          className="w-full justify-start px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-none"
                        /> */}
              </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 mb-6">
              {/* STATUS FILTER */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
                  <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Status:{" "}
                    <span className="text-blue-600 dark:text-blue-400">
                      {statusFilter === "all" ? "All" : statusFilter}
                    </span>
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "all",
                      "Assigned",
                      "Pending",
                      "In-progress",
                      "Completed",
                    ].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          statusFilter === s
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        {s === "all" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PRIORITY FILTER */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all shadow-sm hover:shadow-md">
                  <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                    />
                  </svg>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Priority:{" "}
                    <span className="text-purple-600 dark:text-purple-400">
                      {priorityFilter === "all" ? "All" : priorityFilter}
                    </span>
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2">
                  <div className="flex flex-wrap gap-2">
                    {["all", "High", "Medium", "Low"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPriorityFilter(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          priorityFilter === p
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        {p === "all" ? "All" : p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Assignee
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTask
                    ?.filter((task) => {
                      // status filter
                      if (
                        statusFilter !== "all" &&
                        task.status !== statusFilter
                      )
                        return false;

                      // priority filter
                      if (
                        priorityFilter !== "all" &&
                        task.priority !== priorityFilter
                      )
                        return false;

                      return true;
                    })
                    .reverse()
                    .map((task) => (
                      <tr
                        key={task?._id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50  rounded-md transition-colors"
                      >
                        <td
                          onClick={() => navigate(`/tasks/${task?._id}`)}
                          className="py-3 px-4 text-sm text-gray-900 hover:underline cursor-pointer dark:text-white"
                        >
                          {task.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                          {task?.assignedTo?.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              task.status === "Completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : task.status === "In-progress"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {task?.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              task.priority === "Critical"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : task.priority === "High"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                : task.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            }`}
                          >
                            {task?.priority}
                          </span>
                        </td>
                        {isOwner(teamData) && (
                          <td>
                            <Trash2
                              // onClick={() => handleDelete(task?._id)}
                              onClick={() => {
                                openConfirm({
                                  title: "Delete Task?",
                                  message:
                                    "Are you sure you want to delete this task?",
                                  confirmText: "Delete",
                                  onConfirm: () => handleDelete(task._id),
                                });
                              }}
                              className="w-4 mr-2 text-red-700 opacity-75 cursor-pointer hover:opacity-100 hover:text-600"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
              {visibleTasks?.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-6 text-center">
                  No tasks to show.
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Simple inline modals */}
      {showCreate && (
        <InlineModal title="Create Group" onClose={() => setShowCreate(false)}>
          <CreateGroupForm
            onCreate={(name) => {
              createGroup(name);
              setShowCreate(false);
            }}
            onCancel={() => setShowCreate(false)}
          />
        </InlineModal>
      )}

      {/* {showAdd && teamData && (
        <InlineModal
          title={`Add Member to ${teamData?.name}`}
          onClose={() => setShowAdd(false)}
        >
          <AddMemberForm
            onAdd={{ alluser: alluser, group: teamData }}
            onCancel={() => setShowAdd(false)}
          />
        </InlineModal>
      )} */}

      {showAdd && (
        <AddMemberSearchModal
          groupId={teamId}
          existingMembers={teamData?.members}
          onClose={() => setShowAdd(false)}
        />
      )}

      {showRemove && teamData && (
        <InlineModal
          title={`Remove Member from ${teamData.name}`}
          onClose={() => setShowRemove(false)}
        >
          <RemoveMemberForm
            onAdd={{ groupUsers: teamData?.members, groupId: teamId }}
            onCancel={() => setShowRemove(false)}
          />
        </InlineModal>
      )}

      {/* NEW: Create Task modal (owner only) */}
      {showCreateTask && selectedTeam && (
        <InlineModal
          title={`Create Task in ${selectedTeam.name}`}
          onClose={() => setShowCreateTask(false)}
        >
          <CreateTaskForm
            members={selectedTeam.members}
            onCreate={(payload) => {
              // push new task into selected team
              setTeams((prev) =>
                prev.map((t) => {
                  if (t.id !== selectedTeam.id) return t;
                  const newTask = {
                    id: `t${Date.now()}`,
                    title: payload.title,
                    assignee: payload.assigneeName, // keep same model as existing tasks
                    status: "Pending",
                    priority: payload.priority,
                    createdBy: currentUser,
                  };
                  return {
                    ...t,
                    tasks: [newTask, ...t.tasks],
                    activeTasks: t.activeTasks + 1,
                  };
                })
              );
              setShowCreateTask(false);
            }}
            onCancel={() => setShowCreateTask(false)}
          />
        </InlineModal>
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={() => {
          confirm.onConfirm(); // run the action
          setConfirm({ ...confirm, open: false }); // close dialog
        }}
        onCancel={() => setConfirm({ ...confirm, open: false })}
      />
    </div>
  );
};

/* ---------- Tiny inline modal + forms (no external deps) ---------- */
const InlineModal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/40" onClick={onClose} />
    <div className="relative z-50 w-full max-w-md p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

const CreateGroupForm = ({ onCreate, onCancel }) => {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onCreate(name.trim());
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          Group Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 outline-none"
          placeholder="e.g., Data Team"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create
        </button>
      </div>
    </form>
  );
};

const AddMemberForm = ({ onAdd, onCancel }) => {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [role, setRole] = useState("Member");
  const [loading, setLoading] = useState(false);

  // ✅ Handle checkbox selection
  const handleCheckboxChange = (userId) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // remove if already selected
          : [...prev, userId] // add new id
    );
  };
  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      if (selectedMembers.length === 0) {
        setError("Please select at least one user");
        return;
      }
      const { data } = await axiosInstance.post(
        `/group/add-member/${onAdd?.group?._id}`,
        { membersId: selectedMembers }
      );
      // alert("User Added successsfully");
      setLoading(false);
      onCancel();
      toast.success("User Added");
    } catch (error) {
      console.log(error);
      setLoading(false);
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          Select Members
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-700/30">
          {onAdd?.alluser?.length > 0 ? (
            onAdd?.alluser
              ?.filter((user) => user?._id !== onAdd?.group?.createdBy._id)
              ?.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => handleCheckboxChange(user._id)}
                    className="accent-blue-600"
                  />
                  <span>{user.name || user.email}</span>
                </label>
              ))
          ) : (
            <p className="text-sm text-gray-500">No users available</p>
          )}
        </div>
        <button
          disabled={loading}
          className=" px-4 py-2 w-full justify-center hover:bg-green-800 items-center bg-green-700 mt-4 rounded-md "
          type="submit"
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
};

const RemoveMemberForm = ({ onAdd, onCancel }) => {
  const [selectedMembers, setSelectedMembers] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle checkbox selection
  const handleCheckboxChange = (userId) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // remove if already selected
          : [...prev, userId] // add new id
    );
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);
      if (!selectedMembers) {
        setError("Please select at least one user");
        return;
      }
      const { data } = await axiosInstance.post(
        `/group/remove-member/${onAdd?.groupId}`,
        { memberId: selectedMembers }
      );
      setLoading(false);
      toast.error("User Removed !!");
      onCancel();
    } catch (error) {
      console.log(error);
      if (error?.response?.data?.message)
        toast.error(error?.response?.data?.message);
      onCancel();
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          Select Members
        </label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50 dark:bg-gray-700/30">
          {onAdd?.groupUsers?.length > 0 ? (
            onAdd.groupUsers.map((user) => (
              <label
                key={user._id}
                className="flex items-center gap-2 cursor-pointer text-gray-800 dark:text-gray-200"
              >
                <input
                  type="checkbox"
                  checked={selectedMembers === user._id}
                  onChange={() => setSelectedMembers(user._id)}
                  className="accent-blue-600"
                />
                <span>{user.name || user.email}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No users available</p>
          )}
        </div>
        <button
          disabled={loading}
          className=" px-4 py-2 w-full justify-center hover:bg-red-900 items-center bg-red-700 mt-4 rounded-md "
          type="submit"
        >
          {loading ? "Removing... " : "Remove"}
        </button>
      </div>
    </form>
  );
};
// NEW: Create Task form (modal content)
const CreateTaskForm = ({ members, onCreate, onCancel }) => {
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("Medium");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !assigneeId) return;
    const assignee = members.find((m) => m.id === assigneeId);
    onCreate({
      title: title.trim(),
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      priority,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 outline-none"
          placeholder="e.g., Implement forgot password flow"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          Assign to
        </label>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="w-full rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 outline-none"
        >
          <option value="">Choose member…</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 outline-none"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Create
        </button>
      </div>
    </form>
  );
};

export default Teams;
