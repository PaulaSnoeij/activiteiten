import { redirect } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000/events';

export async function loadEvent({ params }) {
  const { eventId } = params;
  const response = await fetch(`${BASE_URL}/${eventId}`);

  if (!response.ok) {
    console.error('❌ Event niet gevonden:', eventId);
    throw new Response('Evenement niet gevonden', { status: 404 });
  }

  const event = await response.json();

  // Herstel afwijkende tijdsstructuur als die bestaat
  const isTimeOnly = (value) => typeof value === 'string' && /^\d{2}:\d{2}$/.test(value);

  if (isTimeOnly(event.startTime) && event.date) {
    event.startTime = new Date(`${event.date}T${event.startTime}:00`).toISOString();
  }

  if (isTimeOnly(event.endTime) && event.endDate) {
    event.endTime = new Date(`${event.endDate}T${event.endTime}:00`).toISOString();
  }

  return event;
}

export async function updateEvent({ params, request }) {
    const {eventId } = params;
  const formData = await request.formData();

  const title = formData.get('title');
  const description = formData.get('description');
  const image = formData.get('image');
  const location = formData.get('location');
  const date = formData.get('date');
  const endDate = formData.get('endDate') || date;
  const startTime = formData.get('startTime');
  const endTime = formData.get('endTime');
  const createdBy = Number(formData.get('userId'));
const categoryIds = formData.getAll('categoryIds').map(Number);

  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);

  if (startDateTime >= endDateTime) {
    throw new Error('De eindtijd moet na de starttijd liggen.');
  }

  const updatedEvent = {
    title,
    description,
    image,
    location,
    startTime: startDateTime.toISOString(),
    endTime: endDateTime.toISOString(),
    categoryIds,
    createdBy,
  };

    const response = await fetch(`${BASE_URL}/${params.eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedEvent),
  });

    if (!response.ok) {
    console.error('❌ Fout bij bijwerken evenement:', response.statusText);
    throw new Error('Kon evenement niet bijwerken');
  }

  return redirect('/');
}
