import { redirect, json } from 'react-router-dom';

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

  // Voeg fallback toe voor events met los datum/tijdformaat
  if (isTimeOnly(event.startTime) && event.date) {
    event.startTime = new Date(`${event.date}T${event.startTime}:00`).toISOString();
  }

  if (isTimeOnly(event.endTime)) {
    const endDateToUse = event.endDate || event.date;
    if (endDateToUse) {
      event.endTime = new Date(`${endDateToUse}T${event.endTime}:00`).toISOString();
    }
  }

  return event;
}

export async function updateEvent({ params, request }) {
  const { eventId } = params;
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

  // 🛑 Validatie: check of de datums geldig zijn
  if (isNaN(startDateTime) || isNaN(endDateTime)) {
    return json({ error: 'Ongeldige datum of tijd ingevoerd.' }, { status: 400 });
  }

  // 🛑 Validatie: eindtijd na starttijd
  if (startDateTime >= endDateTime) {
    return json({ error: 'De eindtijd moet na de starttijd liggen.' }, { status: 400 });
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

  const response = await fetch(`${BASE_URL}/${eventId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedEvent),
  });

  if (!response.ok) {
    console.error('❌ Fout bij bijwerken evenement:', response.statusText);
    return json({ error: 'Kon evenement niet bijwerken' }, { status: 500 });
  }

  return redirect('/');
}
