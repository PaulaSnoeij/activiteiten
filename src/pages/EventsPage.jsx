import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Image,
  SimpleGrid,
  Spinner,
  Flex,
  Avatar,
  Button,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import { NewEventForm } from "../components/NewEventForm"; // Zorg dat pad klopt

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:3000/events").then((res) => res.json()),
      fetch("http://localhost:3000/categories").then((res) => res.json()),
      fetch("http://localhost:3000/users").then((res) => res.json()),
    ])
      .then(([eventsData, categoriesData, usersData]) => {
        setEvents(eventsData);
        setCategories(categoriesData);
        setUsers(usersData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fout bij ophalen van de gegevens:", err);
        setError("Er is een fout opgetreden bij het laden van de gegevens.");
        setLoading(false);
      });
  }, []);

  const getCategoryNames = (categoryIds = []) =>
    categoryIds
      .map((id) => {
        const match = categories.find((cat) => Number(cat.id) === Number(id));
        return match?.name;
      })
      .filter(Boolean)
      .join(", ");

  const getUserById = (userId) => users.find((user) => user.id === userId);

  if (loading) return <Spinner size="xl" />;
  if (error) return <Text color="red.500">{error}</Text>;

  return (
    <Box padding="2rem">
      <Flex justify="space-between" align="center" mb="1rem">
        <Heading>Evenementen</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          Toevoegen
        </Button>
      </Flex>

      <Flex gap="1rem" mb="1.5rem" flexWrap="wrap">
        <Input
          placeholder="Zoek op titel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "6px" }}
        >
          <option value="">Alle categorieën</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="1rem">
        {events
          .filter((event) => {
            const matchesTitle = event.title
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
            const matchesCategory =
              selectedCategory === "" ||
              event.categoryIds.includes(Number(selectedCategory));
            return matchesTitle && matchesCategory;
          })
          .map((event) => {
            const creator = getUserById(event.createdBy);
            return (
              <Box
                as={Link}
                to={`/events/${event.id}`}
                key={event.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                p={4}
                boxShadow="md"
                _hover={{ boxShadow: "lg" }}
                bg="white"
              >
                <Image
                  src={event.image}
                  alt={event.title}
                  w="100%"
                  h="200px"
                  objectFit="cover"
                  mb={3}
                />
                <Text fontSize="xl" fontWeight="bold">
                  {event.title}
                </Text>
                <Text mt="0.5rem">{event.description}</Text>
                <Text mt="1rem" color="gray.500">
                  Datum: {new Date(event.startTime).toLocaleDateString("nl-NL")}
                  <br />
                  Start:{" "}
                  {new Date(event.startTime).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <br />
                  Eind:{" "}
                  {new Date(event.endTime).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text mt="0.5rem" fontWeight="bold" color="blue.500">
                  Categorieën: {getCategoryNames(event.categoryIds)}
                </Text>
                {creator && (
                  <Flex align="center" mt="1rem">
                    <Avatar
                      src={creator.image}
                      name={creator.name}
                      size="sm"
                      mr="0.5rem"
                    />
                    <Text fontSize="sm" color="gray.700">
                      Georganiseerd door {creator.name}
                    </Text>
                  </Flex>
                )}
              </Box>
            );
          })}
      </SimpleGrid>

      {/* Nieuw formuliercomponent */}
      <NewEventForm
        isOpen={isOpen}
        onClose={onClose}
        onEventAdded={(event) => setEvents((prev) => [event, ...prev])}
        onCategoryAdded={(newCategory) =>
          setCategories((prev) => [...prev, newCategory])
        }
      />
    </Box>
  );
};
