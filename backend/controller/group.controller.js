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

    const find_admin=await User.findById(admin);
    if(!find_admin) return res.status(500).json({message:"not found"})

      find_admin?.groups?.push(newGroup?.id)

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

    console.log(membersId)
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

export const getSingleGroup = async (req, res) => {
  try {
    const {groupId}=req.params;
 
    const find_group=await groupModel.findById(groupId).populate('members');
    if(!find_group) return res.status(404).json({messaage:"Group not found"});
    
    return res.status(200).json(find_group);
  
  } catch (error) {
  return res.status(404).json({messaage:"Internal Server Error",error});
    
  }




}