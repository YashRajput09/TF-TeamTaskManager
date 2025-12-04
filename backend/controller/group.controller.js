import { groupModel } from "../models/group.model.js";
import User from "../models/user_model.js";
import mongoose from "mongoose";
import { Task } from "../models/task.modal.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, membersId } = req.body;
    const admin = req.user._id;

    const newGroup = new groupModel({
      name,
      description,
      createdBy: admin,
      members: membersId,
    });
    await newGroup.save();

    if (membersId) {
      const find_member = await User.findById(membersId);
      if (!find_member)
        return res.status(404).json({ message: "Invalid member id" });

      find_member?.groups?.push(newGroup.id);
    }

    const find_admin = await User.findById(admin);
    if (!find_admin) return res.status(500).json({ message: "not found" });

    find_admin?.groups?.push(newGroup?.id);

    await find_admin.save();

    return res.status(200).json({ message: "Done", newGroup });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error" });
  }
};

export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { membersId } = req.body;

    if (!membersId || membersId.length === 0) {
      return res.status(400).json({ message: "Select at least one user" });
    }

    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const adminId = group.createdBy.toString();

    // Response summaries
    const added = [];

    // Filter valid users BEFORE DB update
    for (const userId of membersId) {
      const user = await User.findById(userId);

      if (!user) {
        continue;
      }

      if (userId === adminId) {
        continue;
      }

      if (group.members.includes(userId)) {
        continue;
      }

      added.push(userId);
    }

    // Bulk update (ONLY valid users)
    if (added.length > 0) {
      // Add group to all users
      await User.updateMany(
        { _id: { $in: added } },
        { $addToSet: { groups: groupId } }
      );

      // Add users to group
      await groupModel.findByIdAndUpdate(groupId, {
        $addToSet: { members: { $each: added } },
      });
    }

    return res.status(200).json({
      message: "Member Added successfully",added, groupId
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;

    const find_group = await groupModel.findById(groupId);
    let response;

    if (!find_group) {
      return res.status(400).json({ message: "Group not Found" });
    }
    //console.log(find_group.members);

    // find_group?.members?.filter((m) =>
    //   console.log(m?.toString(), "&", memberId)
    // );

    find_group.members = find_group?.members?.filter(
      (m) => m?.toString() !== memberId
    );

    const find_member = await User.findById(memberId);
    if (!find_member)
      return res.status(404).json({ message: "User Not Found" });

    // console.log(memberId===find_group.createdBy.toString())
    if (memberId !== find_group.createdBy?.toString()) {
      find_member.groups = find_member?.groups?.filter(
        (group) => group.toString() !== groupId.toString()
      );
    }

    await find_member.save();
    await find_group.save();

    // for (let i of members) {
    //   const find_user = await User.findById(i);
    //   if (!find_user) continue;

    //   // Check if already a member
    //   if (find_group.members.some((m) => m._id.toString() === i)) {
    //     response = "User Already Added in group";
    //     continue;
    //   }

    //   find_group?.members?.push(i);
    // }

    res.status(200).json({ message: "user removed succesfully" });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: "Internal Server Error", error });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    const find_user = await User.findById(userId).populate("groups");
    if (!find_user) return res.status(404).json({ message: "User NOut Found" });

    return res.status(200).json(find_user.groups);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSingleGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const find_group = await groupModel
      .findById(groupId)
      .populate("members createdBy allTasks");
    if (!find_group)
      return res.status(404).json({ messaage: "Group not found" });

    return res.status(200).json(find_group);
  } catch (error) {
    return res.status(404).json({ messaage: "Internal Server Error", error });
  }
};

