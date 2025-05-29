import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, 
         Button,
         Checkbox,
         CheckboxGroup,
         Flex,
         FormControl,
         FormErrorMessage,
         FormLabel,
         Heading, 
         Input,
         Stack,
         Text,
         Textarea, 
        } from '@chakra-ui/react';
import { parseISOToFormFields } from '../utils/dateTimeHelpers';
import { useToast } from '@chakra-ui/react';

const toast = useToast();

// In je try-blok na succesvolle update:
toast({
  title: 'Evenement opgeslagen.',
  description: 'Je wijzigingen zijn succesvol doorgevoerd.',
  status: 'success',
  duration: 3000,
  isClosable: true,
});


export const ChangeEventForm = () => {
  const { eventId } = useParams();
//   const event = data.events.find((e) => String(e.id) === String(eventId));
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    description: '',
    location: '',
    date: '',
    startTime: '',
    endDate: '',
    endTime: '',
    categoryIds: [],
  });

 useEffect(() => {
    fetch(`http://localhost:3000/events/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);

setFormData({
  ...data,
  ...parseISOToFormFields(data.startTime, data.endTime),
});

      })
      .catch((err) => console.error('Fout bij ophalen evenement:', err));
  }, [eventId]);

  // Haal categorieën op
  useEffect(() => {
    fetch('http://localhost:3000/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch((err) => console.error('Fout bij ophalen categorieën:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulier verzonden met data:', formData);

    const { date, endDate, startTime, endTime } = formData;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${endDate || date}T${endTime}`);

    if (start >= end) {
      alert('De eindtijd moet na de starttijd liggen.');
      return;
    }
    
    
    const updatedEvent = {
      ...event,
      title: formData.title,
      description: formData.description,
      image: formData.image,
      location: formData.location,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      categoryIds: formData.categoryIds.filter((id) => !isNaN(id)),
    };

    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) throw new Error('Fout bij bijwerken event');

      alert('Evenement succesvol bijgewerkt!');
      navigate('/');
    } catch (err) {
      console.error('Fout bij updaten:', err);
      alert('Er ging iets mis bij het opslaan: ' + err.message);
    }
  };

  if (!event) {
    return <Text>Evenement wordt geladen...</Text>;
  }
    // Hier zou je een update-logica kunnen toevoegen (API-call, file write, etc.)
//   };


//   if (!event) {
//     return <Text>Evenement niet gevonden.</Text>;
//   }

return (
    <Box p={4}>
      <Heading mb={4}>Wijzig Evenement: {event.title}</Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb="1rem" isRequired isInvalid={!formData.title}>
          <FormLabel>Titel</FormLabel>
          <Input name="title" value={formData.title} onChange={handleChange} />
            {!formData.title && <FormErrorMessage>Verplicht veld</FormErrorMessage>}
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Afbeeldings-URL</FormLabel>
          <Input name="image" value={formData.image} onChange={handleChange} />
        </FormControl>

         <FormControl mb="1rem" isRequired isInvalid={!formData.description}>
          <FormLabel>Beschrijving</FormLabel>
          <Textarea name="description" value={formData.description} onChange={handleChange} />
        </FormControl>

        <FormControl mb="1rem" isRequired isInvalid={!formData.location}>
          <FormLabel>Locatie</FormLabel>
          <Input name="location" value={formData.location} onChange={handleChange} />
        </FormControl>

 <FormControl mb="1rem" isRequired>
          <FormLabel>Startdatum</FormLabel>
          <Input type="date" name="date" value={formData.date} onChange={handleChange} />
        </FormControl>

        <Flex gap="1rem" mb="1rem">
          <FormControl isRequired>
            <FormLabel>Begintijd</FormLabel>
            <Input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Eindtijd</FormLabel>
            <Input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
          </FormControl>
        </Flex>

        <FormControl mb="1rem">
          <FormLabel>Einddatum (optioneel)</FormLabel>
          <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </FormControl>

        <FormControl mb="1rem">
          <FormLabel>Categorieën</FormLabel>
          <CheckboxGroup
            colorScheme="blue"
            value={(formData.categoryIds || []).map(String)}
            onChange={(selected) =>
              setFormData((prev) => ({
                ...prev,
                categoryIds: selected.map(Number),
              }))
            }
          >
            <Stack spacing={2}>
              {categories.map((cat) => (
            <Checkbox key={cat.id} value={String(cat.id)}>
          {cat.name}
        </Checkbox>
      ))}
    </Stack>
  </CheckboxGroup>
          {/* <Select multiple value={formData.categoryIds.map(String)} onChange={handleCategoryChange}>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select> */}
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Opslaan
        </Button>
      </form>
    </Box>
  );
};