import { useState, useEffect } from 'react';
import {
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useAuth } from '../features/auth/authContext';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  alpha, // Make sure to import alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ReceiptLong as OrdersIcon,
  Assessment as ReportsIcon,
  RestaurantMenu as RecipesIcon,
  People as CustomersIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  // removed unused notifications anchor

  const profileOpen = Boolean(profileAnchor);
  
  const orders = useSelector((state: RootState) => state.orders.items);
  const [unreadOrderIds, setUnreadOrderIds] = useState<string[]>([]);

  useEffect(() => {
    setUnreadOrderIds((prev) => {
      const ids = orders.map((o) => o.id);
      return prev.filter((id) => ids.includes(id));
    });
  }, [orders]);

  const menuItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Inventory', to: '/inventory', icon: <InventoryIcon fontSize="small" /> },
    { label: 'Recipes', to: '/recipes', icon: <RecipesIcon fontSize="small" /> },
    { label: 'Customers', to: '/customers', icon: <CustomersIcon fontSize="small" /> },
    { label: 'Orders', to: '/orders', icon: <OrdersIcon fontSize="small" /> },
    { label: 'Reports & Analysis', to: '/reports', icon: <ReportsIcon fontSize="small" /> },
    { label: 'Settings', to: '/settings', icon: <SettingsIcon fontSize="small" /> },
  ];
  const mainMenuItems = menuItems.filter((i) => i.label !== 'Settings');
  const settingsMenuItem = menuItems.find((i) => i.label === 'Settings');

  const drawerWidth = isCollapsed ? 72 : 240; // Slightly wider collapsed state for better icon centering

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f9fafb' }}>
      
      {/* 1. APP BAR (Kept exactly as it was) */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (z) => z.zIndex.drawer + 1,
          bgcolor: alpha('#ffffff', 0.78),
          backdropFilter: 'saturate(180%) blur(10px)',
          WebkitBackdropFilter: 'saturate(180%) blur(10px)',
          color: '#111827',
          borderBottom: '1px solid rgba(229,231,235,0.6)',
          boxShadow: '0 8px 24px rgba(17,24,39,0.06)',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => isMobile ? setMobileOpen((v) => !v) : setIsCollapsed((v) => !v)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
            PantryPilot
          </Typography>

          <IconButton onClick={() => navigate('/orders')}>
            <Badge badgeContent={unreadOrderIds.length} color="error">
              <NotificationsIcon fontSize="small" />
            </Badge>
          </IconButton>

          <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#635bff' }}>
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={profileAnchor}
            open={profileOpen}
            onClose={() => setProfileAnchor(null)}
          >
            <MenuItem disabled>{user?.email}</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* 2. SIDEBAR (Updated with Modern Effects) */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
          },
        }}
      >
        <Toolbar />

        <Typography
          sx={{
            px: 3,
            py: 2,
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'text.secondary',
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          Main
        </Typography>

        <Box sx={{ px: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List>
          {mainMenuItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (location.pathname.startsWith(item.to + '/') && item.to !== '/dashboard');

            return (
              <Tooltip
                key={item.to}
                title={isCollapsed ? item.label : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  component={Link}
                  to={item.to}
                  selected={isActive}
                  sx={{
                    // --- MODERN STYLING START ---
                    minHeight: 48,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    px: 2.5,
                    mb: 0.5, // Spacing between items
                    borderRadius: 2, // Rounded corners (Modern look)
                    
                    // Colors based on Active State
                    color: isActive ? 'primary.main' : 'text.secondary',
                    bgcolor: isActive ? alpha(muiTheme.palette.primary.main, 0.08) : 'transparent',
                    
                    // Hover Effects
                    '&:hover': {
                      bgcolor: isActive 
                        ? alpha(muiTheme.palette.primary.main, 0.12) 
                        : alpha(muiTheme.palette.action.hover, 0.05),
                      color: isActive ? 'primary.main' : 'text.primary',
                      transform: 'translateX(4px)', // The slide animation you liked
                    },
                    
                    // Smooth Transitions
                    transition: 'all 0.2s ease',
                    // --- MODERN STYLING END ---
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: isActive ? 'inherit' : 'text.secondary', // Icon follows text color
                      transition: 'margin 0.2s',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                    sx={{
                      opacity: isCollapsed ? 0 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            );
          })}
          </List>

          {settingsMenuItem && (
            <Box sx={{ mt: 'auto', pb: 2 }}>
              {(() => {
                const item = settingsMenuItem;
                const isActive =
                  location.pathname === item.to ||
                  (location.pathname.startsWith(item.to + '/') && item.to !== '/dashboard');
                return (
                  <Tooltip
                    key={item.to}
                    title={isCollapsed ? item.label : ''}
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      to={item.to}
                      selected={isActive}
                      sx={{
                        minHeight: 48,
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        px: 2.5,
                        mb: 0.5,
                        borderRadius: 2,
                        color: isActive ? 'primary.main' : 'text.secondary',
                        bgcolor: isActive ? alpha(muiTheme.palette.primary.main, 0.08) : 'transparent',
                        '&:hover': {
                          bgcolor: isActive 
                            ? alpha(muiTheme.palette.primary.main, 0.12) 
                            : alpha(muiTheme.palette.action.hover, 0.05),
                          color: isActive ? 'primary.main' : 'text.primary',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: isCollapsed ? 0 : 2,
                          justifyContent: 'center',
                          color: isActive ? 'inherit' : 'text.secondary',
                          transition: 'margin 0.2s',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive ? 600 : 500,
                        }}
                        sx={{
                          opacity: isCollapsed ? 0 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      />
                    </ListItemButton>
                  </Tooltip>
                );
              })()}
            </Box>
          )}
        </Box>
      </Drawer>

      {/* 3. MAIN CONTENT (Kept exactly as it was) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f3f4f6',
          overflow: 'auto',
          height: '100vh', 
          pt: 8, // Add padding top to account for the fixed header
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
