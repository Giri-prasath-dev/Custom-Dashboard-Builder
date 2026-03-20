# Halleyx Custom Dashboard Builder

A powerful and flexible dashboard builder application that allows users to create, customize, and visualize their data with interactive charts, tables, and KPI widgets.

## Demo Video Tutorial

For a complete walkthrough of the Dashboard Builder features, watch our video tutorial:

[Watch Video Tutorial] https://drive.google.com/drive/u/1/folders/15Lu4Xp_H8ehtmviQRSx48p9ogxCg7eeV  

## Overview

Hallexy Custom Dashboard Builder is a full-stack web application built with Django (backend) and React (frontend). It provides an intuitive drag-and-drop interface for creating personalized dashboards with various visualization widgets.

## Features

### Dashboard Customization

- **Drag-and-Drop Interface**: Easily position and resize widgets on a responsive grid layout
- **Widget Library**: Browse and add different types of widgets to your dashboard
- **Real-time Layout Saving**: Changes are automatically saved as you modify your dashboard

### Visualization Widgets

- **Bar Chart**: Display data as vertical bars for comparative analysis
- **Line Chart**: Show trends over time with line graphs
- **Area Chart**: Visualize data with filled area under the line
- **Scatter Plot**: Display data points on a coordinate system
- **Pie Chart**: Show data distribution as percentage slices
- **KPI Cards**: Display key metrics with customizable aggregations
- **Data Tables**: Present data in a tabular format with sorting and filtering


### User Management

- **Secure Authentication**: JWT-based login and registration
- **User Dashboard**: Each user has their own personalized dashboard
- **Session Management**: Secure logout functionality


## Technology Stack

### Backend

- **Django 6.0+**: Python web framework
- **Django REST Framework**: API development
- **JWT Authentication**: Secure user authentication
- **SQLite**: Default database (supports MySQL and PostgreSQL in production)

### Frontend

- **React 19**: User interface library
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Charting library
- **React Grid Layout**: Drag-and-drop grid system
- **React Router**: Client-side routing

## Project Structure

```
dashboard-builder/
├── backend/                    # Django backend application
│   ├── accounts/               # User authentication
│   ├── analytics/              # Analytics services
│   ├── dashboard/              # Dashboard and widget management
│   ├── orders/                 # Order data handling
│   └── dashboard_builder/     # Django project settings
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── config-panels/     # Widget configuration panels
│   │   ├── pages/             # Page components
│   │   ├── registry/           # Widget registry
│   │   ├── services/           # API services
│   │   ├── utils/              # Utility functions
│   │   └── widgets/            # Widget components
│   └── public/                 # Static assets
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation
```

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install the required dependencies:

   ```bash
   pip install -r ../requirements.txt
   ```

5. Run database migrations:

   ```bash
   python manage.py migrate
   ```

6. (Optional) Create sample data:

   ```bash
   python create_sample_orders.py
   ```

7. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

The backend will run at `http://localhost:8000`
v
### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run at `http://localhost:5173`

### Running the Full Application

1. Start the backend server (in one terminal):

   ```bash
   cd backend
   python manage.py runserver
   ```

2. Start the frontend server (in another terminal):

   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Getting Started

1. **Register**: Create a new account by clicking "Register" on the login page
2. **Login**: Use your credentials to log in to the dashboard
3. **View Dashboard**: See your default dashboard with pre-configured widgets
4. **Configure**: Click "Configure" to enter edit mode and customize your dashboard

### Adding Widgets

1. In configure mode, browse the widget library on the left sidebar
2. Click on any widget type to add it to your dashboard
3. Configure the widget settings (title, data source, etc.)
4. Drag and resize widgets as needed

### Configuring Widgets

Each widget type has its own configuration panel:

- **Chart Widgets**: Configure X/Y axis, colors, labels
- **KPI Widgets**: Select metric, aggregation type, format
- **Table Widgets**: Choose columns, sorting, pagination

### Saving Changes

- Layout changes are automatically saved
- Use the "Save" button to confirm all modifications
- Use "Cancel" to discard changes and exit configure mode
 

## API Documentation

The backend provides RESTful APIs at `http://localhost:8000/api/`:

- `/api/accounts/` - User authentication endpoints
- `/api/dashboard/` - Dashboard CRUD operations
- `/api/orders/` - Order data endpoints
- `/api/analytics/` - Analytics data endpoints

## Environment Variables

### Backend (.env)

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
