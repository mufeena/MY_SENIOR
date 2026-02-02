/*********************************
 * AUTH / LOGOUT
 *********************************/
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/*********************************
 * PROFILE DRAWER
 *********************************/
function toggleProfileDrawer() {
  document.getElementById("profileDrawer").classList.toggle("open");
}

function enableEdit() {
  document.getElementById("viewProfile").style.display = "none";
  document.getElementById("editProfile").style.display = "block";

  document.getElementById("editName").value =
    document.getElementById("viewName").innerText;
  document.getElementById("editEmail").value =
    document.getElementById("viewEmail").innerText;
  document.getElementById("editDept").value =
    document.getElementById("viewDept").innerText;
  document.getElementById("editExp").value =
    document.getElementById("viewExp").innerText;
  document.getElementById("editBio").value =
    document.getElementById("viewBio").innerText;
}

function saveProfile() {
  document.getElementById("viewName").innerText =
    document.getElementById("editName").value;
  document.getElementById("viewDept").innerText =
    document.getElementById("editDept").value;
  document.getElementById("viewExp").innerText =
    document.getElementById("editExp").value;
  document.getElementById("viewBio").innerText =
    document.getElementById("editBio").value;

  document.getElementById("editProfile").style.display = "none";
  document.getElementById("viewProfile").style.display = "block";
}

/*********************************
 * ✅ SCHEDULE SESSION (FIXED)
 *********************************/
function sendSessionLink() {
  const date = document.getElementById("sessionDate").value;
  const time = document.getElementById("sessionTime").value;
  const link = document.getElementById("meetLink").value.trim();

  if (!date || !time || !link) {
    alert("Please fill all session details");
    return;
  }

  const sessions =
    JSON.parse(localStorage.getItem("sessionLinks")) || [];

  sessions.push({
    date,
    time,
    link,
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem("sessionLinks", JSON.stringify(sessions));

  alert("Session details sent to mentees");

  document.getElementById("sessionDate").value = "";
  document.getElementById("sessionTime").value = "";
  document.getElementById("meetLink").value = "";
}

/*********************************
 * ✅ GROUP MESSAGE (FIXED)
 *********************************/
function sendGroupMessage() {
  const message = document.getElementById("mentorMessage").value.trim();
  const fileInput = document.getElementById("taskFile");
  const file = fileInput.files[0];

  if (!message) {
    alert("Please enter a message");
    return;
  }

  const messages =
    JSON.parse(localStorage.getItem("groupMessages")) || [];

  messages.push({
    message,
    fileName: file ? file.name : null,
    sentAt: new Date().toLocaleString(),
  });

  localStorage.setItem("groupMessages", JSON.stringify(messages));

  alert("Message sent to all mentees");

  document.getElementById("mentorMessage").value = "";
  fileInput.value = "";
}

/* backward compatibility (if used anywhere) */
function sendMessage() {
  sendGroupMessage();
}

/*********************************
 * ✅ INDIVIDUAL MESSAGE
 *********************************/
function openIndividualMessage(studentName) {
  const text = prompt(`Message for ${studentName}`);

  if (!text) return;

  const individualMessages =
    JSON.parse(localStorage.getItem("individualMessages")) || [];

  individualMessages.push({
    student: studentName,
    message: text,
    sentAt: new Date().toLocaleString(),
  });

  localStorage.setItem(
    "individualMessages",
    JSON.stringify(individualMessages)
  );

  alert(`Message sent to ${studentName}`);
}
