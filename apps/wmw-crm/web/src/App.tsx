import {
  BunkerProvider,
  BunkerBadge,
  ActionCard,
  Box,
  Container,
} from "@bunker/ui";

export function App() {
  return (
    <BunkerProvider>
      <Container maxWidth="md" sx={{ py: 6, textAlign: "center" }}>
        <BunkerBadge />
        <Box sx={{ mt: 2 }}>
          <ActionCard
            title="Módulo de Socios - WMW Club"
            description="Motor de estilos Emotion y Material UI compilando desde @bunker/ui sin interferencias."
            buttonText="Acceder al Panel"
            onAction={() => alert("Acción ejecutada correctamente")}
          />
        </Box>
      </Container>
    </BunkerProvider>
  );
}

export default App;
