(function () {
    "use strict";

    var USER_KEY = "ai_teaching_platform_users";
    var SESSION_KEY = "ai_teaching_platform_session";
    var memoryStorage = {};

    function storageGet(key) {
        try {
            return window.localStorage.getItem(key);
        } catch (error) {
            return memoryStorage[key] || null;
        }
    }

    function storageSet(key, value) {
        try {
            window.localStorage.setItem(key, value);
        } catch (error) {
            memoryStorage[key] = value;
        }
    }

    function storageRemove(key) {
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            delete memoryStorage[key];
        }
    }

    function readJson(key, fallback) {
        try {
            return JSON.parse(storageGet(key) || "") || fallback;
        } catch (error) {
            return fallback;
        }
    }

    function getUsers() {
        var users = readJson(USER_KEY, []);
        return Array.isArray(users) ? users : [];
    }

    function saveUsers(users) {
        storageSet(USER_KEY, JSON.stringify(users));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function hashPassword(password) {
        if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
            return Promise.resolve("demo-" + password);
        }

        var bytes = new TextEncoder().encode(password);
        return window.crypto.subtle.digest("SHA-256", bytes).then(function (buffer) {
            var view = new Uint8Array(buffer);
            var hex = "";
            for (var i = 0; i < view.length; i += 1) {
                hex += view[i].toString(16).padStart(2, "0");
            }
            return hex;
        });
    }

    function createUser(profile) {
        var users = getUsers();
        var username = normalize(profile.username);
        var email = normalize(profile.email);

        var duplicate = users.some(function (user) {
            return normalize(user.username) === username || normalize(user.email) === email;
        });

        if (duplicate) {
            return Promise.resolve({
                ok: false,
                message: "用户名或邮箱已注册，请直接登录"
            });
        }

        return hashPassword(profile.password).then(function (passwordHash) {
            users.push({
                name: String(profile.name || "").trim(),
                username: String(profile.username || "").trim(),
                email: String(profile.email || "").trim(),
                studentId: String(profile.studentId || "").trim(),
                role: String(profile.role || "student"),
                college: String(profile.college || ""),
                interests: Array.isArray(profile.interests) ? profile.interests : [],
                passwordHash: passwordHash,
                createdAt: new Date().toISOString()
            });
            saveUsers(users);
            return { ok: true };
        });
    }

    function login(account, password) {
        var users = getUsers();
        return hashPassword(password).then(function (passwordHash) {
            if (users.length === 0 && normalize(account) === "demo" && password === "Demo@123") {
                var demoUser = {
                    name: "演示同学",
                    username: "demo",
                    email: "demo@example.com",
                    studentId: "20260001",
                    role: "student",
                    college: "计算机学院",
                    interests: ["程序设计", "人工智能"]
                };
                setSession(demoUser);
                return { ok: true, user: demoUser };
            }

            var matched = users.find(function (user) {
                var accountMatches =
                    normalize(user.username) === normalize(account) ||
                    normalize(user.email) === normalize(account);
                return accountMatches && user.passwordHash === passwordHash;
            });

            if (!matched) {
                return { ok: false };
            }

            setSession(matched);
            return { ok: true, user: matched };
        });
    }

    function setSession(user) {
        storageSet(SESSION_KEY, JSON.stringify({
            name: user.name,
            username: user.username,
            email: user.email,
            studentId: user.studentId,
            role: user.role,
            college: user.college,
            interests: user.interests,
            loggedInAt: new Date().toISOString()
        }));
    }

    function getSession() {
        return readJson(SESSION_KEY, null);
    }

    function clearSession() {
        storageRemove(SESSION_KEY);
    }

    function showToast(message, type) {
        var toast = document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.className = "toast";
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = "toast " + (type || "");
        window.clearTimeout(showToast.timer);
        window.requestAnimationFrame(function () {
            toast.classList.add("show");
        });

        showToast.timer = window.setTimeout(function () {
            toast.classList.remove("show");
        }, 2400);
    }

    function setHint(input, hintId, message, state) {
        var hint = document.getElementById(hintId);
        if (!hint) {
            return;
        }

        hint.textContent = message || "";
        hint.className = "field-hint" + (state ? " " + state : "");
        input.setAttribute("aria-invalid", state === "error" ? "true" : "false");
    }

    function passwordToggle(button, input) {
        if (!button || !input) {
            return;
        }

        button.addEventListener("click", function () {
            var showing = input.type === "text";
            input.type = showing ? "password" : "text";
            button.textContent = showing ? "显示" : "隐藏";
            button.setAttribute("aria-pressed", String(!showing));
        });
    }

    window.AIPlatform = {
        createUser: createUser,
        getSession: getSession,
        getUsers: getUsers,
        login: login,
        logout: clearSession,
        setHint: setHint,
        setSession: setSession,
        showToast: showToast,
        togglePassword: passwordToggle
    };
})();
