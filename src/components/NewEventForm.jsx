import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormLabel, Input, Textarea, Button, FormErrorMessage, Flex, CheckboxGroup, Checkbox, Stack } from '@chakra-ui/react';

export const NewEventForm = ({ isOpen, onClose, onEventAdded, onCategoryAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    location: '',
    date: '',
    endDate: '',
    startTime: '',
    endTime: '',
    categoryIds: []
  });

  const getNextNumericId = async () => {
  try {
    const res = await fetch('http://localhost:3000/events');
    const events = await res.json();
    const numericIds = events
      .map(e => parseInt(e.id, 10))
      .filter(id => !isNaN(id));
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
    return (maxId + 1).toString();
  } catch (err) {
    console.error('Fout bij ophalen events voor ID:', err);
    return Date.now().toString(); // fallback ID
  }
};


  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Haal de categorieën op als het formulier opent
  React.useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:3000/categories')
        .then(res => res.json())
        .then(setCategories)
        .catch(err => console.error('Fout bij ophalen categorieën:', err));
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (selected) => {
    const cleanIds = selected
    .map(Number)
    .filter(id => !isNaN(id));

  setFormData((prev) => ({
    ...prev,
    categoryIds: cleanIds
  }));
};
//   setFormData((prev) => ({
//     ...prev,
//     categoryIds: selected.map(Number)
//   }));
// };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      });

      const saved = await res.json();
      setCategories(prev => [...prev, saved]);
      setFormData(prev => ({
        ...prev,
        categoryIds: [...new Set([...prev.categoryIds, Number(saved.id)])]

      }));
      setNewCategoryName('');
      if (onCategoryAdded) onCategoryAdded(saved);
    } catch (err) {
      console.error('Fout bij toevoegen categorie:', err);
    }
  };

  const handleAddEvent = async () => {
    const {
      title, description, image, location,
      date, startTime, endTime, endDate, categoryIds
    } = formData;

    if (!title || !description || !image || !location || !date || !startTime || !endTime) {
      alert("Vul alle verplichte velden in.");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${endDate || date}T${endTime}`);

    if (start >= end) {
      alert("De eindtijd moet na de begintijd liggen.");
      return;
    }

const newEvent = {
  id: await getNextNumericId(), // <-- hier voeg je het ID toe
  title,
  description,
  image,
  location,
  startTime: start.toISOString(),
  endTime: end.toISOString(),
  createdBy: 1,
  categoryIds: categoryIds.map(Number).filter(id => !isNaN(id)) // Zorg ervoor dat de IDs numeriek zijn
};

    try {
      const response = await fetch("http://localhost:3000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newEvent)
      });

      if (!response.ok) throw new Error("Fout bij toevoegen event");

      const savedEvent = await response.json();
      if (onEventAdded) onEventAdded(savedEvent);
      setFormData({
        title: '',
        description: '',
        image: '',
        location: '',
        date: '',
        endDate: '',
        startTime: '',
        endTime: '',
        categoryIds: []
      });
      onClose();
    } catch (err) {
      console.error("Fout bij toevoegen event:", err);
      alert("Er is iets misgegaan bij het opslaan: " + err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Nieuw Evenement</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="70vh" overflowY="auto">
          <FormControl mb="1rem" isRequired isInvalid={!formData.title}>
            <FormLabel>Titel</FormLabel>
            <Input name="title" value={formData.title} onChange={handleInputChange} />
            {!formData.title && <FormErrorMessage>Verplicht veld</FormErrorMessage>}
          </FormControl>

          <FormControl mb="1rem" isRequired isInvalid={!formData.description}>
            <FormLabel>Beschrijving</FormLabel>
            <Textarea name="description" value={formData.description} onChange={handleInputChange} />
            {!formData.description && <FormErrorMessage>Verplicht veld</FormErrorMessage>}
          </FormControl>

          <FormControl mb="1rem" isRequired isInvalid={!formData.location}>
            <FormLabel>Locatie</FormLabel>
            <Input name="location" value={formData.location} onChange={handleInputChange} />
          </FormControl>

          <FormControl mb="1rem" isRequired isInvalid={!formData.image}>
            <FormLabel>Afbeeldings-URL</FormLabel>
            <Input name="image" value={formData.image} onChange={handleInputChange} />
          </FormControl>

          <FormControl mb="1rem" isRequired isInvalid={!formData.date}>
            <FormLabel>Startdatum</FormLabel>
            <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
          </FormControl>

          <Flex gap="1rem" mb="1rem">
            <FormControl isRequired isInvalid={!formData.startTime}>
              <FormLabel>Begintijd</FormLabel>
              <Input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} />
            </FormControl>
            <FormControl isRequired isInvalid={!formData.endTime}>
              <FormLabel>Eindtijd</FormLabel>
              <Input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} />
            </FormControl>
          </Flex>

          <FormControl mb="1rem">
            <FormLabel>Einddatum (optioneel)</FormLabel>
            <Input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} />
          </FormControl>

          <FormControl mb="1rem">
            <FormLabel>Categorieën</FormLabel>
              <CheckboxGroup
    value={(formData.categoryIds || []).map(String)}
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

          <FormControl mb="1rem">
            <FormLabel>Nieuwe categorie toevoegen</FormLabel>
            <Flex gap="0.5rem">
              <Input
                placeholder="Naam categorie"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={handleAddCategory} colorScheme="green">+</Button>
            </Flex>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>Annuleren</Button>
          <Button colorScheme="blue" onClick={handleAddEvent}>Opslaan</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
