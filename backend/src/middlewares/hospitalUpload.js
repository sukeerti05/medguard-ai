import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = "uploads/hospital";

if(!fs.existsSync(uploadPath)){
fs.mkdirSync(uploadPath,{recursive:true});
}

const storage = multer.diskStorage({

destination:(req,file,cb)=>{
cb(null,uploadPath);
},

filename:(req,file,cb)=>{

const ext = path.extname(file.originalname);
const hospital = (req.body.hospital_name || "hospital").replace(/\s+/g,"_");
const unique = Date.now();

cb(null,`${hospital}_${unique}${ext}`);

}

});

const upload = multer({
storage
});

export default upload;