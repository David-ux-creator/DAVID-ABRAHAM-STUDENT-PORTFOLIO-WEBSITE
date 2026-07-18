/* =========================================================================
   COS 106 STUDENT PORTFOLIO — David Abraham — script.js
   Shared across all pages. Every feature checks the DOM before running,
   so this one file is safe to include on every page.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  highlightActiveNavLink();
  initScrollReveal();
  initTerminalIntro();
  initSkillBars();
  initPlanner();
  initContactForm();
});

/* ---------------------------------------------------------------------
   1. Responsive navigation (hamburger toggle on mobile)
--------------------------------------------------------------------- */
function initNav(){
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close the mobile menu after a link is tapped
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* Marks the nav link matching the current page as active */
function highlightActiveNavLink(){
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });
}

/* ---------------------------------------------------------------------
   2. Scroll reveal — fades sections in as they enter the viewport
--------------------------------------------------------------------- */
function initScrollReveal(){
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)){
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------------------
   3. Terminal boot intro on the homepage hero (the site's signature
      element). Types out a short "whoami" session line by line.
--------------------------------------------------------------------- */
function initTerminalIntro(){
  const body = document.getElementById('terminalBody');
  if (!body) return;

  const lines = [
    { prompt: 'whoami', delay: 500 },
    { output: 'David Abraham', delay: 350, cls: 'ok' },
    { prompt: 'cat role.txt', delay: 500 },
    { output: 'Cybersecurity student, Miva Open University', delay: 250 },
    { output: 'Visual Identity Designer for Nigerian brands', delay: 250 },
    { prompt: 'status --check', delay: 500 },
    { output: 'Learning. Building. Securing. ✔', delay: 300, cls: 'ok' },
  ];

  body.innerHTML = '';
  let lineIndex = 0;

  function typeLine(){
    if (lineIndex >= lines.length){
      const cursorLine = document.createElement('div');
      cursorLine.className = 'terminal-line';
      cursorLine.innerHTML = '<span class="prompt-sign">david@miva:~$</span><span class="cursor"></span>';
      body.appendChild(cursorLine);
      return;
    }

    const item = lines[lineIndex];
    const row = document.createElement('div');
    row.className = 'terminal-line';

    if (item.prompt){
      row.innerHTML = `<span class="prompt-sign">david@miva:~$</span><span class="typed"></span>`;
      body.appendChild(row);
      typeText(row.querySelector('.typed'), item.prompt, () => {
        lineIndex++;
        setTimeout(typeLine, item.delay);
      });
    } else {
      row.innerHTML = `<span class="out ${item.cls || ''}">${item.output}</span>`;
      body.appendChild(row);
      lineIndex++;
      setTimeout(typeLine, item.delay);
    }
  }

  function typeText(el, text, done){
    let i = 0;
    const speed = 28;
    (function step(){
      if (i <= text.length){
        el.textContent = text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        done();
      }
    })();
  }

  typeLine();
}

/* ---------------------------------------------------------------------
   4. Animated skill bars on the About page
--------------------------------------------------------------------- */
function initSkillBars(){
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const target = entry.target;
        target.style.width = target.dataset.level + '%';
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => observer.observe(bar));
}

/* ---------------------------------------------------------------------
   5. Academic Planner — full CRUD task manager with localStorage
--------------------------------------------------------------------- */
function initPlanner(){
  const form = document.getElementById('plannerForm');
  const input = document.getElementById('taskInput');
  const list = document.getElementById('taskList');
  const countEl = document.getElementById('taskCount');
  const emptyState = document.getElementById('plannerEmpty');
  const filterButtons = document.querySelectorAll('.filter-btn');
  if (!form || !input || !list) return;

  const STORAGE_KEY = 'cos106_planner_tasks';
  let tasks = loadTasks();
  let currentFilter = 'all';

  function loadTasks(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err){
      return [];
    }
  }

  function saveTasks(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
    catch (err) { /* localStorage unavailable — tasks stay in memory only */ }
  }

  function addTask(text){
    tasks.push({ id: Date.now().toString(36), text, completed: false });
    saveTasks();
    render();
  }

  function toggleTask(id){
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    render();
  }

  function deleteTask(id){
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  function visibleTasks(){
    if (currentFilter === 'active') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  }

  function render(){
    list.innerHTML = '';
    const shown = visibleTasks();

    if (shown.length === 0){
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      shown.forEach(task => list.appendChild(renderTaskItem(task)));
    }

    const remaining = tasks.filter(t => !t.completed).length;
    countEl.innerHTML = `<span class="num">${remaining}</span> task${remaining === 1 ? '' : 's'} remaining`;
  }

  function renderTaskItem(task){
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const check = document.createElement('button');
    check.className = 'task-check' + (task.completed ? ' checked' : '');
    check.setAttribute('aria-label', task.completed ? 'Mark task as not completed' : 'Mark task as completed');
    check.innerHTML = task.completed ? '✔' : '';
    check.addEventListener('click', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const del = document.createElement('button');
    del.className = 'task-delete';
    del.setAttribute('aria-label', 'Delete task');
    del.innerHTML = '✕';
    del.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(check);
    li.appendChild(span);
    li.appendChild(del);
    return li;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    addTask(value);
    input.value = '';
    input.focus();
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
}

/* ---------------------------------------------------------------------
   6. Contact form — inline validation, no page reload, no backend
--------------------------------------------------------------------- */
function initContactForm(){
  const form = document.getElementById('contactForm');
  if (!form) return;

  const successBox = document.getElementById('formSuccess');
  const fields = {
    name: { input: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { input: document.getElementById('email'), error: document.getElementById('emailError') },
    phone: { input: document.getElementById('phone'), error: document.getElementById('phoneError') },
    message: { input: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]+$/;

  function setError(field, message){
    fields[field].error.textContent = message;
    fields[field].input.closest('.field').classList.toggle('has-error', Boolean(message));
  }

  function validateField(field){
    const value = fields[field].input.value.trim();

    if (!value){
      setError(field, 'This field cannot be empty.');
      return false;
    }
    if (field === 'email' && !emailPattern.test(value)){
      setError(field, 'Enter a valid email address (e.g. name@example.com).');
      return false;
    }
    if (field === 'phone' && !phonePattern.test(value)){
      setError(field, 'Phone number should contain digits only.');
      return false;
    }
    setError(field, '');
    return true;
  }

  Object.keys(fields).forEach(field => {
    fields[field].input.addEventListener('blur', () => validateField(field));
    fields[field].input.addEventListener('input', () => {
      if (fields[field].input.closest('.field').classList.contains('has-error')){
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successBox.classList.remove('show');

    const results = Object.keys(fields).map(validateField);
    const allValid = results.every(Boolean);

    if (allValid){
      // No backend — simulate a successful submission.
      successBox.textContent = `Thanks, ${fields.name.input.value.trim()}! Your message has been received. David will get back to you soon.`;
      successBox.classList.add('show');
      form.reset();
    } else {
      successBox.classList.remove('show');
      const firstError = form.querySelector('.field.has-error input, .field.has-error textarea');
      if (firstError) firstError.focus();
    }
  });
}