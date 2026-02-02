const SESSION_TIME = 30 * 60 * 1000; // 30 minutes

// LOGIN
const loginForm = document.querySelector("form");

if (loginForm && window.location.pathname.includes("index")) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    const mentor = JSON.parse(localStorage.getItem("mentorProfile"));
    const mentee = JSON.parse(localStorage.getItem("menteeProfile"));

    let user = null;
    let role = null;

    if (mentor && mentor.email === email && mentor.password === password) {
      user = mentor;
      role = "mentor";
    } 
    else if (mentee && mentee.email === email && mentee.password === password) {
      user = mentee;
      role = "mentee";
    }

    if (!user) {
      alert("Invalid email or password");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify({
      role,
      email,
      expiry: Date.now() + SESSION_TIME
    }));

    window.location.href =
      role === "mentor"
        ? "mentor-dashboard.html"
        : "mentee-dashboard.html";
  });
}
