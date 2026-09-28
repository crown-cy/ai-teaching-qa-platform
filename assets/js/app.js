(function () {
    "use strict";

    var params = new URLSearchParams(window.location.search);
    var previewMode = params.get("preview") === "1";
    var session = AIPlatform.getSession();

    if (!session && previewMode) {
        session = {
            name: "演示同学",
            username: "demo",
            email: "demo@example.com",
            studentId: "20260001",
            role: "student",
            college: "计算机学院",
            interests: ["程序设计", "人工智能"]
        };
        AIPlatform.setSession(session);
    }

    if (!session) {
        window.location.replace("login.html");
        return;
    }

    var conversation = document.getElementById("conversation");
    var emptyState = document.getElementById("emptyState");
    var suggestionRow = document.getElementById("suggestionRow");
    var questionForm = document.getElementById("questionForm");
    var questionInput = document.getElementById("questionInput");
    var questionFile = document.getElementById("questionFile");
    var questionCount = document.getElementById("questionCount");
    var sendButton = document.getElementById("sendButton");
    var clearButton = document.getElementById("clearButton");
    var logoutButton = document.getElementById("logoutButton");
    var userPill = document.getElementById("userPill");
    var courseButtons = Array.prototype.slice.call(document.querySelectorAll(".course-button"));
    var activeCourse = "Web前端开发";
    var chatKey = "ai_teaching_chat_" + String(session.username || "guest").toLowerCase();
    var messages = [];

    userPill.textContent = session.name + " · " + (session.role === "teacher" ? "教师" : "学生");

    function nowLabel() {
        return new Intl.DateTimeFormat("zh-CN", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date());
    }

    function setEmptyState() {
        var hidden = messages.length > 0;
        emptyState.hidden = hidden;
        suggestionRow.hidden = hidden;
    }

    function renderMessage(message) {
        var item = document.createElement("article");
        item.className = "message " + message.role;

        var meta = document.createElement("span");
        meta.className = "message-meta";
        meta.textContent = (message.role === "user" ? "我" : "AI助教") + " · " + message.time;

        var content = document.createElement("p");
        content.style.margin = "0";
        content.textContent = message.text;

        item.appendChild(meta);
        item.appendChild(content);
        conversation.appendChild(item);
    }

    function saveMessages() {
        if (previewMode) {
            return;
        }
        try {
            localStorage.setItem(chatKey, JSON.stringify(messages));
        } catch (error) {
            // The in-memory conversation still works when storage is unavailable.
        }
    }

    function loadMessages() {
        if (previewMode) {
            return [];
        }

        try {
            var stored = JSON.parse(localStorage.getItem(chatKey) || "[]");
            return Array.isArray(stored) ? stored : [];
        } catch (error) {
            return [];
        }
    }

    function addMessage(role, text) {
        var message = {
            role: role,
            text: text,
            time: nowLabel(),
            course: activeCourse
        };
        messages.push(message);
        renderMessage(message);
        setEmptyState();
        saveMessages();
        return message;
    }

    function scrollConversationToBottom() {
        conversation.scrollIntoView({
            block: "end",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
        });
    }

    function answerFor(question) {
        var text = question.toLowerCase();

        if (text.indexOf("表单") !== -1 || text.indexOf("html5") !== -1 || text.indexOf("input") !== -1) {
            return "HTML5 表单增强通常可以从四类能力说明：一是约束校验，如 required、pattern、minlength、maxlength、type=email；二是输入体验，如 autocomplete、inputmode、autofocus、enterkeyhint；三是状态反馈，如 validity、setCustomValidity 和 reportValidity；四是语义结构，如 fieldset、legend、meter、output。演示版已把这些能力组合在注册与登录页中。";
        }

        if (text.indexOf("let") !== -1 || text.indexOf("const") !== -1 || text.indexOf("javascript") !== -1) {
            return "let 声明可重新赋值的块级变量，const 声明块级常量，且常量必须在声明时初始化。对象或数组使用 const 时，绑定关系不能改变，但对象内部的属性仍然可以修改。若变量不需要重新赋值，优先使用 const，可以减少意外修改。";
        }

        if (text.indexOf("第三范式") !== -1 || text.indexOf("3nf") !== -1 || text.indexOf("数据库") !== -1) {
            return "第三范式可以先理解为：表已经满足第二范式，并且非主键字段之间不存在传递依赖。例如学生表不应同时保存学院编号和学院名称，因为学院名称依赖学院编号，而学院编号又依赖学生编号。更合理的做法是把学院信息拆成独立表，通过学院编号关联。";
        }

        if (text.indexOf("tcp") !== -1 || text.indexOf("三次握手") !== -1 || text.indexOf("网络") !== -1) {
            return "TCP 三次握手的目标是让双方确认彼此的发送和接收能力，并同步初始序号。典型过程为 SYN、SYN+ACK、ACK。它既建立连接状态，也避免旧的重复连接请求被误认为新连接。";
        }

        return "已收到你的问题。当前是第 1 至 8 周演示版本，AI 接口将在第 9 周接入；现在展示的是完整的多轮交互流程。正式接入后，建议在提问时补充课程、章节、代码、报错信息和期望结果，这样回答会更准确。";
    }

    function submitQuestion(question, attachmentName) {
        var cleanQuestion = String(question || "").trim();
        if (!cleanQuestion) {
            questionInput.reportValidity();
            return;
        }

        var displayQuestion = cleanQuestion;
        if (attachmentName) {
            displayQuestion += "\n附件：" + attachmentName;
        }

        addMessage("user", displayQuestion);
        questionInput.value = "";
        questionFile.value = "";
        questionCount.textContent = "0 / 500";
        sendButton.disabled = true;
        sendButton.textContent = "思考中";
        scrollConversationToBottom();

        var pending = document.createElement("article");
        pending.className = "message assistant";
        pending.innerHTML = '<span class="message-meta">AI助教 · 演示模式</span><p class="loading-dots" style="margin:0">正在整理答案</p>';
        conversation.appendChild(pending);
        setEmptyState();

        window.setTimeout(function () {
            pending.remove();
            addMessage("assistant", answerFor(cleanQuestion));
            sendButton.disabled = false;
            sendButton.textContent = "提问";
            scrollConversationToBottom();
            questionInput.focus();
        }, 720);
    }

    questionInput.addEventListener("input", function () {
        questionCount.textContent = questionInput.value.length + " / 500";
    });

    questionInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            questionForm.requestSubmit();
        }
    });

    questionForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!questionForm.checkValidity()) {
            questionForm.reportValidity();
            return;
        }

        var file = questionFile.files && questionFile.files[0];
        submitQuestion(questionInput.value, file ? file.name : "");
    });

    suggestionRow.addEventListener("click", function (event) {
        var button = event.target.closest("[data-question]");
        if (!button) {
            return;
        }
        questionInput.value = button.getAttribute("data-question");
        questionCount.textContent = questionInput.value.length + " / 500";
        questionForm.requestSubmit();
    });

    courseButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            courseButtons.forEach(function (item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
            activeCourse = button.getAttribute("data-course");
            AIPlatform.showToast("已切换到" + activeCourse);
        });
    });

    clearButton.addEventListener("click", function () {
        if (!window.confirm("确定清空当前账号的全部答疑记录吗？")) {
            return;
        }
        messages = [];
        conversation.innerHTML = "";
        setEmptyState();
        saveMessages();
        AIPlatform.showToast("答疑记录已清空");
    });

    logoutButton.addEventListener("click", function () {
        AIPlatform.logout();
        window.location.href = "login.html";
    });

    messages = loadMessages();
    messages.forEach(renderMessage);
    if (!messages.length) {
        addMessage("assistant", "你好，" + session.name + "。我是课程演示助教，可以围绕当前课程进行连续追问。正式 AI 接口将在第 9 周接入。");
    }
    setEmptyState();
})();
