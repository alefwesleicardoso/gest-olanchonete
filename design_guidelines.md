# Restaurant Management System Design Guidelines

## Design Approach
**System-Based Approach**: Material Design principles adapted for data-heavy operational interface with emphasis on clarity, efficiency, and quick task completion. Professional dashboard aesthetic optimized for restaurant staff workflow.

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 212 100% 50% (Blue - #007bff)
- Secondary: 142 71% 45% (Green - #28a745)
- Accent: 27 98% 54% (Orange - #fd7e14)
- Background: 210 17% 98% (Light gray - #f8f9fa)
- Surface: 0 0% 100% (White cards)
- Text Primary: 220 13% 18%
- Text Secondary: 220 9% 46%
- Border: 220 13% 91%
- Success: 142 71% 45%
- Warning: 45 100% 51%
- Error: 0 84% 60%
- Info: 212 100% 50%

**Status Colors:**
- Pending: 38 92% 50% (Orange)
- Confirmed: 212 100% 50% (Blue)
- Preparing: 271 76% 53% (Purple)
- Ready: 142 71% 45% (Green)
- Delivered: 220 9% 46% (Gray)
- Cancelled: 0 84% 60% (Red)

### B. Typography

**Font Stack:**
- Primary: 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- Monospace: 'SF Mono', 'Consolas', 'Monaco', monospace

**Scale:**
- Display: text-4xl font-bold (36px) - Dashboard titles
- Heading 1: text-3xl font-bold (30px) - Page headers
- Heading 2: text-2xl font-semibold (24px) - Section headers
- Heading 3: text-xl font-semibold (20px) - Card headers
- Body Large: text-lg (18px) - Prominent text
- Body: text-base (16px) - Default text
- Small: text-sm (14px) - Helper text, labels
- Tiny: text-xs (12px) - Captions, badges

### C. Layout System

**Spacing Scale:** Use Tailwind units of 2, 3, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card margins: gap-6
- Dashboard grid gaps: gap-6
- Form field spacing: space-y-4

**Grid System:**
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Product grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
- Two-column layouts: grid-cols-1 lg:grid-cols-2
- Container max-width: max-w-7xl mx-auto

### D. Component Library

**Navigation:**
- Fixed sidebar (desktop): w-64 with logo, menu items, user profile
- Mobile hamburger menu with slide-in drawer
- Active state: bg-blue-50 with blue-600 text and left border accent
- Menu items: Hover bg-gray-50, icons left-aligned with text

**Cards:**
- White background with shadow-md hover:shadow-lg transition
- Border radius: rounded-lg (8px)
- Padding: p-6
- Stats cards: Icon + number + label layout with colored icon backgrounds

**Tables:**
- Striped rows: odd:bg-gray-50
- Header: bg-gray-100 font-semibold text-sm uppercase
- Hover: hover:bg-gray-50 transition
- Action buttons in last column
- Responsive: Horizontal scroll on mobile with sticky first column

**Forms:**
- Input fields: border rounded-lg px-4 py-2.5 focus:ring-2 ring-blue-500
- Labels: text-sm font-medium mb-2 block
- Select dropdowns: Styled consistently with inputs
- Buttons: Primary (blue), Secondary (gray outline), Success (green), Danger (red outline)
- Image upload: Drag-drop zone with preview thumbnail

**Buttons:**
- Primary: bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium
- Secondary: border-2 border-gray-300 hover:border-gray-400 px-6 py-2.5 rounded-lg
- Icon buttons: p-2 hover:bg-gray-100 rounded-lg transition
- Minimum touch target: 44px height for mobile

**Badges:**
- Status badges: Rounded-full px-3 py-1 text-xs font-medium with status colors
- Count badges: Absolute positioned, circular, red background

**Charts:**
- Line charts: Blue gradient fill for sales trends
- Bar charts: Blue bars for product comparison
- Pie charts: Multi-color segments for category distribution
- Axis labels: text-sm text-gray-600
- Grid lines: Subtle gray dotted

**Modals:**
- Overlay: bg-black/50 backdrop blur
- Content: bg-white rounded-xl shadow-2xl max-w-2xl
- Header: border-b pb-4 with title and close button
- Footer: border-t pt-4 with action buttons right-aligned

**Notifications:**
- Toast position: Top-right fixed
- Success: Green border-l-4 with checkmark icon
- Error: Red border-l-4 with X icon
- Warning: Orange border-l-4 with alert icon
- Auto-dismiss: 5 seconds with progress bar

### E. Interactions & Animations

**Transitions:**
- All hover states: transition-all duration-200
- Card elevation: shadow transitions on hover
- Button states: bg-color transitions
- Modal/drawer: slide/fade animations 300ms
- Loading states: Subtle pulse animation on skeleton loaders

**Minimal Animation Philosophy:**
- Loading spinners only for data fetch operations
- Smooth scroll behavior for navigation
- No decorative animations - focus on performance
- Page transitions: Simple fade (avoid complex animations)

## Page-Specific Guidelines

**Dashboard:**
- 4-column stat cards at top with icons (products, orders, revenue, today's orders)
- Two-column layout below: Recent orders table (left 2/3) + Quick actions (right 1/3)
- Sales trend chart full-width below
- Low stock alert section at bottom

**Product Management:**
- Search bar and filter dropdowns in header
- Add product button (primary, top-right)
- Product grid cards with image, name, price, stock indicator
- Quick edit/delete icons on hover
- Category tabs for filtering

**Order Creation:**
- Two-column layout: Product selection (left) + Order summary (right sticky)
- Product cards with +/- quantity controls
- Real-time total calculation in summary
- Customer form below product selection
- Submit order button (large, prominent)

**Order Management:**
- Filterable table with status badges
- Status dropdown for quick updates
- View details expands row inline
- Bulk actions toolbar when rows selected

**Analytics Page:**
- Date range selector at top
- Grid of metric cards (sales, orders, avg order value)
- Chart grid: Sales trend + Top products + Category distribution
- Exportable reports section

## Responsive Behavior

**Mobile (<768px):**
- Hamburger menu, full-width cards
- Stack all grids to single column
- Horizontal scroll tables with fixed first column
- Bottom navigation bar for quick access
- Large touch targets (min 44px)

**Tablet (768-1024px):**
- 2-column grids
- Collapsible sidebar option
- Balanced spacing

**Desktop (>1024px):**
- Full multi-column layouts
- Persistent sidebar
- Maximum data density with breathing room

## Design System Summary
This design creates a professional, efficient restaurant management interface prioritizing speed and clarity. The Material-inspired component system with the specified color palette ensures consistency while the information-dense layouts optimize for operational workflows. Every interaction supports quick task completion with minimal cognitive load.