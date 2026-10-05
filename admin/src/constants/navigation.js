export const NAVIGATION_SECTIONS = [
  {
    title: 'Core Overview',
    icon: 'LayoutDashboard',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard' },
      { name: 'Branches', path: '/admin/branches' },
    ],
  },
  {
    title: 'Master Catalog',
    icon: 'BookOpen',
    items: [
      { name: 'Categories', path: '/admin/categories' },
      { name: 'Subcategories', path: '/admin/subcategories' },
      { name: 'Brands', path: '/admin/brands' },
      { name: 'Units', path: '/admin/units' },
      { name: 'Products', path: '/admin/products' },
    ],
  },
  {
    title: 'Inventory',
    icon: 'Warehouse',
    items: [
      { name: 'Inventory', path: '/admin/inventory' },
      { name: 'Stock In', path: '/admin/stock-in' },
      { name: 'Stock Out', path: '/admin/stock-out' },
      { name: 'Low Stock', path: '/admin/low-stock' },
      { name: 'Out of Stock', path: '/admin/out-of-stock' },
    ],
  },
  {
    title: 'Administration',
    icon: 'Settings',
    items: [
      { name: 'Settings', path: '/admin/settings' },
      { name: 'Admin Profile', path: '/admin/profile' },
      { name: 'History', path: '/admin/history' },
    ],
  },
];
