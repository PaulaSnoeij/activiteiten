import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Heading,
  Image,
  Text,
  Flex,
  Avatar,
} from '@chakra-ui/react';
import data from '../data/events.json'; // ← bevat users, events, categories

export const EventPage = () => {
  const { eventId } = useParams(); // Haalt event ID uit URL

console.log("ID uit useParams():", eventId); 
console.log("Alle events:", data.events);


  // Format helpers
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('nl-NL');
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

const getUserById = (id) => {
  return data.users.find((user) => String(user.id) === String(id));
};

const getCategoryNames = (categoryIds) => {
  return categoryIds
    .map((id) =>
      data.categories.find((cat) => String(cat.id) === String(id))?.name
    )
    .filter(Boolean)
    .join(', ');
};

const event = data.events.find((e) => String(e.id) === String(eventId));
console.log("Gevonden event:", event);


  if (!event) {
    return <Text>Evenement niet gevonden.</Text>;
  }

  const creator = getUserById(event?.createdBy);  

  return (
    <Box p={4}>
      <Heading mb={4}>{event.title}</Heading>
      <Image
        src={event.image || 'https://via.placeholder.com/800x300?text=Geen+afbeelding'}
        alt={event.title}
        borderRadius="md"
        mb={4}
        objectFit="cover"
        w="100%"
        maxH="300px"
      />
      <Text><strong>Beschrijving:</strong> {event.description}</Text>
      <Text><strong>Locatie:</strong> {event.location}</Text>
      <Text><strong>Datum:</strong> {formatDate(event.startTime)}</Text>
      <Text><strong>Starttijd:</strong> {formatTime(event.startTime)}</Text>
      <Text><strong>Eindtijd:</strong> {formatTime(event.endTime)}</Text>
      <Text><strong>Categorieën:</strong> {getCategoryNames(event.categoryIds)}</Text>
        {creator ? (
  <Flex align="center" mt={4}>
    <Avatar src={creator.image} name={creator.name} mr={2} />
    <Text>Georganiseerd door: {creator.name}</Text>
  </Flex>
) : (
  <Text mt={4}><em>Organisator onbekend</em></Text>
)}
      
    </Box>
  );
};
