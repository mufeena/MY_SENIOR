/*********************************
* AUTH CHECK & INIT (unchanged profile/session functions remain same)
*********************************/
document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  
  if (!user || user.role !== "mentee" || Date.now() > user.expiry) {
    localStorage.clear();
    window.location.href = "index.html";
    return;
  }
  
  initMenteeDashboard();
});

function initMenteeDashboard() {
  loadProfile();
  loadSession();
  loadMentor();
  loadTasks();
}

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("menteeProfile")) || {};
  document.getElementById("menteeName").innerText = profile.name || "Mentee";
  document.getElementById("viewName").innerText = profile.name || "—";
  document.getElementById("viewEmail").innerText = profile.email || "—";
  document.getElementById("viewEdu").innerText = profile.education || "—";
  document.getElementById("viewDept").innerText = profile.department || "—";
  document.getElementById("viewGoal").innerText = profile.goal || "—";
}

function toggleProfileDrawer() {
  document.getElementById("profileDrawer").classList.toggle("open");
}

function enableEdit() {
  document.getElementById("viewProfile").style.display = "none";
  document.getElementById("editProfile").style.display = "block";
  const profile = JSON.parse(localStorage.getItem("menteeProfile")) || {};
  document.getElementById("editName").value = profile.name || "";
  document.getElementById("editEdu").value = profile.education || "";
  document.getElementById("editDept").value = profile.department || "";
  document.getElementById("editGoal").value = profile.goal || "";
}

function saveProfile() {
  const profile = JSON.parse(localStorage.getItem("menteeProfile")) || {};
  profile.name = document.getElementById("editName").value;
  profile.education = document.getElementById("editEdu").value;
  profile.department = document.getElementById("editDept").value;
  profile.goal = document.getElementById("editGoal").value;
  localStorage.setItem("menteeProfile", JSON.stringify(profile));
  document.getElementById("viewProfile").style.display = "block";
  document.getElementById("editProfile").style.display = "none";
  loadProfile();
  toggleProfileDrawer();
  alert("✅ Profile updated successfully!");
}

function loadSession() {
  const session = JSON.parse(localStorage.getItem("activeSession"));
  const meetLink = document.getElementById("meetLink");
  if (session) {
    document.getElementById("sessionDateView").innerText = session.date;
    document.getElementById("sessionTimeView").innerText = session.time;
    document.getElementById("sessionStatus").innerText = "Session scheduled";
    meetLink.href = session.link;
    meetLink.style.display = "inline-block";
  }
}

function loadMentor() {
  const mentor = JSON.parse(localStorage.getItem("mentorProfile")) || {};
  document.getElementById("mentorName").innerText = mentor.name || "No mentor assigned";
  document.getElementById("mentorDept").innerText = mentor.dept || "—";
  document.getElementById("mentorExp").innerText = mentor.exp || "—";
}

/*********************************
* TASKS WITH INDIVIDUAL CHECKBOXES
*********************************/
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("mentorTasks")) || [];
  const taskList = document.getElementById("taskList");
  const taskCount = document.getElementById("taskCount");
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<li style="color: #64748b; font-style: italic;">No tasks assigned yet</li>';
    taskCount.textContent = "(0)";
    updateTaskStats([]);
    return;
  }
  
  taskList.innerHTML = tasks.map((task, index) => {
    const menteeProfile = JSON.parse(localStorage.getItem("menteeProfile")) || {};
    const isCompleted = task.completedBy?.some(c => c.email === menteeProfile.email);
    
    return `
      <li style="padding: 16px 0; display: flex; align-items: flex-start; gap: 12px; border-bottom: 1px solid #f1f5f9;">
        <input type="checkbox" class="task-checkbox" 
               data-task-index="${index}"
               ${isCompleted ? 'checked' : ''}
               style="margin-top: 2px; width: 18px; height: 18px; accent-color: #10b981;">
        <div style="flex: 1;">
          <strong style="font-size: 15px; display: block; margin-bottom: 4px;">${task.title}</strong>
          <small style="color: #64748b;">
            📅 Due: ${new Date(task.due).toLocaleDateString('en-IN')}
            ${task.createdAt ? ` | Assigned: ${new Date(task.createdAt).toLocaleDateString('en-IN')}` : ''}
          </small>
        </div>
        <span style="
          padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
          ${isCompleted ? 'background: #ecfdf5; color: #059669;' : 
           new Date(task.due) < new Date() ? 'background: #fee2e2; color: #dc2626;' : 
           'background: #fef3c7; color: #d97706;'}
        ">
          ${isCompleted ? 'COMPLETED' : new Date(task.due) < new Date() ? 'OVERDUE' : 'PENDING'}
        </span>
      </li>
    `;
  }).join('');
  
  // Add event listeners
  document.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleTaskComplete);
  });
  
  taskCount.textContent = `(${tasks.length})`;
  updateTaskStats(tasks);
}

function handleTaskComplete(e) {
  const taskIndex = parseInt(e.target.dataset.taskIndex);
  const tasks = JSON.parse(localStorage.getItem("mentorTasks")) || [];
  const menteeProfile = JSON.parse(localStorage.getItem("menteeProfile")) || {};
  
  if (tasks[taskIndex]) {
    if (!tasks[taskIndex].completedBy) tasks[taskIndex].completedBy = [];
    
    const existingIndex = tasks[taskIndex].completedBy.findIndex(c => c.email === menteeProfile.email);
    
    if (e.target.checked) {
      if (existingIndex === -1) {
        tasks[taskIndex].completedBy.push({
          email: menteeProfile.email,
          name: menteeProfile.name || 'Anonymous',
          status: 'completed',
          completedAt: Date.now()
        });
      }
    } else {
      if (existingIndex !== -1) {
        tasks[taskIndex].completedBy.splice(existingIndex, 1);
      }
    }
    
    localStorage.setItem("mentorTasks", JSON.stringify(tasks));
    loadTasks();
  }
}

function updateTaskStats(tasks) {
  const menteeProfile = JSON.parse(localStorage.getItem("menteeProfile")) || {};
  const completed = tasks.filter(task => 
    task.completedBy?.some(c => c.email === menteeProfile.email)
  ).length;
  const overdue = tasks.filter(task => 
    !task.completedBy?.some(c => c.email === menteeProfile.email) && new Date(task.due) < new Date()
  ).length;
  
  document.getElementById("completedTasks").textContent = `${completed}/${tasks.length}`;
  document.getElementById("overdueTasks").textContent = overdue;
}

function markAllComplete() {
  const tasks = JSON.parse(localStorage.getItem("mentorTasks")) || [];
  const menteeProfile = JSON.parse(localStorage.getItem("menteeProfile")) || {};
  
  tasks.forEach(task => {
    if (!task.completedBy) task.completedBy = [];
    const existingIndex = task.completedBy.findIndex(c => c.email === menteeProfile.email);
    if (existingIndex === -1) {
      task.completedBy.push({
        email: menteeProfile.email,
        name: menteeProfile.name || 'Anonymous',
        status: 'completed',
        completedAt: Date.now()
      });
    }
  });
  
  localStorage.setItem("mentorTasks", JSON.stringify(tasks));
  loadTasks();
  alert("✅ All tasks marked complete!");
}

function logout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.clear();
    window.location.href = "index.html";
  }
}
