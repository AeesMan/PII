// --- ЕЛЕМЕНТИ УПРАВЛІННЯ ---
const studentModal = document.getElementById('student-modal');
const deleteModal = document.getElementById('delete-modal');
const saveBtn = document.getElementById('save-student');
const tableBody = document.querySelector('#students-table tbody');
const menuToggle = document.getElementById('mobile-menu-toggle');
const sidebar = document.querySelector('.sidebar');
const openAddBtn = document.getElementById('open-add-modal');

let currentRow = null;

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

// --- ЛОГІКА ТАБЛИЦІ ТА МОДАЛОК ---

// Відкрити модалку додавання
if (openAddBtn) {
    openAddBtn.onclick = () => {
        currentRow = null;
        document.getElementById('modal-title').innerText = "Add student";
        if (saveBtn) saveBtn.innerText = "Create";
        if (studentModal) studentModal.style.display = 'flex';
    };
}

// Закриття всіх модалок
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = () => {
        if (studentModal) studentModal.style.display = 'none';
        if (deleteModal) deleteModal.style.display = 'none';
    };
});

// Збереження (Додати або Редагувати)
if (saveBtn) {
    saveBtn.onclick = () => {
        const group = document.getElementById('st-group').value;
        const fname = document.getElementById('st-fname').value;
        const lname = document.getElementById('st-lname').value;
        const name = `${fname} ${lname}`;
        const status = document.getElementById('st-status') ? document.getElementById('st-status').value : 'online';
        
        const rawDate = document.getElementById('st-birth').value; 
        let formattedDate = "";
        if (rawDate) {
            const dateParts = rawDate.split("-"); 
            formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; 
        }

        if (currentRow) {
            // Режим редагування
            currentRow.cells[1].innerText = group;
            currentRow.cells[2].innerText = name;
            currentRow.cells[4].innerText = formattedDate;
            
            const statusDot = currentRow.cells[5].querySelector('.dot');
            if (statusDot) {
                statusDot.className = `dot ${status}`;
            }
        } else if (tableBody) {
            // Режим додавання
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td data-label="Select"><input type="checkbox"></td>
                <td data-label="Group">${group}</td>
                <td data-label="Name">${name}</td>
                <td data-label="Gender">M</td>
                <td data-label="Birthday">${formattedDate}</td>
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

// Кліки по таблиці (Редагування/Видалення)
if (tableBody) {
    tableBody.onclick = (e) => {
        const row = e.target.closest('tr');
        if (!row) return;

        if (e.target.closest('.delete-row')) {
            currentRow = row;
            const deleteText = document.getElementById('delete-text');
            if (deleteText) deleteText.innerText = `Are you sure you want to delete user ${row.cells[2].innerText}?`;
            if (deleteModal) deleteModal.style.display = 'flex';
        }
        
        if (e.target.closest('.edit-row')) {
            currentRow = row;
            document.getElementById('modal-title').innerText = "Edit student";
            if (saveBtn) saveBtn.innerText = "Save";
            if (studentModal) studentModal.style.display = 'flex';
            
            const fullName = row.cells[2].innerText.split(" ");
            document.getElementById('st-fname').value = fullName[0] || "";
            document.getElementById('st-lname').value = fullName[1] || "";
            document.getElementById('st-group').value = row.cells[1].innerText;
        }
    };
}

// Підтвердження видалення
const confirmDeleteBtn = document.getElementById('confirm-delete');
if (confirmDeleteBtn) {
    confirmDeleteBtn.onclick = () => {
        if (currentRow) currentRow.remove();
        if (deleteModal) deleteModal.style.display = 'none';
    };
}