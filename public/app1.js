// public/app1.js
document.addEventListener('DOMContentLoaded', function () {
    // --- 1. UI Element Selectors ---
    const eventGrid = document.getElementById('event-grid');
    const modal = document.getElementById('event-modal');
    const modalBackdrop = document.getElementById('event-modal-backdrop');
    const closeModalButton = document.getElementById('close-modal-button');
    const modalTitle = document.getElementById('modal-title');
    const modalContentArea = document.getElementById('modal-content-area');

    // --- 2. State Management ---
    let events = [];
    const API_URL = '/api/events';

    // --- 3. Function Definitions ---
    const openModal = (event) => {
        modalTitle.textContent = event.title;
        modalContentArea.innerHTML = `
            <img src="${event.imageUrl}" alt="Event Image" class="w-full h-48 object-cover rounded-md mb-4 bg-gray-200">
            <p class="text-gray-700 mb-4">${event.description}</p>
            <div class="text-sm text-gray-600 space-y-2">
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Audience:</strong> ${event.audience} (${event.audienceSize} people)</p>
                <p><strong>Sponsorship Needs:</strong> ${event.sponsorship}</p>
            </div>`;
        modal.classList.remove('hidden');
        modalBackdrop.classList.remove('hidden');
    };
    
    const closeModal = () => {
        modal.classList.add('hidden');
        modalBackdrop.classList.add('hidden');
    };

    const renderEvents = () => {
        if (events.length === 0) {
            eventGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No events available for sponsorship at the moment.</p>`;
            return;
        }
        eventGrid.innerHTML = events.map(event => {
            const isMatched = event.status.toLowerCase() === 'matched';
            return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <div class="w-full h-40 bg-gray-200"><img src="${event.imageUrl}" alt="${event.title}" class="w-full h-full object-cover"></div>
                <div class="p-4 flex flex-col flex-grow">
                    <h3 class="font-bold text-lg text-gray-800">${event.title}</h3>
                    <p class="text-sm text-gray-500">${event.date}</p>
                    <p class="text-sm text-gray-600 mt-2">Audience: ${event.audience}</p>
                    <div class="mt-4 flex justify-between items-center">
                        <button data-event-id="${event._id}" class="view-details-btn text-indigo-600 font-semibold text-sm">View Details</button>
                        ${isMatched 
                            ? `<span class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Sponsored</span>`
                            : `<button data-event-id="${event._id}" class="sponsor-btn bg-indigo-600 text-white px-3 py-1 rounded-md font-semibold text-sm hover:bg-indigo-700">Sponsor</button>`
                        }
                    </div>
                </div>
            </div>`;
        }).join('');
        
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const event = events.find(ev => ev._id === e.target.dataset.eventId);
                if (event) openModal(event);
            });
        });
        document.querySelectorAll('.sponsor-btn').forEach(button => {
            button.addEventListener('click', (e) => sponsorEvent(e.target.dataset.eventId));
        });
    };

    const sponsorEvent = async (eventId) => {
        try {
            const response = await fetch(`${API_URL}/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Matched' })
            });
            if (!response.ok) throw new Error('Failed to sponsor event');
            fetchEvents();
        } catch (error) {
            console.error('Sponsor action failed:', error);
            alert('Could not sponsor the event. Please try again.');
        }
    };
    
    const fetchEvents = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            events = await response.json();
            renderEvents();
        } catch (error) {
            console.error('Failed to fetch events:', error);
            eventGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">Could not load events. Please try again later.</p>`;
        }
    };

    // --- 4. Event Listeners & Initial Execution ---
    closeModalButton.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    fetchEvents(); // Initial load of events
});
