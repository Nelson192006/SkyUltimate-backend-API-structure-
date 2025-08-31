<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SkyUltimate — Login & Registration</title>
  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Splash fade-in animation */
    .fade-in { animation: fadeIn 0.5s ease forwards; opacity: 0; }
    @keyframes fadeIn { to { opacity: 1; } }
    /* cross fade helpers (kept for later) */
    .cross-fade-enter { opacity: 0; transition: opacity 0.5s; }
    .cross-fade-enter-active { opacity: 1; }
    .cross-fade-leave { opacity: 1; transition: opacity 0.5s; }
    .cross-fade-leave-active { opacity: 0; }
  </style>
</head>
<body class="bg-red-600 min-h-screen flex items-center justify-center relative">

  <!-- Splash Screen -->
  <div id="splash" class="absolute inset-0 flex items-center justify-center bg-red-600 z-50">
    <img src="https://github.com/Nelson192006/SkyUltimate-/blob/62343ff3e5e556aa02ecece40e2c006fa9161c0a/logo.png?raw=true"
         alt="Logo" class="w-40 fade-in">
  </div>

  <!-- Login/Register Card -->
  <div id="authCard" class="hidden absolute inset-0 flex items-center justify-center">
    <div class="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-8 w-96 max-w-full">
      <img src="https://github.com/Nelson192006/SkyUltimate-/blob/62343ff3e5e556aa02ecece40e2c006fa9161c0a/logo.png?raw=true"
           alt="Logo" class="w-32 mx-auto mb-6">

      <!-- Tabs -->
      <div class="flex justify-around mb-4">
        <button id="loginTab" class="font-semibold border-b-2 border-red-600 pb-1">Login</button>
        <button id="registerTab" class="font-semibold text-gray-500 pb-1">Register</button>
      </div>

      <!-- Forms Container -->
      <div id="formsContainer">

        <!-- Login Form -->
        <form id="loginForm" class="space-y-4">
          <select id="loginRole" class="w-full border rounded px-3 py-2">
            <option>Customer</option>
            <option>Agent</option>
            <option>Admin</option>
            <option>SuperAdmin</option>
          </select>

          <input type="email" id="loginEmail" placeholder="Email" class="w-full border rounded px-3 py-2" required>

          <div class="relative">
            <input type="password" id="loginPassword" placeholder="Password"
                   class="w-full border rounded px-3 py-2 pr-10" required>
            <button type="button" id="loginTogglePassword" class="absolute right-2 top-2 text-gray-500">👁️</button>
          </div>

          <a href="#" id="forgotPasswordLink" class="text-sm text-red-700 hover:underline block text-right">Forgot Password?</a>
          <button type="submit" class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Login</button>
          <p id="loginError" class="text-red-600 text-sm"></p>
        </form>

        <!-- Register Form -->
        <form id="registerForm" class="space-y-4 hidden">
          <input type="text" id="registerName" placeholder="Full Name" class="w-full border rounded px-3 py-2" required>

          <select id="registerRole" class="w-full border rounded px-3 py-2">
            <option>Customer</option>
            <option>Agent</option>
            <option>Admin</option>
            <option>SuperAdmin</option>
          </select>

          <input type="email" id="registerEmail" placeholder="Email" class="w-full border rounded px-3 py-2" required>

          <div class="relative">
            <input type="password" id="registerPassword" placeholder="Password" class="w-full border rounded px-3 py-2 pr-10" required>
            <button type="button" id="registerTogglePassword" class="absolute right-2 top-2 text-gray-500">👁️</button>
          </div>

          <!-- Dynamic Bank Info Fields for Agent/Admin -->
          <div id="bankFields" class="hidden space-y-2">
            <input type="text" id="bankName" placeholder="Bank Name" class="w-full border rounded px-3 py-2">
            <input type="text" id="accountNumber" placeholder="Account Number" class="w-full border rounded px-3 py-2">
            <input type="text" id="accountHolderName" placeholder="Account Holder Name" class="w-full border rounded px-3 py-2">
            <input type="text" id="phone" placeholder="Phone Number" class="w-full border rounded px-3 py-2">
          </div>

          <button type="submit" class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Register</button>
          <p id="registerError" class="text-red-600 text-sm"></p>
        </form>

        <!-- Forgot Password Placeholder -->
        <div id="forgotPasswordForm" class="hidden space-y-4">
          <p class="text-gray-700">Feature coming soon. Enter your email to get a reset link.</p>
          <input type="email" id="forgotEmail" placeholder="Email" class="w-full border rounded px-3 py-2">
          <button id="sendResetLink" class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Send Reset Link</button>
          <p id="forgotMsg" class="text-green-600 text-sm"></p>
          <button id="backToLogin" class="w-full border border-red-600 text-red-600 py-2 rounded hover:bg-red-100">Back to Login</button>
        </div>

      </div>
    </div>
  </div>

  <script>
    /**
     * IMPORTANT: This frontend expects your backend to expose routes under:
     *    https://skyultimate-backend-api-structure.onrender.com/api
     *
     * - Register: POST  /api/auth/register
     * - Login:    POST  /api/auth/login
     *
     * If your backend uses different mount points, update API_BASE accordingly.
     */
    const API_BASE = "https://skyultimate-backend-api-structure.onrender.com/api";

    // smarter fetch: if backend returns HTML (error page), we include that text in thrown error
    async function apiFetch(path, opts = {}) {
      const token = localStorage.getItem("su_token");
      const headers = opts.headers || {};
      headers["Content-Type"] = "application/json";
      if (token) headers["Authorization"] = `Bearer ${token}`;

      let res;
      try {
        res = await fetch(API_BASE + path, { ...opts, headers });
      } catch (networkErr) {
        console.error("Network error calling API:", networkErr);
        throw new Error("Network error: " + networkErr.message);
      }

      const text = await res.text(); // always get raw text first
      // attempt to parse JSON; if not JSON, include text in error so you can see server HTML
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        // not JSON
        if (!res.ok) {
          console.error("Non-JSON API error response:", text);
          // include first 800 chars of HTML/text in thrown error for debugging
          throw new Error(`Server returned non-JSON response (status ${res.status}). See console for response snippet.`);
        }
        // if OK and no JSON, return raw text
        return text;
      }

      if (!res.ok) {
        console.error("API Error JSON:", data);
        throw new Error((data && (data.message || data.error)) || `API Error: ${res.status}`);
      }
      return data;
    }

    // -- splash logic --
    window.addEventListener('load', () => {
      setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
        document.getElementById('authCard').classList.remove('hidden');
      }, 3000);
    });

    // -- tabs, forms, toggles --
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const bankFields = document.getElementById('bankFields');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    loginTab.addEventListener('click', () => {
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
      forgotPasswordForm.classList.add('hidden');
      loginTab.classList.add('border-red-600'); loginTab.classList.remove('text-gray-500');
      registerTab.classList.remove('border-red-600'); registerTab.classList.add('text-gray-500');
    });

    registerTab.addEventListener('click', () => {
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      forgotPasswordForm.classList.add('hidden');
      registerTab.classList.add('border-red-600'); registerTab.classList.remove('text-gray-500');
      loginTab.classList.remove('border-red-600'); loginTab.classList.add('text-gray-500');
    });

    // password toggles (keeps your UI)
    document.getElementById('loginTogglePassword').addEventListener('click', () => {
      const p = document.getElementById('loginPassword');
      p.type = p.type === 'password' ? 'text' : 'password';
    });
    document.getElementById('registerTogglePassword').addEventListener('click', () => {
      const p = document.getElementById('registerPassword');
      p.type = p.type === 'password' ? 'text' : 'password';
    });

    // show bank fields for Agent/Admin in reg form
    document.getElementById('registerRole').addEventListener('change', (e) => {
      if (e.target.value === 'Agent' || e.target.value === 'Admin') {
        bankFields.classList.remove('hidden');
      } else {
        bankFields.classList.add('hidden');
      }
    });

    // forgot password placeholder handling
    document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.classList.add('hidden');
      forgotPasswordForm.classList.remove('hidden');
    });
    document.getElementById('backToLogin').addEventListener('click', () => {
      forgotPasswordForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
    });
    document.getElementById('sendResetLink').addEventListener('click', () => {
      document.getElementById('forgotMsg').innerText = "This feature is coming soon.";
    });

    // normalize roles to formats commonly expected by backend
    const normalizeRole = (r) => {
      if (!r) return "customer";
      const s = String(r).toLowerCase();
      if (s === "customer") return "customer";
      if (s === "agent") return "agent";
      if (s === "admin") return "admin";
      // backend variations used "superadmin", "super-admin", "SuperAdmin" in different places.
      // send 'super-admin' which many implementations accept
      if (s === "superadmin" || s === "super-admin" || s === "super admin") return "super-admin";
      return s;
    };

    // -- LOGIN submit (calls backend /api/auth/login) --
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const roleRaw = document.getElementById('loginRole').value;
      const role = normalizeRole(roleRaw);
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const errorEl = document.getElementById('loginError');
      errorEl.innerText = '';

      if (!email || !password) { errorEl.innerText = 'Please fill all fields.'; return; }

      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ role, email, password }),
        });

        // Expected: { message, user, token }
        if (data.token) {
          localStorage.setItem('su_token', data.token);
          localStorage.setItem('su_user', JSON.stringify(data.user || {}));
          // redirect to homepage (already provided)
          window.location.href = 'home.html';
        } else {
          console.warn("Login response had no token:", data);
          errorEl.innerText = data.message || 'Login failed';
        }
      } catch (err) {
        // If server returned HTML or non-JSON, apiFetch will have thrown a readable error
        console.error("Login failed:", err);
        errorEl.innerText = err.message || "Invalid credentials. Please check your role and login details.";
      }
    });

    // -- REGISTER submit (calls backend /api/auth/register) --
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('registerName').value.trim();
      const role = normalizeRole(document.getElementById('registerRole').value);
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value;
      const bankName = document.getElementById('bankName').value;
      const accountNumber = document.getElementById('accountNumber').value;
      const accountHolderName = document.getElementById('accountHolderName').value;
      const phone = document.getElementById('phone').value;
      const errorEl = document.getElementById('registerError');
      errorEl.innerText = '';

      if (!name || !email || !password) { errorEl.innerText = 'Please fill all required fields.'; return; }

      const payload = { name, role, email, password };
      if (role === 'agent' || role === 'admin') {
        // keep same keys that some backend files expect (bank details nested or flat)
        payload.bankName = bankName;
        payload.accountNumber = accountNumber;
        payload.accountHolderName = accountHolderName;
        payload.phone = phone;
      }

      try {
        const data = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        // Some backends auto-login and return token; others just return success.
        if (data.token) {
          localStorage.setItem('su_token', data.token);
          localStorage.setItem('su_user', JSON.stringify(data.user || {}));
          window.location.href = 'home.html';
        } else {
          // registration success -> switch to login tab with prefilled email
          loginTab.click();
          document.getElementById('loginEmail').value = email;
          document.getElementById('loginPassword').value = '';
          errorEl.innerText = "Registration successful! Please login.";
        }
      } catch (err) {
        console.error("Registration error:", err);
        errorEl.innerText = err.message || "An account with this email already exists, Login.";
      }
    });

  </script>
</body>
</html>
