// --- РЕЄСТРАЦІЯ SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker зареєстровано!'))
            .catch(err => console.error('Помилка реєстрації SW:', err));
    });
}

// --- МІНІ-ФУНКЦІЯ ДЛЯ СКОРОЧЕННЯ ---
const $ = (sel) => document.querySelector(sel);

// --- ЕЛЕМЕНТИ УПРАВЛІННЯ ---
const studentModal = $('#student-modal');
const deleteModal = $('#delete-modal');
const saveBtn = $('#save-student');
const tableBody = $('#students-table tbody');
const menuToggle = $('#mobile-menu-toggle');
const sidebar = $('.sidebar');
const openAddBtn = $('#open-add-modal');
const confirmDeleteBtn = $('#confirm-delete');

const inpId = $('#st-id');
const inpGroup = $('#st-group');
const inpF = $('#st-fname');
const inpL = $('#st-lname');
const inpGender = $('#st-gender');
const inpBirth = $('#st-birth');
const inpStatus = $('#st-status');
const modalTitle = $('#modal-title');

// --- ДОПОМІЖНІ ФУНКЦІЇ ---

// Закриття модалки
function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.style.display = "none";
    modalEl.setAttribute("aria-hidden", "true");
}

// Перевірка імені на цифри
function isValidName(value) {
    return /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/.test(value.trim());
}

// Очищення візуальних помилок
function clearErrors() {
    document.querySelectorAll('.invalid').forEach(el => {
        el.classList.remove('invalid');
    });
}

// Допоміжна функція для безпечного відображення помилки
function showError(element) {
    if (!element) return;
    const wrapper = element.closest('.input-wrapper') || element.parentElement;
    if (wrapper) {
        wrapper.classList.add('invalid');
    }
}

function resetForm() {
    clearErrors();
    if(inpId) inpId.value = ''; 
    if(inpGroup) inpGroup.value = '0'; 
    if(inpF) inpF.value = '';
    if(inpL) inpL.value = '';
    if(inpGender) inpGender.value = '0';
    if(inpBirth) inpBirth.value = '';
    if(inpStatus) inpStatus.value = '0';
}

// Відкриття модалки додавання/редагування
function openStudentModal(row = null) {
    clearErrors();
    
    if (row) {
        // РЕДАГУВАННЯ
        modalTitle.innerText = "Edit student";
        if (saveBtn) saveBtn.innerText = "Save";
    
        if(inpId) inpId.value = row.dataset.id || "";
        if(inpGroup) inpGroup.value = row.dataset.group || "1";
        if(inpGender) inpGender.value = row.dataset.gender || "1";
        if(inpStatus) inpStatus.value = row.dataset.status || "1";
        
        const fullName = row.cells[2].innerText.split(" ");
        if(inpF) inpF.value = fullName[0] || "";
        if(inpL) inpL.value = fullName[1] || "";
        
        const rawDate = row.dataset.rawDate;
        if (rawDate && inpBirth) inpBirth.value = rawDate; 
    } else {
        // ДОДАВАННЯ
        resetForm(); 
        modalTitle.innerText = "Add student";
        if (saveBtn) saveBtn.innerText = "Create";
    }
    
    if (studentModal) {
        studentModal.style.display = 'flex';
        studentModal.setAttribute("aria-hidden", "false");
    }
}

// --- ІВЕНТИ ---

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

if (openAddBtn) {
    openAddBtn.onclick = () => openStudentModal(null);
}

// Закриття модалок по хрестику та "Cancel"
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = () => {
        closeModal(studentModal);
        closeModal(deleteModal);
    };
});

// Закриття модалок при кліку на темний фон
[studentModal, deleteModal].forEach(m => {
    if (m) {
        m.addEventListener("click", (e) => {
            if (e.target === m) closeModal(m);
        });
    }
});

