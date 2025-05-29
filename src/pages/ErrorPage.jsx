import { useRouteError } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function ErrorPage() {
  const error = useRouteError();
  console.error("❌ Router error:", error);

  return (
    <Box p={8}>
      <Heading>Er ging iets mis</Heading>
      <Text mt={4}>{error.statusText || error.message}</Text>
    </Box>
  );
}
