import { useState, useEffect } from 'react';
import { useParams, useLoaderData, useActionData, Form } from 'react-router-dom';
import {
  Box,
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
  Textarea,
} from '@chakra-ui/react';

export const ChangeEventForm = () => {
  useParams();
  const event = useLoaderData(); // <-- geladen via loadEvent
  const actionData = useActionData(); // <-- foutmeldingen van updateEvent

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
    userId: 1, // hardcoded, of haal uit context/auth
  });

  useEffect(() => {
    if (event) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);

      setFormData({
        title: event.title || '',
        description: event.description || '',
        image: event.image || '',
        location: event.location || '',
        date: start.toISOString().slice(0, 10),
        startTime: start.toISOString().slice(11, 16),
        endDate: end.toISOString().slice(0, 10),
        endTime: end.toISOString().slice(11, 16),
        categoryIds: event.categoryIds || [],
        userId: event.createdBy || 1,
      });
    }
  }, [event]);

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

  const handleCategoryChange = (selected) => {
    setFormData((prev) => ({ ...prev, categoryIds: selected.map(Number) }));
  };

  return (
    <Box p={4}>
      <Heading mb={4}>Wijzig Evenement: {event.title}</Heading>

      {actionData?.error && (
        <Box mb={4} color="red.500" fontWeight="semibold">
          ⚠️ {actionData.error}
        </Box>
      )}

      <Form method="post">
        <FormControl mb={4} isRequired isInvalid={!formData.title}>
          <FormLabel>Titel</FormLabel>
          <Input name="title" value={formData.title} onChange={handleChange} />
          {!formData.title && <FormErrorMessage>Verplicht veld</FormErrorMessage>}
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Afbeeldings-URL</FormLabel>
          <Input name="image" value={formData.image} onChange={handleChange} />
        </FormControl>

        <FormControl mb={4} isRequired isInvalid={!formData.description}>
          <FormLabel>Beschrijving</FormLabel>
          <Textarea name="description" value={formData.description} onChange={handleChange} />
        </FormControl>

        <FormControl mb={4} isRequired isInvalid={!formData.location}>
          <FormLabel>Locatie</FormLabel>
          <Input name="location" value={formData.location} onChange={handleChange} />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel>Startdatum</FormLabel>
          <Input type="date" name="date" value={formData.date} onChange={handleChange} />
        </FormControl>

        <Flex gap="1rem" mb={4}>
          <FormControl isRequired>
            <FormLabel>Begintijd</FormLabel>
            <Input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Eindtijd</FormLabel>
            <Input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
          </FormControl>
        </Flex>

        <FormControl mb={4}>
          <FormLabel>Einddatum (optioneel)</FormLabel>
          <Input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Categorieën</FormLabel>
          <CheckboxGroup
            colorScheme="blue"
            value={formData.categoryIds.map(String)}
            onChange={handleCategoryChange}
          >
            <Stack spacing={2}>
              {categories.map((cat) => (
                <Checkbox key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
        </FormControl>

        <input type="hidden" name="userId" value={formData.userId} />
        <input type="hidden" name="categoryIds" value={formData.categoryIds.join(',')} />

        {formData.categoryIds.map((id) => (
          <input key={id} type="hidden" name="categoryIds" value={id} />
        ))}

        <Button type="submit" colorScheme="blue">
          Opslaan
        </Button>
      </Form>
    </Box>
  );
};
