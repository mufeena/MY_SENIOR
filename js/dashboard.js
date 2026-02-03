/*********************************
* AUTH CHECK
*********************************/
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
  if (!user || user.role !== "mentor" || Date.now() > user.expiry) {
    localStorage.clear();
    window.location.href = "index.html";
    return;
  }
  
  initDashboard();
});

/*********************************
* GLOBAL FILTER STATE
*********************************/
let currentFilter = '';
let currentStatusFilter = '';

function initDashboard() {
  loadProfile();
  loadSession();
  loadStudents();
  loadTasks();
  loadStudentProgress();
}

/*********************************
* LOGOUT
*********************************/
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = "index.html";
  }
}

/*********************************
* PROFILE (unchanged)
*********************************/
function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("mentorProfile")) || {};
  document.getElementById("mentorName").innerText = profile.name || "Mentor";
  document.getElementById("viewName").innerText = profile.name || "—";
  document.getElementById("viewEmail").innerText = profile.email || "—";
  document.getElementById("viewDept").innerText = profile.dept || "—";
  document.getElementById("viewExp").innerText = profile.exp || "—";
}

function toggleProfileDrawer() {
  document.getElementById("profileDrawer").classList.toggle("open");
}

function enableEdit() {
  document.getElementById("viewProfile").style.display = "none";
  document.getElementById("editProfile").style.display = "block";
  const profile = JSON.parse(localStorage.getItem("mentorProfile")) || {};
  document.getElementById("editName").value = profile.name || "";
  document.getElementById("editDept").value = profile.dept || "";
  document.getElementById("editExp").value = profile.exp || "";
}

function saveProfile() {
  const profile = JSON.parse(localStorage.getItem("mentorProfile")) || {};
  profile.name = document.getElementById("editName").value;
  profile.dept = document.getElementById("editDept").value;
  profile.exp = document.getElementById("editExp").value;
  localStorage.setItem("mentorProfile", JSON.stringify(profile));
  document.getElementById("viewProfile").style.display = "block";
  document.getElementById("editProfile").style.display = "none";
  loadProfile();
  toggleProfileDrawer();
  alert("✅ Profile updated successfully!");
}

/*********************************
* SESSION (unchanged)
*********************************/
function loadSession() {
  const session = JSON.parse(localStorage.getItem("activeSession"));
  if (session) {
    document.getElementById("sessionDateView").innerText = session.date;
    document.getElementById("sessionTimeView").innerText = session.time;
    document.getElementById("sessionStatus").innerText = "Session scheduled";
  }
}

function sendSessionLink() {
  const date = document.getElementById("sessionDate").value;
  const time = document.getElementById("sessionTime").value;
  const link = document.getElementById("meetLink").value.trim();
  
  if (!date || !time || !link) {
    alert("Please fill all session details");
    return;
  }
  
  const session = { date, time, link, scheduledAt: Date.now() };
  localStorage.setItem("activeSession", JSON.stringify(session));
  loadSession();
  document.getElementById("sessionDate").value = "";
  document.getElementById("sessionTime").value = "";
  document.getElementById("meetLink").value = "";
  alert("✅ Session scheduled and sent to mentees!");
}

/*********************************
* STUDENTS (unchanged)
*********************************/
function loadStudents() {
  const students = JSON.parse(localStorage.getItem("mentorStudents")) || 
    ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown"];
  const studentList = document.getElementById("studentList");
  const groupCount = document.getElementById("groupCount");
  studentList.innerHTML = students.map(student => `<li>${student}</li>`).join('');
  groupCount.textContent = `(${students.length})`;
  localStorage.setItem("mentorStudents", JSON.stringify(students));
}

/*********************************
* TASKS ASSIGNMENT (updated)
*********************************/
function assignTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const due = document.getElementById("taskDue").value;
  
  if (!title || !due) {
    alert("Please enter task title and due date");
    return;
  }
  
  const tasks = JSON.parse(localStorage.getItem("mentorTasks")) || [];
  tasks.push({
    id: Date.now(),
    title,
    due,
    createdAt: Date.now(),
    completedBy: []
  });
  
  localStorage.setItem("mentorTasks", JSON.stringify(tasks));
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDue").value = "";
  loadTasks();
  loadStudentProgress();
  alert("✅ Task assigned to all mentees!");
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("mentorTasks")) || [];
  console.log(`${tasks.length} tasks assigned`);
}

