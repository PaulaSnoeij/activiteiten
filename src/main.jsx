import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { EventPage } from './pages/EventPage';
import { EventsPage } from './pages/EventsPage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root } from './components/Root';
import { ChangeEventForm } from './components/ChangeEventForm';
import { loadEvent, updateEvent } from './loaders/updateEvent';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <EventsPage />,
      },
      {
        path: '/event/:eventId',
        element: <EventPage />,
      },
      {
        path: '/event/:eventId/edit',
        element: <ChangeEventForm />,
        loader: loadEvent,
        action: updateEvent,
        errorElement: <p>Fout bij laden of opslaan van het event.</p>,
      },
    ],
  },
]);
// @ts-ignore
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
