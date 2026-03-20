import express from "express";
import jwt from "jsonwebtoken";
import HospitalVisit from "../models/HospitalVisit.js";
import upload from "../middlewares/hospitalUpload.js";

const router = express.Router();

const verifyToken=(req,res,next)=>{

const token=req.headers.authorization?.split(" ")[1];

if(!token) return res.status(401).json({message:"No token"});

try{

const decoded=jwt.verify(token,process.env.JWT_SECRET);
req.user=decoded;
next();

}catch{

res.status(403).json({message:"Invalid token"});

}

};

router.post(
"/add",
verifyToken,
upload.fields([
{ name:"bill_file", maxCount:1 },
{ name:"procedure_images", maxCount:5 }
]),

async(req,res)=>{

try{

const billFile=req.files?.bill_file?.[0]?.path || "";

const procedureImages =
req.files?.procedure_images?.map(file=>file.path) || [];

const visit=await HospitalVisit.create({

...req.body,
user_id:req.user.id,
bill_file:billFile,
procedure_images:procedureImages

});

res.status(201).json(visit);

}catch(err){

res.status(500).json({message:err.message});

}

}

);

router.get("/",verifyToken,async(req,res)=>{

const visits=await HospitalVisit.find({user_id:req.user.id})
.sort({admission_date:-1});

res.json(visits);

});

router.delete("/:id",verifyToken,async(req,res)=>{

await HospitalVisit.findByIdAndDelete(req.params.id);

res.json({message:"Deleted"});

});

router.put("/:id", upload.fields([
  { name: "bill_file", maxCount: 1 },
  { name: "procedure_images", maxCount: 10 }
]), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files?.bill_file) {
      updateData.bill_file = req.files.bill_file[0].filename;
    }

    if (req.files?.procedure_images) {
      updateData.procedure_images = req.files.procedure_images.map(
        (file) => file.filename
      );
    }

    const updatedVisit = await HospitalVisit.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedVisit) {
      return res.status(404).json({ message: "Hospital visit not found" });
    }

    res.status(200).json(updatedVisit);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Failed to update hospital visit" });
  }
});

export default router;