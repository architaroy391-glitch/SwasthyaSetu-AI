export type FacilityStatus = "healthy" | "warning" | "critical" | "offline";
export type Facility = { id:string; name:string; type:string; district:string; state:string; x:number; y:number; status:FacilityStatus; beds:number; icu:number; doctors:number; specialists:number; medicines:number; sync:string; online:boolean };
export const facilities: Facility[] = [
 {id:"khordha",name:"PHC Khordha",type:"Primary Health Centre",district:"Khordha",state:"Odisha",x:51,y:49,status:"warning",beds:8,icu:0,doctors:3,specialists:1,medicines:12,sync:"8 min ago",online:true},
 {id:"capital",name:"Capital Hospital",type:"District Hospital",district:"Khordha",state:"Odisha",x:65,y:37,status:"healthy",beds:42,icu:4,doctors:18,specialists:7,medicines:28,sync:"4 min ago",online:true},
 {id:"jatni",name:"CHC Jatni",type:"Community Health Centre",district:"Khordha",state:"Odisha",x:45,y:65,status:"critical",beds:3,icu:1,doctors:4,specialists:1,medicines:7,sync:"13 min ago",online:true},
 {id:"banki",name:"PHC Banki",type:"Primary Health Centre",district:"Cuttack",state:"Odisha",x:32,y:30,status:"offline",beds:6,icu:0,doctors:2,specialists:0,medicines:9,sync:"3 hr ago",online:false},
 {id:"scb",name:"SCB Medical College",type:"Medical College Hospital",district:"Cuttack",state:"Odisha",x:76,y:18,status:"healthy",beds:96,icu:12,doctors:42,specialists:19,medicines:36,sync:"2 min ago",online:true},
 {id:"puri",name:"District Hospital Puri",type:"District Hospital",district:"Puri",state:"Odisha",x:70,y:76,status:"warning",beds:17,icu:2,doctors:11,specialists:4,medicines:18,sync:"16 min ago",online:true},
];
export const inventory = [
 {name:"Amoxicillin",stock:120,usage:38,reorder:250,days:3.2,risk:"high",updated:"8 min ago"},
 {name:"ORS",stock:180,usage:24,reorder:120,days:7.5,risk:"high",updated:"8 min ago"},
 {name:"Paracetamol",stock:640,usage:42,reorder:300,days:15.2,risk:"low",updated:"8 min ago"},
 {name:"Oxytocin",stock:18,usage:7,reorder:35,days:2.6,risk:"critical",updated:"13 min ago"},
 {name:"Insulin",stock:380,usage:18,reorder:120,days:21.1,risk:"low",updated:"2 min ago"},
];
export const navItems = [
 ["/dashboard","Overview"],["/inventory","Inventory"],["/predictions","Predictions"],["/network","Resource network"],["/resources","Beds & staff"],["/emergency","Emergency SOS"],["/redistribution","Redistribution"],["/analytics","Analytics"],["/notifications","Notifications"],["/settings","Settings"],
] as const;
