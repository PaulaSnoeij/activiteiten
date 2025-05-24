import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Image, Spinner, Avatar, Flex, Divider } from '@chakra-ui/react';


export const EventPage = () => {
  const { eventId } = useParams();
  const [creator, setCreator] = useState(null);
  const [categories, setCategories] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  Promise.all([
    fetch(`http://localhost:3000/events/${eventId}`).then(res => {
      if (!res.ok) throw new Error('Evenement niet gevonden');
      return res.json();
    }),
    fetch('http://localhost:3000/users').then(res => res.json()),
    fetch('http://localhost:3000/categories').then(res => res.json())
  ])
    .then(([eventData, users, categoriesData]) => {
      setEvent(eventData);
      setCategories(
        categoriesData.filter(category => eventData.categoryIds.includes(category.id))
      );
      const foundUser = users.find(user => user.id === eventData.createdBy);
      setCreator(foundUser || null);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError('Evenement niet gevonden');
      setLoading(false);
    });
}, [eventId]);

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">{error}</Text>;

return (
  <Box p="2rem" maxW="600px" mx="auto">
    <Heading mb="1rem">{event.title}</Heading>
    <Image src={event.image} alt={event.title} borderRadius="md" mb="1rem" />
    <Text mb="1rem">{event.description}</Text>

    <Text>
      <strong>Start:</strong>{' '}
      {new Date(event.startTime).toLocaleDateString('nl-NL')} – <strong>Tijd:</strong>{' '}
      {new Date(event.startTime).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Text>

    <Text>
      <strong>Einde:</strong>{' '}
      {new Date(event.endTime).toLocaleDateString('nl-NL')} – <strong>Tijd:</strong>{' '}
      {new Date(event.endTime).toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
      })}
    </Text>
    {/* Creator */}
    {creator && (
      <>
        <Divider my="1.5rem" />
        <Flex align="center">
          <Avatar name={creator.name} src={creator.avatar|| undefined } mr="1rem" />
          <Text fontSize="md">
            <strong>Georganiseerd door:</strong> {creator.name}
          </Text>
        </Flex>
      </>
    )}

    {/* Categories */}
    {categories.length > 0 && (
      <>
        <Divider my="1.5rem" />
        <Text>
          <strong>Categorieën:</strong> {categories.map(c => c.name).join(', ')}
        </Text>
      </>
    )}
  </Box>
);
}

