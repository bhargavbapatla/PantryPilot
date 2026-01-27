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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ReceiptLong as OrdersIcon,
  Assessment as ReportsIcon,
  RestaurantMenu as RecipesIcon,
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
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const profileOpen = Boolean(profileAnchor);
  const notificationsOpen = Boolean(notificationsAnchor);

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
    { label: 'Orders', to: '/dashboard/orders', icon: <OrdersIcon fontSize="small" /> },
    { label: 'Reports & Analysis', to: '/dashboard/reports', icon: <ReportsIcon fontSize="small" /> },
    { label: 'Settings', to: '/settings', icon: <SettingsIcon fontSize="small" /> },
  ];

  const drawerWidth = isCollapsed ? 64 : 240;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f9fafb' }}>
      {/* APP BAR */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (z) => z.zIndex.drawer + 1,
          bgcolor: '#ffffff',
          color: '#111827',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() =>
              isMobile ? setMobileOpen((v) => !v) : setIsCollapsed((v) => !v)
            }
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>
            PantryPilot
          </Typography>

          <IconButton onClick={(e) => setNotificationsAnchor(e.currentTarget)}>
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

      {/* SIDEBAR */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: '#ffffff',
            borderRight: '1px solid #e5e7eb',
            fontSize: '13.5px',
          },
        }}
      >
        <Toolbar />

        <Typography
          sx={{
            px: 2,
            py: 1,
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#9ca3af',
          }}
        >
          Main
        </Typography>

        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (location.pathname.startsWith(item.to + '/') && item.to !== '/dashboard');

            return (
              <Tooltip
                key={item.to}
                title={isCollapsed ? item.label : ''}
                placement="right"
              >
                <ListItemButton
                  component={Link}
                  to={item.to}
                  selected={isActive}
                  sx={{
                    px: isCollapsed ? 1.5 : 2,
                    py: 0.75,
                    borderRadius: 1,
                    fontSize: '13.5px',
                    fontWeight: 500,
                    color: isActive ? '#4f46e5' : '#374151',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    '&:hover': {
                      bgcolor: '#f3f4f6',
                    },
                    '&.Mui-selected': {
                      bgcolor: '#eef2ff',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isCollapsed ? 0 : 36,
                      mr: isCollapsed ? 0 : 1.25,
                      color: isActive ? '#4f46e5' : '#9ca3af',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!isCollapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '13.5px',
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Drawer>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f9fafb',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
