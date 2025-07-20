
// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Elements ---
    const openModalBtn = document.getElementById('open-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modal = document.getElementById('modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const eventForm = document.getElementById('event-form');
    const eventTableBody = document.getElementById('event-table-body');
    const filterKeyword = document.getElementById('filter-keyword');
    const filterStatus = document.getElementById('filter-status');
    const modalTitle = document.querySelector('#modal h3');

    // --- 2. State Management ---
    let events = [];
    let editingEventId = null;

    // --- 3. API Communication ---
    const API_URL = '/api/events';

    // --- 4. Function Definitions ---
    const createStatusBadge = (status) => {
        let colorClasses = 'bg-gray-100 text-gray-800'; // Draft
        if (status.toLowerCase() === 'matched') {
            colorClasses = 'bg-green-100 text-green-800';
        } else if (status.toLowerCase() === 'pending') {
            colorClasses = 'bg-yellow-100 text-yellow-800';
        }
        return `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}">${status}</span>`;
    };

    const renderEvents = () => {
        const keyword = filterKeyword.value.toLowerCase();
        const statusFilter = filterStatus.value.toLowerCase();

        const filteredEvents = events.filter(event => {
            const titleMatch = event.title.toLowerCase().includes(keyword);
            const statusMatch = statusFilter === 'all' || event.status.toLowerCase() === statusFilter;
            return titleMatch && statusMatch;
        });

        if (filteredEvents.length === 0) {
            eventTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-500">No events found.</td></tr>`;
            return;
        }

        eventTableBody.innerHTML = filteredEvents.map(event => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${event.title}</div></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.date}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${event.audienceSize}</td>
                <td class="px-6 py-4 whitespace-nowrap">${createStatusBadge(event.status)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button data-id="${event._id}" class="edit-btn text-indigo-600 hover:text-indigo-900"><span class="material-icons align-middle">edit</span></button>
                    <button data-id="${event._id}" class="delete-btn text-red-600 hover:text-red-900 ml-4"><span class="material-icons align-middle">delete</span></button>
                </td>
            </tr>
        `).join('');

        document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => editEvent(e.currentTarget.dataset.id)));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => deleteEvent(e.currentTarget.dataset.id)));
    };

    const fetchEvents = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            events = await response.json();
            renderEvents();
        } catch (error) {
            console.error('Failed to fetch events:', error);
            eventTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Could not load events. Is the server running?</td></tr>`;
        }
    };
    
    const openModal = () => {
        modal.classList.remove('hidden');
        modalBackdrop.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modalBackdrop.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
        eventForm.reset();
        editingEventId = null;
        modalTitle.textContent = 'Create New Event';
    };

    const deleteEvent = async (eventId) => {
        if (confirm('Are you sure you want to delete this event?')) {
            await fetch(`${API_URL}/${eventId}`, { method: 'DELETE' });
            fetchEvents();
        }
    };

    const editEvent = (eventId) => {
        const eventToEdit = events.find(e => e._id === eventId);
        if (!eventToEdit) return;
        editingEventId = eventId;
        modalTitle.textContent = 'Edit Event';
        document.getElementById('event-title').value = eventToEdit.title;
        document.getElementById('event-date').value = eventToEdit.date;
        document.getElementById('event-location').value = eventToEdit.location;
        document.getElementById('audience-type').value = eventToEdit.audience;
        document.getElementById('audience-size').value = eventToEdit.audienceSize;
        document.getElementById('sponsorship-requirements').value = eventToEdit.sponsorship;
        document.getElementById('event-description').value = eventToEdit.description;
        openModal();
    };

    // --- 5. Event Listeners & Initial Execution ---
    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    filterKeyword.addEventListener('input', renderEvents);
    filterStatus.addEventListener('change', renderEvents);

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(eventForm);
        const url = editingEventId ? `${API_URL}/${editingEventId}` : API_URL;
        const method = editingEventId ? 'PUT' : 'POST';
        try {
            const response = await fetch(url, { method, body: formData });
            if (!response.ok) throw new Error('Failed to save event');
            fetchEvents();
            closeModal();
        } catch (error) {
            console.error('Submission error:', error);
            alert('Could not save the event. Please try again.');
        }
    });

    fetchEvents(); // Initial load of events from the server
});
        
