// --- РЕЄСТРАЦІЯ SERVICE WORKER (Для PWA) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker зареєстровано!'))
            .catch(err => console.error('Помилка реєстрації SW:', err));
    });
}

// --- ЕЛЕМЕНТИ УПРАВЛІННЯ ---
const studentModal = document.getElementById('student-modal');
const deleteModal = document.getElementById('delete-modal');
const saveBtn = document.getElementById('save-student');
const tableBody = document.querySelector('#students-table tbody');
const menuToggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.querySelector('.sidebar');
const openAddBtn = document.getElementById('open-add-modal');

let currentRow = null;

// --- ІВЕНТИ ТА МОДАЛКИ ---

// Мобільне меню
if (menuToggle && sidebar) {
    menuToggle.onclick = (e) => {
        e.stopPropagation(); 
        sidebar.classList.toggle('open');
    };
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('open');
        }
    });
}

// Очищення форми
function resetForm() {
    if(document.getElementById('st-id')) document.getElementById('st-id').value = ''; 
    if(document.getElementById('st-group')) document.getElementById('st-group').value = 'KN-21'; 
    if(document.getElementById('st-fname')) document.getElementById('st-fname').value = '';
    if(document.getElementById('st-lname')) document.getElementById('st-lname').value = '';
    if(document.getElementById('st-gender')) document.getElementById('st-gender').value = 'Male';
    if(document.getElementById('st-birth')) document.getElementById('st-birth').value = '';
    if(document.getElementById('st-status')) document.getElementById('st-status').value = 'online';
}

// --- УНІВЕРСАЛЬНА ФУНКЦІЯ ВІДКРИТТЯ МОДАЛКИ ---
function openStudentModal(row = null) {
    currentRow = row; 
    
    if (row) {
        // РЕЖИМ РЕДАГУВАННЯ
        document.getElementById('modal-title').innerText = "Edit student";
        if (saveBtn) saveBtn.innerText = "Save";
        
        if(document.getElementById('st-id')) document.getElementById('st-id').value = row.getAttribute('data-id') || "";
        if(document.getElementById('st-group')) document.getElementById('st-group').value = row.cells[1].innerText;
        
        const fullName = row.cells[2].innerText.split(" ");
        if(document.getElementById('st-fname')) document.getElementById('st-fname').value = fullName[0] || "";
        if(document.getElementById('st-lname')) document.getElementById('st-lname').value = fullName[1] || "";
        
        if(document.getElementById('st-gender')) document.getElementById('st-gender').value = row.cells[3].innerText === 'F' ? 'Female' : 'Male';
        
        // НОВА ЛОГІКА ДАТИ: Забираємо ідеальну, незмінену дату з прихованого атрибута
        const rawDate = row.cells[4].getAttribute('data-raw-date');
        if (rawDate && document.getElementById('st-birth')) {
            document.getElementById('st-birth').value = rawDate; // Форма завжди вимагає YYYY-MM-DD
        }
    } else {
        // РЕЖИМ ДОДАВАННЯ
        resetForm(); 
        document.getElementById('modal-title').innerText = "Add student";
        if (saveBtn) saveBtn.innerText = "Create";
    }
    
    if (studentModal) studentModal.style.display = 'flex';
}

// Відкриття модалки додавання (передаємо null)
if (openAddBtn) {
    openAddBtn.onclick = () => openStudentModal(null);
}

// Закриття модалок
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = () => {
        if (studentModal) studentModal.style.display = 'none';
        if (deleteModal) deleteModal.style.display = 'none';
    };
});

// Кнопка Зберегти/Додати
if (saveBtn) {
    saveBtn.onclick = () => {
        const idField = document.getElementById('st-id');
        const id = idField && idField.value ? idField.value : Date.now().toString();
        
        const group = document.getElementById('st-group').value;
        const fname = document.getElementById('st-fname').value.trim();
        const lname = document.getElementById('st-lname').value.trim();
        const gender = document.getElementById('st-gender').value;
        const rawDate = document.getElementById('st-birth').value; // Отримуємо 'YYYY-MM-DD'
        const statusField = document.getElementById('st-status');
        const status = statusField ? statusField.value : 'online';

        if (!fname || !lname) {
            alert("Будь ласка, заповніть Ім'я та Прізвище.");
            return;
        }
        if (!rawDate) {
            alert("Будь ласка, оберіть дату народження.");
            return;
        }

        const studentData = {
            id: id,
            group: group,
            firstName: fname,
            lastName: lname,
            gender: gender,
            birthday: rawDate, 
            status: status
        };

        console.log("Дані для відправки на сервер:", JSON.stringify(studentData));
        
        const fullName = `${fname} ${lname}`;
        const genderShort = gender === 'Female' ? 'F' : 'M';
        
        // НОВА ЛОГІКА ДАТИ: Створюємо гарну дату для відображення, враховуючи налаштування юзера
        let formattedDate = "";
        if (rawDate) {
            // timeZone: 'UTC' гарантує, що браузер не змістить дату на 1 день назад через часові пояси
            formattedDate = new Date(rawDate).toLocaleDateString(undefined, { timeZone: 'UTC' }); 
        }

        if (currentRow) {
            currentRow.cells[1].innerText = group;
            currentRow.cells[2].innerText = fullName;
            currentRow.cells[3].innerText = genderShort;
            currentRow.cells[4].innerText = formattedDate;
            currentRow.cells[4].setAttribute('data-raw-date', rawDate);
            const statusDot = currentRow.cells[5].querySelector('.dot');
            if (statusDot) statusDot.className = `dot ${status}`;
        } else if (tableBody) {
            const row = tableBody.insertRow();
            row.setAttribute('data-id', id); 
            row.innerHTML = `
                <td data-label="Select"><input type="checkbox"></td>
                <td data-label="Group">${group}</td>
                <td data-label="Name">${fullName}</td>
                <td data-label="Gender">${genderShort}</td>
                <td data-label="Birthday" data-raw-date="${rawDate}">${formattedDate}</td>
                <td data-label="Status"><span class="dot ${status}"></span></td>
                <td data-label="Options">
                    <button class="icon-btn edit-row"><i class="fa-solid fa-pen"></i></button> 
                    <button class="icon-btn delete-row"><i class="fa-solid fa-xmark"></i></button>
                </td>
            `;
        }
        
        if (studentModal) studentModal.style.display = 'none';
    };
}

// Делегування кліків у таблиці (Редагування/Видалення)
if (tableBody) {
    tableBody.onclick = (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        // Видалення
        if (e.target.closest('.delete-row')) {
            currentRow = row;
            const deleteText = document.getElementById('delete-text');
            if (deleteText) deleteText.innerText = `Are you sure you want to delete user ${row.cells[2].innerText}?`;
            if (deleteModal) deleteModal.style.display = 'flex';
        }
        
        // Редагування
        if (e.target.closest('.edit-row')) {
            openStudentModal(row); 
        }
    };
}

// Підтвердження видалення
const confirmDeleteBtn = document.getElementById('confirm-delete');
if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = () => {
        if (currentRow) {
            currentRow.remove(); 
        }
        if (deleteModal) deleteModal.style.display = 'none';
    };
}