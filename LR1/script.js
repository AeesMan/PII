const studentModal = document.getElementById('student-modal');
const deleteModal = document.getElementById('delete-modal');
const saveBtn = document.getElementById('save-student');
const tableBody = document.querySelector('#students-table tbody');

let currentRow = null;

// Відкрити модалку додавання
document.getElementById('open-add-modal').onclick = () => {
    currentRow = null;
    document.getElementById('modal-title').innerText = "Add student";
    saveBtn.innerText = "Create";
    studentModal.style.display = 'flex';
};

// Закриття всіх модалок
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.onclick = () => {
        studentModal.style.display = 'none';
        deleteModal.style.display = 'none';
    };
});

// Збереження (Додати або Редагувати)
saveBtn.onclick = () => {
    const group = document.getElementById('st-group').value;
    const name = `${document.getElementById('st-fname').value} ${document.getElementById('st-lname').value}`;
    
    if (currentRow) {
        currentRow.cells[1].innerText = group;
        currentRow.cells[2].innerText = name;
    } else {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${group}</td>
            <td>${name}</td>
            <td>M</td>
            <td>${document.getElementById('st-birth').value}</td>
            <td><span class="dot green"></span></td>
            <td>
                <button class="icon-btn edit-row"><i class="fa-solid fa-pen"></i></button> 
                <button class="icon-btn delete-row"><i class="fa-solid fa-xmark"></i></button>
            </td>
        `;
    }
    studentModal.style.display = 'none';
};

// Кліки по таблиці (Редагування/Видалення)
tableBody.onclick = (e) => {
    const row = e.target.closest('tr');
    if (e.target.closest('.delete-row')) {
        currentRow = row;
        document.getElementById('delete-text').innerText = `Are you sure you want to delete user ${row.cells[2].innerText}?`;
        deleteModal.style.display = 'flex';
    }
    if (e.target.closest('.edit-row')) {
        currentRow = row;
        document.getElementById('modal-title').innerText = "Edit student";
        saveBtn.innerText = "Save";
        studentModal.style.display = 'flex';
    }
};

// Підтвердження видалення
document.getElementById('confirm-delete').onclick = () => {
    if (currentRow) currentRow.remove();
    deleteModal.style.display = 'none';
};