// ЛОГІКА ЗБЕРЕЖЕННЯ
if (saveBtn) {
    saveBtn.onclick = () => {
        clearErrors();
        let hasErrors = false; 

        const fname = inpF.value.trim();
        const lname = inpL.value.trim();
        const rawDate = inpBirth.value; 
        const groupValue = inpGroup.value;
        const genderValue = inpGender.value;
        const statusValue = inpStatus ? inpStatus.value : '0'; 

        // Валідація з перевіркою тексту і селектів
        if (!fname || !isValidName(fname)) { showError(inpF); hasErrors = true; }
        if (!lname || !isValidName(lname)) { showError(inpL); hasErrors = true; }
        if (!rawDate) { showError(inpBirth); hasErrors = true; }
        
        // Візуальна валідація замість alert
        if (groupValue === "0") { showError(inpGroup); hasErrors = true; }
        if (genderValue === "0") { showError(inpGender); hasErrors = true; }
        if (statusValue === "0") { showError(inpStatus); hasErrors = true; }

        // Якщо є помилки - зупиняємо збереження
        if (hasErrors) return; 
        
        const existingId = inpId ? inpId.value : "";
        const isEditing = existingId !== ""; 
        const id = isEditing ? existingId : Date.now().toString();

        // Формуємо JSON
        const studentData = {
            id: id,
            group: groupValue,
            firstName: fname,
            lastName: lname,
            gender: genderValue,
            birthday: rawDate, 
            status: statusValue
        };

        console.log("Дані для сервера:", JSON.stringify(studentData));
        
        const fullName = `${fname} ${lname}`;
        const groupText = groupValue === "2" ? "KN-22" : "KN-21";
        const genderShort = genderValue === "2" ? "F" : "M";
        const statusText = statusValue === "2" ? "offline" : "online";
        
        let formattedDate = "";
        if (rawDate) {
            formattedDate = new Date(rawDate).toLocaleDateString(undefined, { timeZone: 'UTC' }); 
        }

        if (isEditing) {
            const targetRow = document.querySelector(`tr[data-id="${id}"]`);
            if (targetRow) {
                targetRow.dataset.group = groupValue;
                targetRow.dataset.gender = genderValue;
                targetRow.dataset.status = statusValue;
                targetRow.dataset.rawDate = rawDate;
                
                targetRow.cells[1].innerText = groupText;
                targetRow.cells[2].innerText = fullName;
                targetRow.cells[3].innerText = genderShort;
                targetRow.cells[4].innerText = formattedDate;
                
                const statusDot = targetRow.cells[5].querySelector('.dot');
                if (statusDot) statusDot.className = `dot ${statusText}`;
            }
        } else if (tableBody) {
            const row = tableBody.insertRow();
            row.dataset.id = id;
            row.dataset.group = groupValue;
            row.dataset.gender = genderValue;
            row.dataset.status = statusValue;
            row.dataset.rawDate = rawDate;
            
            row.innerHTML = `
                <td data-label="Select"><input type="checkbox"></td>
                <td data-label="Group">${groupText}</td>
                <td data-label="Name">${fullName}</td>
                <td data-label="Gender">${genderShort}</td>
                <td data-label="Birthday">${formattedDate}</td>
                <td data-label="Status"><span class="dot ${statusText}"></span></td>
                <td data-label="Options">
                    <button class="icon-btn edit-row"><i class="fa-solid fa-pen"></i></button> 
                    <button class="icon-btn delete-row"><i class="fa-solid fa-xmark"></i></button>
                </td>
            `;
        }
        
        closeModal(studentModal);
    };
}

// Делегування кліків у таблиці 
if (tableBody) {
    tableBody.onclick = (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        if (e.target.closest('.delete-row')) {
            const rowId = row.dataset.id;
            if (confirmDeleteBtn) confirmDeleteBtn.dataset.targetId = rowId;
            
            const deleteText = $('#delete-text');
            if (deleteText) deleteText.innerText = `Are you sure you want to delete user ${row.cells[2].innerText}?`;
            
            if (deleteModal) {
                deleteModal.style.display = 'flex';
                deleteModal.setAttribute("aria-hidden", "false");
            }
        }
        
        if (e.target.closest('.edit-row')) {
            openStudentModal(row); 
        }
    };
}

// Підтвердження видалення
if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = () => {
        const targetId = confirmDeleteBtn.dataset.targetId;
        if (targetId) {
            const rowToDelete = document.querySelector(`tr[data-id="${targetId}"]`);
            if (rowToDelete) rowToDelete.remove();
        }
        closeModal(deleteModal);
    };
}