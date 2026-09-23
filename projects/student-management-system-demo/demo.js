
let students = {};
const nameEl=document.querySelector("#studentName"), marksEl=document.querySelector("#marks"), statusEl=document.querySelector("#status");
function grade(m){return m>=90?"A":m>=80?"B":m>=70?"C":m>=60?"D":m>=50?"E":"F"}
function render(){
  const rows=Object.entries(students);
  document.querySelector("#records").innerHTML = rows.length
    ? '<table><thead><tr><th>Name</th><th>Marks</th><th>Grade</th><th></th></tr></thead><tbody>'+
      rows.map(([n,m])=>`<tr><td>${n}</td><td>${m}</td><td><strong>${grade(m)}</strong></td><td><button class="danger" data-remove="${encodeURIComponent(n)}">Remove</button></td></tr>`).join("")+"</tbody></table>"
    : '<p class="muted">No student records yet.</p>';
  document.querySelectorAll("[data-remove]").forEach(btn=>btn.onclick=()=>{delete students[decodeURIComponent(btn.dataset.remove)];render();search();});
  const vals=Object.values(students);
  document.querySelector("#total").textContent=vals.length;
  document.querySelector("#average").textContent=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2):"0.00";
  document.querySelector("#highest").textContent=vals.length?Math.max(...vals):"—";
  document.querySelector("#lowest").textContent=vals.length?Math.min(...vals):"—";
  const counts={A:0,B:0,C:0,D:0,E:0,F:0}; vals.forEach(v=>counts[grade(v)]++);
  document.querySelector("#distribution").innerHTML=Object.entries(counts).map(([g,c])=>`<span class="chip">Grade ${g}: <strong>${c}</strong></span>`).join("");
}
function search(){
  const q=document.querySelector("#search").value.trim().toLowerCase();
  const matches=Object.entries(students).filter(([n])=>!q||n.toLowerCase().includes(q));
  document.querySelector("#searchResults").innerHTML = matches.length
    ? matches.map(([n,m])=>`<div class="list-item"><span>${n}</span><span><strong>${m}</strong> · Grade ${grade(m)}</span></div>`).join("")
    : '<p class="muted">No matching student found.</p>';
}
document.querySelector("#add").onclick=()=>{
  const n=nameEl.value.trim(), raw=marksEl.value.trim();
  if(!n){statusEl.textContent="Enter a student name.";statusEl.className="error";return}
  if(raw===""||!Number.isInteger(Number(raw))||Number(raw)<0||Number(raw)>100){statusEl.textContent="Marks must be a whole number between 0 and 100.";statusEl.className="error";return}
  students[n]=Number(raw); nameEl.value=""; marksEl.value="";
  statusEl.textContent="Student added successfully.";statusEl.className="success";render();search();
};
document.querySelector("#sample").onclick=()=>{students={"Edward Lau":88,"Nicole Lee":93,"Bryan Teh":74,"Vaness Chua":61};render();search();statusEl.textContent="Sample data loaded.";statusEl.className="success"};
document.querySelector("#clear").onclick=()=>{students={};render();search();statusEl.textContent="All records cleared.";statusEl.className="muted"};
document.querySelector("#search").addEventListener("input",search);
render();search();
