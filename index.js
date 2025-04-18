const API_BASE_URL = "https://v2.api.noroff.dev";
const REGISTER_URL = `${API_BASE_URL}/auth/register`;
const LOGIN_URL = `${API_BASE_URL}/auth/login`;
const API_KEY_URL = `${API_BASE_URL}/auth/create-api-key`;

document.getElementById("registerBtn").addEventListener("click", async (e) => 
  {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const registerMessageDiv = document.getElementById("registerMessage"); 

  if (!email.includes("@noroff.no") && !email.includes("@stud.noroff.no")) {
    registerMessageDiv.textContent = "Email has to  be a Noroff emailaddress.";
    registerMessageDiv.className = "text-danger mt-2";
    return;
  }

  try {
    const res = await fetch(REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!res.ok) throw new Error("Failed to register");

    registerMessageDiv.textContent = "Wohoo, you are registrated. Please login.";
    registerMessageDiv.className = "text-success mt-2"; 
  } catch (error) {
    console.error(error);
    registerMessageDiv.textContent = "Ups, somthng went wrong.";
    registerMessageDiv.className = "text-danger mt-2"; 
  }
});

document.getElementById("loginBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const loginMessageDiv = document.getElementById("loginMessage"); 

  try {
    const res = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const { data } = await res.json();

    if (!res.ok) throw new Error("Login failed");

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data));

   

    const apiKeyRes = await fetch(API_KEY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: "My Key" })
    });

    const apiKeyData = await apiKeyRes.json();
    localStorage.setItem("apiKey", apiKeyData.data.key);

    location.href = "feed.html";
  } catch (error) {
    console.error(error);
    loginMessageDiv.textContent = "Error logging in.";
    loginMessageDiv.className = "text-danger mt-2"; 
  }
});
