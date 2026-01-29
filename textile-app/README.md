# CBR Textiles Management System

A professional textile management application for managing workers, attendance, payroll, inventory, and stock movements.

## Features

### 1. Worker Management
- Add and manage textile workers (Tailors, Cutters, Helpers, Machine Operators, Packers, Supervisors)
- Unique employee codes and role assignment
- Daily and shift-based wage rates
- Contact information tracking

### 2. Attendance Management
- Record daily attendance (Full Day / Half Day / Absent / Leave)
- Track worker availability and productivity
- Reduce manual errors in attendance records
- Generate attendance reports

### 3. Wages & Payroll
- Automatically calculate wages based on attendance
- Support daily, weekly, or monthly wage calculations
- Transparent and accurate payroll management
- Payroll history tracking

### 4. Inventory Management
- Manage textile items (Fabrics, Yarns, Garments, Accessories, Raw Materials)
- Track stock levels in real-time
- Avoid over-stocking or shortages
- Inventory valuation

### 5. Inward & Outward Management
- Record inward entries for raw materials and finished goods
- Track outward movements for sales, dispatch, or transfers
- Maintain clear stock flow history
- Stock movement audit trail

### 6. Reports & History
- View historical records of attendance, wages, and inventory
- Generate insights for business decisions
- Improve operational efficiency and planning

## Project Structure

```
textile-app/
├── frontend/
│   ├── index.html          # Main HTML application
│   ├── style.css           # Professional styling
│   ├── script.js           # Interactive functionality
│   └── logo.svg            # Application logo
│
├── backend/
│   ├── server.js           # Express server
│   ├── models/
│   │   └── Worker.js       # Worker model with validation
│   ├── routes/
│   │   ├── workerRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── payrollRoutes.js
│   │   ├── inventoryRoutes.js
│   │   └── movementRoutes.js
│   └── config/
│       └── db.js           # SQLite database configuration
│
└── package.json            # Project dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### Step 3: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Workers
- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get worker by ID
- `POST /api/workers` - Add new worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker
- `GET /api/workers/stats/summary` - Get worker statistics

### Attendance
- `POST /api/attendance` - Record attendance
- `GET /api/attendance/date/:date` - Get attendance by date
- `GET /api/attendance/worker/:worker_id` - Get worker attendance
- `GET /api/attendance/report/:start_date/:end_date` - Get attendance report
- `DELETE /api/attendance/:id` - Delete attendance record

### Payroll
- `POST /api/payroll/calculate` - Calculate payroll for period
- `GET /api/payroll` - Get all payroll records
- `GET /api/payroll/period/:start_date/:end_date` - Get payroll for period
- `GET /api/payroll/worker/:worker_id` - Get worker payroll history

### Inventory
- `GET /api/inventory` - Get all items
- `GET /api/inventory/:id` - Get item by ID
- `POST /api/inventory` - Add new item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item
- `GET /api/inventory/low-stock/:threshold` - Get low stock items
- `GET /api/inventory/summary/all` - Get inventory summary

### Stock Movements
- `POST /api/movements` - Record stock movement
- `GET /api/movements` - Get all movements
- `GET /api/movements/item/:item_id` - Get movements for item
- `GET /api/movements/period/:start_date/:end_date` - Get movements for period
- `DELETE /api/movements/:id` - Delete movement record

## Database

The application uses SQLite3 for data persistence. Database file is created automatically at:
```
textile_app.db
```

### Tables
- **workers** - Employee information
- **attendance** - Daily attendance records
- **inventory** - Stock items
- **stock_movements** - Inward/Outward transactions
- **payroll** - Wage calculations

## Professional Features

### UI/UX
- Modern, responsive design
- Professional color scheme (Navy Blue & Red)
- Clean navigation with sidebar menu
- Dashboard with key metrics
- Status badges and visual indicators
- Mobile-responsive layout

### Security & Validation
- Input validation on all forms
- Error handling and user feedback
- Soft deletes for worker records
- Database integrity constraints

### Performance
- Local storage for frontend data persistence
- Optimized database queries
- Efficient table sorting and filtering

## Usage Examples

### Adding a Worker
1. Go to **Workers** section
2. Click **Add New Worker**
3. Fill in:
   - Employee Code (e.g., W001)
   - Full Name
   - Role (select from dropdown)
   - Contact Number
   - Daily Wage Rate
   - Shift-based Wage (optional)
4. Click **Save Worker**

### Recording Attendance
1. Go to **Attendance** section
2. Click **Mark Attendance**
3. Select date and worker
4. Choose status (Present/Half Day/Absent/Leave)
5. Add notes if needed
6. Click **Save Attendance**

### Managing Inventory
1. Go to **Inventory** section
2. Click **Add Item**
3. Enter item details (Code, Name, Type, Unit, Quantity, Cost)
4. Click **Save Item**

### Recording Stock Movement
1. Go to **Inward/Outward** section
2. Click **Inward Entry** or **Outward Entry**
3. Select date, item, and quantity
4. Add reference and notes
5. Click **Record Movement**

### Generating Payroll
1. Go to **Payroll** section
2. Select period (Daily/Weekly/Monthly)
3. Click **Calculate Payroll**
4. View calculated wages and download if needed

### Viewing Reports
1. Go to **Reports** section
2. Select report type:
   - Attendance Report
   - Payroll Report
   - Inventory Report
   - Stock Movement Report
3. Click to view detailed reports

## Customization

### Branding
- Replace `logo.svg` with your company logo
- Update color scheme in `style.css` (variables at top)
- Modify company name in navbar

### Roles & Positions
Edit `Worker.js` to add more job roles:
```javascript
static getRoleCategories() {
    return [
        'Tailor',
        'Cutter',
        'Helper',
        'Machine Operator',
        'Packer',
        'Supervisor',
        // Add more roles here
    ];
}
```

## Support & Maintenance

- Check `textile_app.db` for data backups
- Monitor server logs for errors
- Regular database maintenance recommended
- Data export available via reports

## Future Enhancements

- User authentication & authorization
- Email notifications
- SMS alerts for low stock
- Advanced reporting with charts
- Mobile app version
- Cloud backup integration
- Multi-user support
- Expense tracking
- Production analytics

## License

ISC

## Author

CBR Textiles

---

**Version 1.0.0** | Created: January 2026
