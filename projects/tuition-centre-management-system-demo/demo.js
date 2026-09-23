
const holidays = {
  "New Year's Day":"01 January 2024","Chinese New Year":"10-11 February 2024",
  "Hari Raya Aidilfitri":"10-11 April 2024","Labour Day":"01 May 2024",
  "Wesak Day":"23 May 2024","Hari Raya Haji":"16 June 2024","National Day":"31 August 2024",
  "Malaysia Day":"16 September 2024","Deepawali":"01 November 2024","Christmas":"25 December 2024"
};
const tuition = {
  UPSR:{Math:80,BM:70,Science:85,English:75},
  PT3:{Math:90,Sejarah:80,Geography:80,Science:90,English:90},
  SPM:{"Add Math":120,Physics:130,Chemistry:125,English:100}
};
const days = {
  BM:["Mon"],Math:["Tue"],Science:["Wed"],English:["Thu"],Sejarah:["Fri"],Geography:["Sat"],
  "Add Math":["Tue"],Physics:["Mon"],Chemistry:["Fri"]
};
const pkg = {
  BASIC:{name:"Basic Package (2 subjects)",discount:.10},
  STANDARD:{name:"Standard Package (3 subjects)",discount:.15},
  PREMIUM:{name:"Premium Package (4+ subjects)",discount:.20}
};
const level = document.querySelector("#level");
const subjectsWrap = document.querySelector("#subjectsWrap");
const subjectsBox = document.querySelector("#subjects");
const invoice = document.querySelector("#invoice");
const msg = document.querySelector("#message");

function money(v){return `RM${Number(v).toFixed(2)}`}
function drawSchedule(){
  let html = '<table><thead><tr><th>Level</th><th>Subject</th><th>Fee</th><th>Day</th></tr></thead><tbody>';
  Object.entries(tuition).forEach(([lv, subs])=>{
    Object.entries(subs).forEach(([s,fee])=>{
      html += `<tr><td>${lv}</td><td>${s}</td><td>${money(fee)}</td><td>${(days[s]||["N/A"]).join(", ")}</td></tr>`;
    });
  });
  document.querySelector("#schedule").innerHTML = html + "</tbody></table>";
}
function drawHolidays(){
  document.querySelector("#holidays").innerHTML =
    '<div class="list">'+Object.entries(holidays).map(([h,d])=>`<div class="list-item"><strong>${h}</strong><span class="muted">${d}</span></div>`).join("")+'</div>';
}
level.addEventListener("change",()=>{
  subjectsBox.innerHTML="";
  if(!level.value){subjectsWrap.classList.add("hidden");return}
  subjectsWrap.classList.remove("hidden");
  Object.entries(tuition[level.value]).forEach(([s,fee])=>{
    const id="sub_"+s.replace(/\s+/g,"_");
    subjectsBox.insertAdjacentHTML("beforeend",`
      <div class="subject"><label><input type="checkbox" value="${s}" id="${id}">
      <span><strong>${s}</strong><br><span class="muted">${money(fee)} · ${(days[s]||["N/A"]).join(", ")}</span></span></label></div>`);
  });
});
document.querySelector("#generate").addEventListener("click",()=>{
  const name=document.querySelector("#name").value.trim();
  const phone=document.querySelector("#phone").value.trim();
  const parent=document.querySelector("#parent").value.trim();
  const emergency=document.querySelector("#emergency").value.trim();
  const lv=level.value;
  const selected=[...subjectsBox.querySelectorAll('input:checked')].map(x=>x.value);
  if(!name||!phone||!parent||!emergency||!lv){msg.textContent="Please complete all student details and choose a level.";msg.className="error";return}
  if(!selected.length){msg.textContent="Choose at least one subject.";msg.className="error";return}
  const total=selected.reduce((sum,s)=>sum+tuition[lv][s],0);
  let packageKey=null;
  if(selected.length===2) packageKey="BASIC";
  else if(selected.length===3) packageKey="STANDARD";
  else if(selected.length>=4) packageKey="PREMIUM";
  const rate=packageKey?pkg[packageKey].discount:0;
  const discount=total*rate, final=total-discount;
  const lines=[
    "===== TUITION CENTRE INVOICE =====",
    `Name              : ${name}`,
    `Phone             : ${phone}`,
    `Parent Name       : ${parent}`,
    `Emergency Contact : ${emergency}`,
    `Level             : ${lv}`,
    "",
    "Subjects selected:"
  ];
  selected.forEach(s=>lines.push(`- ${s.padEnd(12)} ${money(tuition[lv][s]).padStart(9)} | ${(days[s]||["N/A"]).join(", ")}`));
  lines.push("",`Total Fee         : ${money(total)}`,`Discount          : ${money(discount)}`,
    `Amount to Pay     : ${money(final)}`,
    `Package           : ${packageKey?pkg[packageKey].name:"No discount package applied"}`,
    "===================================");
  invoice.textContent=lines.join("\n");
  msg.textContent="Invoice generated successfully.";msg.className="success";
});
document.querySelector("#reset").addEventListener("click",()=>{
  ["name","phone","parent","emergency"].forEach(id=>document.querySelector("#"+id).value="");
  level.value="";subjectsWrap.classList.add("hidden");subjectsBox.innerHTML="";
  invoice.textContent="Complete the registration form to generate an invoice.";
  msg.textContent="";
});
drawSchedule();drawHolidays();