/*********************************
* STUDENT PROGRESS WITH FILTERING & %
*********************************/
function loadStudentProgress() {
  const tasks = JSON.parse(localStorage.getItem("mentorTasks")) || [];
  const students = JSON.parse(localStorage.getItem("mentorStudents")) || 
    ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown"];
  
  const studentProgressList = document.getElementById("studentProgressList");
  const groupTaskCount = document.getElementById("groupTaskCount");
  
  if (tasks.length === 0) {
    studentProgressList.innerHTML = '<p style="color: #64748b; font-style: italic;">No tasks assigned yet</p>';
    groupTaskCount.textContent = "(0)";
    return;
  }
  
  groupTaskCount.textContent = `(${tasks.length})`;
  
  const filteredStudents = students.filter(student => {
    if (!currentFilter) return true;
    return student.toLowerCase().includes(currentFilter.toLowerCase());
  });
  
  let html = '';
  
  filteredStudents.forEach(studentName => {
    let completedCount = 0;
    tasks.forEach(task => {
      const studentCompletion = task.completedBy?.find(completion => 
        completion.name.toLowerCase().includes(studentName.toLowerCase().split(' ')[0].toLowerCase())
      );
      if (studentCompletion?.status === 'completed') completedCount++;
    });
    
    const totalTasks = tasks.length;
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    
    html += `
      <div style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 6px;">${studentName}</div>
          <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; background: linear-gradient(90deg, #10b981 0%, #10b981 ${progressPercent}%, transparent ${progressPercent}%); border-radius: 4px; transition: all 0.5s ease; width: ${progressPercent}%;"></div>
          </div>
          <div style="margin-top: 8px; font-size: 13px; color: #64748b;">
            ${completedCount}/${totalTasks} tasks • ${progressPercent}%
          </div>
        </div>
        <div style="text-align: right; min-width: 90px;">
          <div style="font-weight: 700; font-size: 20px; color: ${progressPercent === 100 ? '#059669' : progressPercent > 50 ? '#059669' : '#d97706'};">
            ${progressPercent}%
          </div>
        </div>
      </div>
    `;
  });
  
  studentProgressList.innerHTML = html;
  
  if (filteredStudents.length > 0) {
    const totalCompletions = filteredStudents.reduce((sum, studentName) => {
      let count = 0;
      tasks.forEach(task => {
        if (task.completedBy?.some(c => c.name.toLowerCase().includes(studentName.toLowerCase().split(' ')[0].toLowerCase()))) count++;
      });
      return sum + count;
    }, 0);
    
    const overallPercent = tasks.length > 0 ? Math.round((totalCompletions / (tasks.length * filteredStudents.length)) * 100) : 0;
    
    studentProgressList.innerHTML += `
      <div style="padding: 20px 0 0; border-top: 2px solid #e2e8f0; margin-top: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; font-size: 16px;">Overall Progress (${filteredStudents.length} students)</span>
          <div style="text-align: right;">
            <div style="font-weight: 700; font-size: 22px; color: #059669;">${overallPercent}%</div>
          </div>
        </div>
        <div style="width: 100%; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; margin-top: 12px;">
          <div style="height: 100%; background: linear-gradient(90deg, #10b981 0%, #10b981 ${overallPercent}%, transparent ${overallPercent}%); border-radius: 6px; width: ${overallPercent}%; transition: all 0.5s ease;"></div>
        </div>
      </div>
    `;
  }
}

/*********************************
* FILTER FUNCTIONS
*********************************/
function applyFilters() {
  currentFilter = document.getElementById("studentFilter").value;
  currentStatusFilter = document.getElementById("statusFilter").value;
  loadStudentProgress();
}

function clearFilters() {
  document.getElementById("studentFilter").value = '';
  document.getElementById("statusFilter").value = '';
  currentFilter = '';
  currentStatusFilter = '';
  loadStudentProgress();
}

// Filter event listeners
document.addEventListener('DOMContentLoaded', function() {
  const filterInput = document.getElementById("studentFilter");
  const statusFilter = document.getElementById("statusFilter");
  
  if (filterInput) filterInput.addEventListener('input', applyFilters);
  if (statusFilter) statusFilter.addEventListener('change', applyFilters);
});
