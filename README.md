# manila-payroll-system

## Setup Instructions

### Backend
1. Clone the repo: `git clone https://github.com/JeffAlden/payroll-crud-react-nodejs.git`
2. Navigate to the backend folder: `cd backend`
3. Install dependencies: `npm install`
4. Create database `manila_payroll`
5. Configure MySQL in `config/db.js`.
6. include `"scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },`.
7. Start the server: `node app.js`

### Frontend
1. Navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the app: `npm start`
