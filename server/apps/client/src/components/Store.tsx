import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Security,
  Payment,
  Warning,
} from '@mui/icons-material';
import { loadScript } from '@paypal/react-paypal-js';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  special?: boolean;
  legalText?: string;
}

const products: Product[] = [
  {
    id: 'fishing-net-1',
    name: 'Professional Fishing Net',
    description: 'High-quality fishing net for sustainable fishing practices',
    price: 49.99,
    image: '/images/fishing-net.jpg',
    category: 'Equipment',
  },
  {
    id: 'uav-1',
    name: 'Advanced UAV',
    description: 'State-of-the-art UAV for fish population monitoring',
    price: 2999.99,
    image: '/images/uav.jpg',
    category: 'Equipment',
  },
  {
    id: 'water-bottle-1',
    name: 'Eco-Friendly Water Bottle',
    description: 'Reusable water bottle made from recycled materials',
    price: 24.99,
    image: '/images/water-bottle.jpg',
    category: 'Accessories',
  },
  {
    id: 'fish-finder-1',
    name: 'Smart Fish Finder',
    description: 'Bluetooth-enabled fish finder with real-time data',
    price: 199.99,
    image: '/images/fish-finder.jpg',
    category: 'Equipment',
  },
  {
    id: 'windbreaker-1',
    name: 'Weatherproof Windbreaker',
    description: 'Lightweight and durable windbreaker for all conditions',
    price: 89.99,
    image: '/images/windbreaker.jpg',
    category: 'Clothing',
  },
  {
    id: 'sweatshirt-1',
    name: 'Sustainable Sweatshirt',
    description: 'Comfortable sweatshirt made from organic materials',
    price: 59.99,
    image: '/images/sweatshirt.jpg',
    category: 'Clothing',
  },
  {
    id: 'pokeball-1',
    name: 'Ocean Spray Pokeball',
    description: 'Advanced fish capture device with LCARS interface. Features quantum-locked containment field and sustainable fish handling protocols.',
    price: 499.99,
    image: '/images/pokeball.jpg',
    category: 'Equipment',
    special: true,
    legalText: 'Free discussion over google meet for legal validity of paint as quantum-locked containment field with copyright as access to mind altaring singularity suggestion and stickers as freedom of voice altering for safety and good will',
  },
];

export const Store: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const theme = useTheme();

  const handlePurchase = async (product: Product) => {
    setSelectedProduct(product);
    setShowPaymentDialog(true);
  };

  const handleSquarePayment = async () => {
    try {
      // Initialize Square payment
      const response = await axios.post('http://localhost:5000/api/payments/square', {
        product_id: selectedProduct?.id,
        amount: selectedProduct?.price,
      });

      // Handle Square payment response
      if (response.data.success) {
        // Record achievement
        await axios.post(`http://localhost:5000/api/achievements/sellout/${localStorage.getItem('profile_id')}`, {
          item_name: selectedProduct?.name,
          amount: selectedProduct?.price,
          currency: 'USD',
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
    setShowPaymentDialog(false);
  };

  const handleGooglePay = async () => {
    try {
      // Initialize Google Pay
      const response = await axios.post('http://localhost:5000/api/payments/google', {
        product_id: selectedProduct?.id,
        amount: selectedProduct?.price,
      });

      // Handle Google Pay response
      if (response.data.success) {
        // Record achievement
        await axios.post(`http://localhost:5000/api/achievements/sellout/${localStorage.getItem('profile_id')}`, {
          item_name: selectedProduct?.name,
          amount: selectedProduct?.price,
          currency: 'USD',
        });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
    setShowPaymentDialog(false);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: theme.palette.primary.main,
            textShadow: '0 0 10px rgba(0,180,216,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ShoppingCart /> Store
        </Typography>

        <Alert 
          severity="warning" 
          icon={<Warning />}
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
            color: theme.palette.warning.contrastText,
            '& .MuiAlert-icon': {
              color: theme.palette.warning.contrastText,
            },
            border: `1px solid ${theme.palette.warning.light}`,
            boxShadow: `0 0 15px ${theme.palette.warning.main}40`,
          }}
        >
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            Fishing and fishing-related activities including wind breakers and apparel carry their own risks and liability owned by the consumer. Purchase of goods from our site or ideas spawned therein are adopted by the consumer, and while probably delicious, are not our rights or responsibilities.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: product.special 
                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                  border: product.special
                    ? `2px solid ${theme.palette.secondary.main}`
                    : `1px solid ${theme.palette.primary.main}40`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: product.special
                      ? `0 0 30px ${theme.palette.secondary.main}40`
                      : `0 0 20px ${theme.palette.primary.main}40`,
                  },
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'visible',
                  '&::before': product.special ? {
                    content: '""',
                    position: 'absolute',
                    top: -2,
                    left: -2,
                    right: -2,
                    bottom: -2,
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    zIndex: -1,
                    borderRadius: 'inherit',
                    animation: 'pulse 2s infinite',
                  } : {},
                }}
              >
                {product.special && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      background: theme.palette.secondary.main,
                      color: theme.palette.secondary.contrastText,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      transform: 'rotate(15deg)',
                      boxShadow: `0 0 10px ${theme.palette.secondary.main}40`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      LCARS SPECIAL
                    </Typography>
                  </Box>
                )}
                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ 
                    objectFit: 'cover',
                    filter: product.special ? 'drop-shadow(0 0 10px rgba(0,180,216,0.5))' : 'none',
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    sx={{ 
                      color: product.special ? theme.palette.secondary.main : theme.palette.primary.main,
                      textShadow: product.special ? '0 0 10px rgba(255,77,109,0.5)' : 'none',
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {product.description}
                  </Typography>
                  {product.legalText && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        color: theme.palette.text.disabled,
                        fontStyle: 'italic',
                        mb: 2,
                        fontSize: '0.7rem',
                        opacity: 0.7,
                      }}
                    >
                      {product.legalText}
                    </Typography>
                  )}
                  <Typography
                    variant="h6"
                    sx={{ 
                      color: product.special ? theme.palette.secondary.light : theme.palette.primary.light,
                      textShadow: product.special ? '0 0 5px rgba(255,77,109,0.3)' : 'none',
                    }}
                  >
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handlePurchase(product)}
                    sx={{
                      mt: 2,
                      background: product.special
                        ? `linear-gradient(45deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`
                        : `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      '&:hover': {
                        background: product.special
                          ? `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`
                          : `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                      },
                      boxShadow: product.special ? `0 0 15px ${theme.palette.secondary.main}40` : 'none',
                    }}
                  >
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Payment Dialog */}
        <Dialog
          open={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ color: theme.palette.primary.main }}>
            Complete Purchase
          </DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedProduct?.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Total: ${selectedProduct?.price.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSquarePayment}
                  startIcon={<Payment />}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }}
                >
                  Pay with Square
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleGooglePay}
                  startIcon={<Payment />}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }}
                >
                  Pay with Google Pay
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}; 