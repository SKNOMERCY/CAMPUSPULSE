// js/student.js

function renderStudentPage() {
    const container = document.getElementById('eventsContainer');
    container.innerHTML = '';
    allEvents.forEach(e => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${e.title}</h3>
            <p>Type: ${e.type} | Date: ${e.date}</p>
            <p>${e.description}</p>
        `;
        container.appendChild(card);
    });
}