export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user && req.user._id;

  // Basic validation
  if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ message: "Invalid or missing groupId" });
  }
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: missing user" });
  }

  // helper: find task ids referencing group
  const getTaskIdsForGroup = async (groupDoc, session = null) => {
    const groupObjectId = groupDoc._id;
    const allTasksArray = Array.isArray(groupDoc.allTasks) ? groupDoc.allTasks : [];

    const q = {
      $or: [
        { groupId: groupObjectId },
        { group: groupObjectId },
        { _id: { $in: allTasksArray } },
      ],
    };
    const tasks = await Task.find(q, { _id: 1 }).session(session).lean();
    return tasks.map((t) => t._id);
  };

  // Try to run with a transaction. If transactions are unsupported, fall back.
  let session;
  try {
    session = await mongoose.startSession();
  } catch (err) {
    console.warn("Could not start mongoose session (transactions unavailable):", err.message);
    session = null;
  }

  // If session exists, try transaction path
  if (session) {
    try {
      session.startTransaction();

      const group = await groupModel.findById(groupId).session(session);
      if (!group) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Group not found" });
      }

      // Authorization: only creator
      if (String(group.createdBy) !== String(userId)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(403).json({ message: "Not authorized to delete this group" });
      }

      const taskIds = await getTaskIdsForGroup(group, session);

      // Remove group id from all users
      await User.updateMany(
        { groups: group._id },
        { $pull: { groups: group._id } },
        { session }
      );

      if (taskIds.length > 0) {
        // Remove task refs from users
        await User.updateMany(
          { $or: [{ assignedTasks: { $in: taskIds } }, { createdTasks: { $in: taskIds } }] },
          {
            $pull: {
              assignedTasks: { $in: taskIds },
              createdTasks: { $in: taskIds },
            },
          },
          { session }
        );

        // Delete tasks in batches
        const BATCH = 500;
        for (let i = 0; i < taskIds.length; i += BATCH) {
          const batch = taskIds.slice(i, i + BATCH);
          await Task.deleteMany({ _id: { $in: batch } }).session(session);
        }
      }

      // Delete the group
      await groupModel.deleteOne({ _id: group._id }).session(session);

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({ message: "Group deleted (transaction)", deletedTaskCount: taskIds.length });
    } catch (err) {
      console.error("Transaction path failed, aborting transaction. Error:", err);
      try {
        await session.abortTransaction();
      } catch (e) {
        console.error("abortTransaction error:", e);
      }
      session.endSession();
      // Fall through to non-transactional fallback
    }
  }

  // Non-transactional fallback (sequential, best-effort)
  try {
    // Re-load group without session
    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (String(group.createdBy) !== String(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this group" });
    }

    const taskIds = await getTaskIdsForGroup(group, null);

    // Remove group from users
    await User.updateMany(
      { groups: group._id },
      { $pull: { groups: group._id } }
    );

    if (taskIds.length > 0) {
      // Remove task refs from users
      await User.updateMany(
        { $or: [{ assignedTasks: { $in: taskIds } }, { createdTasks: { $in: taskIds } }] },
        {
          $pull: {
            assignedTasks: { $in: taskIds },
            createdTasks: { $in: taskIds },
          },
        }
      );

      // Delete tasks in batches (outside transaction)
      const BATCH = 500;
      for (let i = 0; i < taskIds.length; i += BATCH) {
        const batch = taskIds.slice(i, i + BATCH);
        await Task.deleteMany({ _id: { $in: batch } });
      }
    }

    // Delete group doc
    await groupModel.deleteOne({ _id: group._id });

    return res.status(200).json({ message: "Group deleted (no transaction)", deletedTaskCount: taskIds.length });
  } catch (err) {
    console.error("Non-transactional delete failed:", err);
    return res.status(500).json({
      message: "Server error while deleting group",
      error: err.message,
      stack: err.stack?.split("\n").slice(0, 5) // send small stack snippet
    });
  }
};

// routes
// router.delete("/group/self-leave/:groupId", protect, selfLeaveGroup);

export const selfLeaveGroup = async (req, res) => {
  try {
    const userId = String(req.user?._id);
    const { groupId } = req.params;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const group = await groupModel.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // find member entry (supports plain ObjectId or { user, role })
    const memberEntry = (group.members || []).find(m =>
      String(m && m.user ? m.user : m) === userId
    );
    if (!memberEntry) return res.status(400).json({ message: "You are not a member" });

    // Block if creator
    if (group.createdBy && String(group.createdBy) === userId) {
      return res.status(403).json({ message: "Group creator cannot leave" });
    }

    // Block if member has admin/owner role
    const role = memberEntry && memberEntry.role ? String(memberEntry.role).toLowerCase() : null;
    if (role === "admin" || role === "owner") {
      return res.status(403).json({ message: "Admins cannot leave the group" });
    }

    // remove from group.members
    const pullFilter = (group.members[0] && group.members[0].user) ? { "members.user": req.user._id } : { members: req.user._id };
    await groupModel.updateOne({ _id: groupId }, { $pull: pullFilter });

    // remove group from user's groups array
    await User.updateOne({ _id: req.user._id }, { $pull: { groups: groupId } });

    return res.status(200).json({ message: "Left group successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};



