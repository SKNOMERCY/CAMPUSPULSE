// js/admin.js

function renderAdminPage() {
    const container = document.getElementById('adminEventsContainer');
    container.innerHTML = '';
    allEvents.forEach((e, idx) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${e.title}</h3>
            <p>Type: ${e.type} | Date: ${e.date}</p>
            <p>${e.description}</p>
            <button onclick="deleteEvent(${idx})">Delete</button>
        `;
        container.appendChild(card);
    });
}

function deleteEvent(index) {
    allEvents.splice(index, 1);
    renderAdminPage();
}
