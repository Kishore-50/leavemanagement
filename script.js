// Standalone Leave Management System - no server or database required.
// Demo data is stored in this browser using localStorage.

const STORAGE_KEY = "leaveManagementUsers";
let currentEmail = null;

const $ = (id) => document.getElementById(id);
const show = (id, visible) => { if ($(id)) $(id).style.display = visible ? "block" : "none"; };
const message = (text, id = "response-message") => { if ($(id)) $(id).textContent = text; };

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
function updateBalance(user) {
  $("username-display").textContent = user.username;
  $("roll-number-display").textContent = user.rollNumber;
  $("casual-leave-display").textContent = user.casualLeave;
  $("medical-leave-display").textContent = user.medicalLeave;
}
function openDashboard(user) {
  updateBalance(user);
  show("login-section", false);
  show("registration-section", false);
  show("balance-section", true);
  show("apply-leave-section", true);
  show("logout-button", true);
  message("Login successful");
}
function showLogin() {
  show("login-section", true);
  show("registration-section", false);
}
function showRegistration() {
  show("registration-section", true);
  show("login-section", false);
}

document.addEventListener("DOMContentLoaded", () => {
  $("registration-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const username = $("username").value.trim();
    const email = $("reg-email").value.trim().toLowerCase();
    const password = $("reg-password").value;
    const rollNumber = $("roll-number").value.trim();
    const casualLeave = Number($("casual-leave").value);
    const medicalLeave = Number($("medical-leave").value);

    if (!username || !email || !rollNumber || !password) {
      message("Please fill all required fields", "registration-response");
      return;
    }
    if (password.length < 8) {
      message("Password must be at least 8 characters", "registration-response");
      return;
    }
    if (!Number.isInteger(casualLeave) || casualLeave < 0 ||
        !Number.isInteger(medicalLeave) || medicalLeave < 0) {
      message("Leave balances must be non-negative whole numbers", "registration-response");
      return;
    }

    const users = getUsers();
    if (users[email]) {
      message("An account with this email already exists", "registration-response");
      return;
    }
    users[email] = { username, email, password, rollNumber, casualLeave, medicalLeave };
    saveUsers(users);
    $("registration-form").reset();
    showLogin();
    message("Registration successful. Please login.");
  });

  $("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    const user = getUsers()[email];
    if (!user) {
      message("User not found. Please create an account first.");
      return;
    }
    if (user.password !== password) {
      message("Incorrect password.");
      return;
    }
    currentEmail = email;
    openDashboard(user);
  });

  $("logout-button").addEventListener("click", () => {
    currentEmail = null;
    show("balance-section", false);
    show("apply-leave-section", false);
    show("logout-button", false);
    $("username-display").textContent = "";
    $("roll-number-display").textContent = "";
    $("casual-leave-display").textContent = "0";
    $("medical-leave-display").textContent = "0";
    $("login-form").reset();
    showLogin();
    message("Logged out successfully");
  });

  $("refresh-balance").addEventListener("click", () => {
    if (!currentEmail) return message("Please login first");
    const user = getUsers()[currentEmail];
    if (!user) return message("User data not found");
    updateBalance(user);
    message("Leave balance updated");
  });

  $("leave-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!currentEmail) return message("Please login first");

    const type = $("leave-type").value;
    const days = Number($("leave-days").value);
    if (!Number.isInteger(days) || days <= 0) return message("Enter a valid number of days");

    const users = getUsers();
    const user = users[currentEmail];
    const field = type === "casual" ? "casualLeave" : "medicalLeave";

    if (user[field] < days) {
      message(`Insufficient ${type} leave balance`);
      return;
    }

    user[field] -= days;
    users[currentEmail] = user;
    saveUsers(users);
    updateBalance(user);
    message(`${type.charAt(0).toUpperCase() + type.slice(1)} leave applied successfully`);
    $("leave-form").reset();
  });

  $("show-login").addEventListener("click", showLogin);
  $("show-registration").addEventListener("click", showRegistration);

  show("login-section", true);
  show("registration-section", false);
  show("balance-section", false);
  show("apply-leave-section", false);
  show("logout-button", false);
});
