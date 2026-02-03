document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', handleAuth);
  });
});

function handleAuth(e) {
  e.preventDefault();
  
  const form = e.target;
  const formId = form.id;
  
  if (formId === 'loginForm') {
    handleLogin(form);
  } else if (formId === 'mentorRegisterForm') {
    handleMentorRegister(form);
  } else if (formId === 'menteeRegisterForm') {  // ← THIS WAS MISSING!
    handleMenteeRegister(form);
  }
}

function handleLogin(form) {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  
  // Check registered users AND demo users
  const registeredMentors = JSON.parse(localStorage.getItem('registeredMentors')) || [];
  const registeredMentees = JSON.parse(localStorage.getItem('registeredMentees')) || [];
  const demoUsers = {
    'mentor@test.com': { password: 'mentor123', role: 'mentor' },
    'mentee@test.com': { password: 'mentee123', role: 'mentee' },
    'admin@mentorlink.com': { password: 'admin123', role: 'mentor' }
  };
  
  // First check demo users
  if (demoUsers[email] && demoUsers[email].password === password) {
    saveUserSession(email, demoUsers[email].role);
    return;
  }
  
  // Check registered mentors
  const registeredMentor = registeredMentors.find(user => 
    user.email === email && user.password === password
  );
  if (registeredMentor) {
    saveUserSession(email, 'mentor');
    return;
  }
  
  // Check registered mentees
  const registeredMentee = registeredMentees.find(user => 
    user.email === email && user.password === password
  );
  if (registeredMentee) {
    saveUserSession(email, 'mentee');
    return;
  }
  
  alert('❌ Invalid email or password!\n\nDemo Login:\nmentor@test.com / mentor123\nmentee@test.com / mentee123');
}

function handleMentorRegister(form) {
  const name = document.getElementById('mentorName').value.trim();
  const email = document.getElementById('mentorEmail').value.trim().toLowerCase();
  const password = document.getElementById('mentorPassword').value;
  const dept = document.getElementById('mentorDept').value.trim();
  const exp = document.getElementById('mentorExp').value.trim();
  
  if (!name || !email || !password || !dept || !exp) {
    alert('Please fill all fields');
    return;
  }
  
  const registeredMentors = JSON.parse(localStorage.getItem('registeredMentors')) || [];
  if (registeredMentors.find(user => user.email === email)) {
    alert('❌ Email already registered!');
    return;
  }
  
  const newMentor = { name, email, password, dept, exp, registeredAt: Date.now() };
  registeredMentors.push(newMentor);
  localStorage.setItem('registeredMentors', JSON.stringify(registeredMentors));
  localStorage.setItem('mentorProfile', JSON.stringify(newMentor));
  
  saveUserSession(email, 'mentor');
  alert('✅ Mentor registration successful!');
}

function handleMenteeRegister(form) {  // ← NEW FUNCTION!
  const name = document.getElementById('menteeName').value.trim();
  const email = document.getElementById('menteeEmail').value.trim().toLowerCase();
  const password = document.getElementById('menteePassword').value;
  const education = document.getElementById('menteeEdu').value.trim();
  const department = document.getElementById('menteeDept').value.trim();
  const goal = document.getElementById('menteeGoal').value.trim();
  
  if (!name || !email || !password || !education || !department || !goal) {
    alert('Please fill all fields');
    return;
  }
  
  const registeredMentees = JSON.parse(localStorage.getItem('registeredMentees')) || [];
  if (registeredMentees.find(user => user.email === email)) {
    alert('❌ Email already registered! Please login instead.');
    return;
  }
  
  // Save new mentee
  const newMentee = { 
    name, 
    email, 
    password, 
    education, 
    department, 
    goal, 
    registeredAt: Date.now() 
  };
  
  registeredMentees.push(newMentee);
  localStorage.setItem('registeredMentees', JSON.stringify(registeredMentees));
  localStorage.setItem('menteeProfile', JSON.stringify(newMentee));
  
  // Auto-login
  saveUserSession(email, 'mentee');
  
  alert('✅ Mentee registration successful! Redirecting to dashboard...');
}

function saveUserSession(email, role) {
  const user = {
    email,
    role,
    loginTime: Date.now(),
    expiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  localStorage.setItem('loggedInUser', JSON.stringify(user));
  
  if (role === 'mentor') {
    window.location.href = 'mentor-dashboard.html';
  } else if (role === 'mentee') {
    window.location.href = 'mentee-dashboard.html';  // ← FIXED!
  }
}
