import mongoose from "mongoose";

const hospitalVisitSchema = new mongoose.Schema(
{
user_id:{
type: mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

hospital_name:{
type:String,
required:true
},

location:{
type:String,
default:""
},

attending_doctor:{
type:String,
default:""
},

doctor_specialization:{
type:String,
default:""
},

reason:{
type:String,
default:""
},

procedure_name:{
type:String,
default:""
},

admission_date:{
type:Date,
},

discharge_date:{
type:Date
},

ward:{
type:String,
default:""
},

room_number:{
type:String,
default:""
},

bed_number:{
type:String,
default:""
},

diagnosis:{
type:String,
default:""
},

treatment_summary:{
type:String,
default:""
},

bill_amount:{
type:Number,
default:0
},

insurance_used:{
type:String,
default:""
},

amount_paid:{
type:Number,
default:0
},

bill_file:{
type:String,
default:""
},

procedure_images:[
{
type:String
}
],

follow_up_date:{
type:Date
},

follow_up_time:{
type:String,
default:""
},

discharge_status:{
type:String,
default:"Admitted"
},

notes:{
type:String,
default:""
},
reminder_1day_sent: {
  type: Boolean,
  default: false,
},
reminder_1hour_sent: {
  type: Boolean,
  default: false,
},
user_email: {
  type: String,
  required: true,
},

},
{timestamps:true}
);

export default mongoose.model("HospitalVisit", hospitalVisitSchema);