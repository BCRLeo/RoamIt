# RoamIt
## General
Create a file called `.env` in the root directory `RoamIt` and define environment variables `PASSWORD_HASH` and `GOOGLE_API_KEY` with a suitable hash and Google API key.


## Frontend
### Initial Project Setup
*For information on setting up the project after cloning the repository, refer to the following section. This subsection documents how the project has been set up. Do not run these steps, they are only here for documentation.*

Create the React project with Vite by running
```
npm create vite@latest
```
Select React, then TypeScript.

Next, run
```
cd frontend
npm ci
```
to install the dependencies.

Finally, run
```
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```
to install the Material UI design library.

### Project Setup
Ensure that Node.js is installed. Open the `frontend` directory with
```
cd frontend
```
then run
```
npm ci
```
to install all dependencies.

### Running and building
Open the `frontend` directory with
```
cd frontend
```
To start a local development server with live updates, run the script
```
npm run dev
```
To build the React project into a static site for production, run the script
```
npm run build
```
To automatically build the project after a change, run
```
npm run build-watch
```


## Backend
### Database setup
Run
```
python init_db.py
```
to initialize the database file.

### Migrating database
Run 
```
pip install alembic
```
to make sure you have Alembic installed and installs it if you don't.

Next, run 
```
alembic revision --autogenerate -m "migration name"
```
to generate a migration script. Finally, run
```
alembic upgrade head
```
to apply the migration. 
WARNING: if your migration involves the renaming of tables, you will have to do that manually as alembic won't do it and instead will give you an error.
