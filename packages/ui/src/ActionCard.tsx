import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

interface ActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  onAction?: () => void;
}

export function ActionCard({ title, description, buttonText, onAction }: ActionCardProps) {
  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={onAction}>
            {buttonText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}