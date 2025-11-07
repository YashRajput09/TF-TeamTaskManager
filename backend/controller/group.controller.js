import express from "express";
import { groupModel } from "../models/group.model.js";
import User from "../models/user_model.js";

export const createGroup = async (req, res) => {
  try {
    const { name, description, membersId } = req.body;
    const admin = req.user._id;

    console.log(name, description, admin, membersId);

    const newGroup = new groupModel({
      name,
      description,
      createdBy: admin,
      members:membersId,
    });
    await newGroup.save();

    if(membersId){
      const find_member=await User.findById(membersId);
       if(!find_member) return res.status(404).json({message:"Invalid member id"})

      find_member?.groups?.push(newGroup.id);
    }

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

    if (!membersId || membersId.length <= 0) {
      return res.status(400).json({ message: "Select atleast one" });
    }

    const find_group = await groupModel.findById(groupId);
    let response;

    if (!find_group) {
      return res.status(400).json({ message: "Group not Found" });
    }

    for (let i of membersId) {
        console.log(i);

      const find_user = await User.findById(i);
      if (!find_user) {
        // response="No Such Users Found !! Invite on TaskManager";  
        continue;}

      
      // Check if already a member
      if (find_group.members.some((m) => m._id.toString() === i)) {
        // response = "User Already Added in group";
        continue;
      }

      find_group?.members?.push(i);
      response="Users Add Successfully";
    }

    await find_group.save();

    res.status(200).json({ message: response, membersId, groupId });
  } catch (error) {
    console.log(error);
    res.status(200).json({ message: "Internal Server Error", error });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {memberId}  = req.body;

  
    const find_group = await groupModel.findById(groupId);
    let response;

    if (!find_group) {
      return res.status(400).json({ message: "Group not Found" });
    }
    console.log(find_group.members)
  
    
    find_group?.members?.filter(m=>console.log(m?.toString(),"&", memberId) )

    find_group.members=find_group?.members?.filter(m=>m?.toString() !== memberId);
    
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
  const {userId}=req.params;

    const find_user=await User.findById(userId).populate('groups')
    if(!find_user) return res.status(404).json({message:"User NOut Found"})
      
      return res.status(200).json(find_user.groups);
      
    } catch (error) {
      console.log(error)
      return res.status(500).json({message:"Internal Server Error"});
    }
      

}


export const getAllUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId; // From authentication middleware
    
    // Find all groups where the user is a member
    const groups = await groupModel.find({ 
      members: userId 
    })
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
    .select('name description createdBy members createdAt updatedAt')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: groups.length,
      groups: groups.map(group => ({
        id: group._id,
        name: group.name,
        description: group.description,
        createdBy: group.createdBy?.name || 'Unknown',
        memberCount: group.members.length,
        members: group.members.map(member => ({
          id: member._id,
          name: member.name,
          email: member.email
        })),
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// In group.controller.js - make sure this function exists and is exported
export const getAllGroups = async (req, res) => {
  try {
    console.log('🔍 Getting ALL groups from database...');
    
    // Find ALL groups in the database
    const groups = await groupModel.find({})
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .select('name description createdBy members createdAt updatedAt')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${groups.length} groups`);
    
    res.json({
      success: true,
      count: groups.length,
      groups: groups.map(group => ({
        id: group._id,
        name: group.name,
        description: group.description,
        createdBy: group.createdBy?.name || 'Unknown',
        memberCount: group.members.length,
        members: group.members.map(member => ({
          id: member._id,
          name: member.name,
          email: member.email
        })),
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      }))
    });
  } catch (error) {
    console.error('❌ Error getting all groups:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};