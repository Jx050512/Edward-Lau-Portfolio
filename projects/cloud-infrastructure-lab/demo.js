
const $ = (s)=>document.querySelector(s);
const steps = [
  "Create a Google Cloud project",
  "Enable Compute Engine",
  "Create and configure a VM instance",
  "Create a Cloud Storage bucket",
  "Upload a file to Cloud Storage",
  "Review service-model responsibilities",
  "Apply foundational security controls"
];

const state = {done:new Set(), vm:null, bucket:null};

function renderProgress(){
  const pct = Math.round((state.done.size/steps.length)*100);
  $("#progressBar").style.width = pct+"%";
  $("#progressText").textContent = pct+"%";
  $("#completed").textContent = `${state.done.size}/${steps.length}`;
}

function mark(i){
  state.done.add(i);
  renderProgress();
}

$("#createVM").addEventListener("click",()=>{
  const name=$("#vmName").value.trim() || "edward-lab-vm";
  const region=$("#region").value;
  const os=$("#os").value;
  const machine=$("#machine").value;
  state.vm={name,region,os,machine};
  mark(0); mark(1); mark(2);
  $("#vmResult").textContent =
`VM INSTANCE CREATED (SIMULATION)
Name: ${name}
Region: ${region}
Machine: ${machine}
OS: ${os}
Status: RUNNING

What this demonstrates:
- Compute Engine VM configuration
- Region / machine-type selection
- OS image selection
- IaaS responsibility awareness`;
  $("#vmStatus").textContent="VM ready in portfolio demo mode.";
  $("#vmStatus").className="success";
});

$("#createBucket").addEventListener("click",()=>{
  const bucket=$("#bucketName").value.trim() || "edward-cloud-lab-bucket";
  const location=$("#bucketLocation").value;
  state.bucket={bucket,location};
  mark(3); mark(4);
  $("#bucketResult").textContent =
`CLOUD STORAGE BUCKET CREATED (SIMULATION)
Bucket: gs://${bucket}
Location: ${location}
Storage class: Standard

Uploaded object:
portfolio-lab.txt

What this demonstrates:
- Bucket creation
- Storage location selection
- Object upload workflow
- Basic cloud storage organization`;
  $("#bucketStatus").textContent="Bucket workflow completed.";
  $("#bucketStatus").className="success";
});

document.querySelectorAll("[data-model]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const model=btn.dataset.model;
    const text={
      IaaS:"IaaS: You manage the OS, applications and data. The provider manages physical infrastructure and virtualization.",
      PaaS:"PaaS: You focus on applications and data while the provider manages runtime, operating system and infrastructure.",
      SaaS:"SaaS: The provider manages the full application platform. The user mainly configures and uses the software."
    }[model];
    $("#modelText").textContent=text;
    mark(5);
  });
});

document.querySelectorAll(".security-check").forEach(cb=>{
  cb.addEventListener("change",()=>{
    const all=[...document.querySelectorAll(".security-check")];
    const count=all.filter(x=>x.checked).length;
    $("#securityCount").textContent=`${count}/${all.length}`;
    if(count===all.length) mark(6);
  });
});

$("#resetLab").addEventListener("click",()=>{
  state.done.clear(); state.vm=null; state.bucket=null;
  $("#vmResult").textContent="Configure the VM and click Create VM.";
  $("#bucketResult").textContent="Configure the bucket and click Create Bucket.";
  $("#vmStatus").textContent=""; $("#bucketStatus").textContent="";
  $("#modelText").textContent="Choose a service model to see the responsibility split.";
  document.querySelectorAll(".security-check").forEach(x=>x.checked=false);
  $("#securityCount").textContent="0/4";
  renderProgress();
});

renderProgress();
