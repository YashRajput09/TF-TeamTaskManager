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
} from "lucide-react";
import axiosInstance from "./utility/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthProvider";

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

        console.log(data);
        setTeamData(data);
      } catch (error) {
        console.log(error);
      }
    };
    const getGroupTask = async () => {
      try {
        const { data } = await axiosInstance.get(`/task/getAll-task/${teamId}`);
        console.log(data?.groupTasks);

        setVisibleTasks(data?.groupTasks);
      } catch (error) {
        console.log(error);
      }
    };

    const getAllUsers = async () => {
      try {
        console.log("object");
        const { data } = await axiosInstance.get(`/user/get-all-users`);
        console.log(data);
        console.log("object");
        // setAlluser(data);
        setAlluser(data);
      } catch (error) {
        console.log(error);
      }
    };

    getAllUsers();
    getSingleGroup();
    getGroupTask();
  }, [showAdd, showRemove]);

  console.log(alluser);
  // console.log(teamData?.groupTasks)

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
      ? visibleTasks?.filter(task => task.assignedTo?._id=== profile?._id)
      : visibleTasks;
    return base;
  }, [teamData, onlyMine]);
 
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {teamData?.name}
            </h1>
            <div className="flex gap-2 items-center">
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

        <div className="mt-4 md:mt-0 flex items-center gap-4">
         {isOwner(teamData) && <button
            className="btn-primary hover:opacity-60 flex items-center space-x-2"
            onClick={() => navigate(`/create-task`, { state: { teamData } })}
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>}
          {!selectedTeam && (
            <>
              <button
                className="btn-secondary hover:opacity-60 flex items-center space-x-2"
                onClick={() => setShowAdd(true)}
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
              <button
                className="btn-secondary hover:opacity-60 flex items-center space-x-2"
                onClick={() => setShowRemove(true)}
              >
                <UserMinus className="w-4 h-4" />
                <span>Remove Member</span>
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
                      console.log Completed
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Members
              </h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-500" />
                <input
                  value={searchMember}
                  onChange={(e) => setSearchMember(e.target.value)}
                  placeholder="Search member..."
                  className="pl-8 pr-3 py-2 rounded-md bg-gray-50 dark:bg-gray-700/50 text-sm outline-none"
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
                      {console.log(teamData?.createdBy?._id,m?._id,teamData?.createdBy?._id===m?._id)}
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {m.name } {teamData?.createdBy?._id===m?._id ? (<i>(Admin)</i>) : "" }  {m._id===profile._id ? (<i>(You)</i>) : ""}
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
          </Card>

          {/* Tasks */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5" /> Tasks
              </h2>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={onlyMine}
                    onChange={(e) => setOnlyMine(e.target.checked)}
                  />
                  Assigned to me
                </label>

                {/* Show Create Task only for owner */}
                {/* {isOwner(teamData) && (
                  <button
                    className="btn-primary"
                    onClick={() => setShowCreateTask(true)}
                  >
                    Create Task
                  </button>
                )} */}
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
                  {visibleTask?.map((task) => (
                    <tr
                      onClick={() => navigate(`/tasks/${task._id}`)}
                      key={task?._id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                        {task.title}
                      </td>
                       {console.log(task?.assignedTo) }
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

      {showAdd && teamData && (
        <InlineModal
          title={`Add Member to ${teamData?.name}`}
          onClose={() => setShowAdd(false)}
        >
          <AddMemberForm
            onAdd={{ alluser: alluser, groupId: teamId }}
            onCancel={() => setShowAdd(false)}
          />
        </InlineModal>
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

  console.log(onAdd);
  console.log(onCancel);
  // ✅ Handle checkbox selection
  const handleCheckboxChange = (userId) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // remove if already selected
          : [...prev, userId] // add new id
    );
  };

  console.log(selectedMembers);

  console.log(onAdd?.groupId);
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
        `/group/add-member/${onAdd?.groupId}`,
        { membersId: selectedMembers }
      );
      console.log(data);
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
            onAdd?.alluser?.map((user) => (
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

  console.log(onAdd);
  // ✅ Handle checkbox selection
  const handleCheckboxChange = (userId) => {
    setSelectedMembers(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // remove if already selected
          : [...prev, userId] // add new id
    );
  };

  console.log(onAdd?.groupId);
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
      console.log(data);
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

// const RemoveMemberForm = ({ members, onRemove, onCancel }) => {
//   const [name, setName] = useState("");
//   return (
//     <form
//       onSubmit={(e) => {
//         e.preventDefault();
//         if (name) onRemove(name);
//       }}
//       className="space-y-4"
//     >
//       <div>
//         <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
//           Select Member
//         </label>
//         <select
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           className="w-full rounded-md bg-gray-50 dark:bg-gray-700/50 px-3 py-2 outline-none"
//         >
//           <option value="">Choose…</option>
//           {members.map((m) => (
//             <option key={m.id} value={m.name}>
//               {m.name}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div className="flex justify-end gap-2">
//         <button type="button" className="btn-secondary" onClick={onCancel}>
//           Cancel
//         </button>
//         <button type="submit" className="btn-primary flex items-center gap-2">
//           <UserMinus className="w-4 h-4" /> Remove
//         </button>
//       </div>
//     </form>
//   );
// };

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
