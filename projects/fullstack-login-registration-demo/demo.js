
const $=s=>document.querySelector(s);
let users=JSON.parse(localStorage.getItem("edward_demo_users")||"[]");
const statusEl=$("#authStatus");
function save(){localStorage.setItem("edward_demo_users",JSON.stringify(users))}
function show(mode){
  const reg=mode==="register";
  $("#registerForm").classList.toggle("hidden",!reg);$("#loginForm").classList.toggle("hidden",reg);
  $("#tabRegister").setAttribute("aria-selected",String(reg));$("#tabLogin").setAttribute("aria-selected",String(!reg));
  statusEl.textContent="";
}
$("#tabRegister").onclick=()=>show("register");$("#tabLogin").onclick=()=>show("login");
$("#registerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const name=$("#regName").value.trim(),email=$("#regEmail").value.trim().toLowerCase(),
        phone=$("#regPhone").value.trim(),pass=$("#regPassword").value,confirm=$("#regConfirm").value;
  const nameRx=/^[A-Za-z\s]+$/,phoneRx=/^[0-9]{10,11}$/,passRx=/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if(!nameRx.test(name)){statusEl.textContent="Full Name must contain letters and spaces only.";statusEl.className="error";return}
  if(!/^\S+@\S+\.\S+$/.test(email)){statusEl.textContent="Enter a valid email address.";statusEl.className="error";return}
  if(!phoneRx.test(phone)){statusEl.textContent="Phone number must be 10–11 digits.";statusEl.className="error";return}
  if(!passRx.test(pass)){statusEl.textContent="Password needs 8+ characters, uppercase, number and symbol.";statusEl.className="error";return}
  if(pass!==confirm){statusEl.textContent="Passwords do not match.";statusEl.className="error";return}
  if(users.some(u=>u.email===email)){statusEl.textContent="Email already registered.";statusEl.className="error";return}
  users.push({name,email,phone,password:pass});save();
  statusEl.textContent="Registration successful! You can now log in.";statusEl.className="success";
  $("#loginEmail").value=email;$("#registerForm").reset();setTimeout(()=>show("login"),650);
});
$("#loginForm").addEventListener("submit",e=>{
  e.preventDefault();
  const email=$("#loginEmail").value.trim().toLowerCase(),pass=$("#loginPassword").value;
  const user=users.find(u=>u.email===email&&u.password===pass);
  if(!user){statusEl.textContent="Invalid email or password.";statusEl.className="error";return}
  localStorage.setItem("edward_demo_logged_in","true");localStorage.setItem("edward_demo_username",user.name);
  $("#authCard").classList.add("hidden");$("#dashboard").classList.remove("hidden");$("#welcome").textContent=`Welcome ${user.name} 🎉`;
});
$("#logout").onclick=()=>{
  localStorage.removeItem("edward_demo_logged_in");localStorage.removeItem("edward_demo_username");
  $("#dashboard").classList.add("hidden");$("#authCard").classList.remove("hidden");show("login");
  statusEl.textContent="Logged out successfully.";statusEl.className="success";
};
$("#resetUsers").onclick=()=>{users=[];save();localStorage.removeItem("edward_demo_logged_in");localStorage.removeItem("edward_demo_username");$("#logout").click();statusEl.textContent="Demo accounts cleared.";statusEl.className="muted"};
if(localStorage.getItem("edward_demo_logged_in")==="true"){
  $("#authCard").classList.add("hidden");$("#dashboard").classList.remove("hidden");
  $("#welcome").textContent=`Welcome ${localStorage.getItem("edward_demo_username")||"Member"} 🎉`;
}
