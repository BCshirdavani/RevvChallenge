# Revv Technical Challenge

## Goal:
The goal is outlined here: https://gist.github.com/kschutt/4f4a79365429bee99db698004a273ff8

## How to Deploy
1. Clone this repo
2. Create `.env` file in the same directory where the `package.json` file is
3. Add the following 2 lines in this `.env` file, which will be used to hold environment variables for the data API url, and a flag used for testing:
   1. `REACT_APP_DONATIONS_URL=https://jyy74t2sj0.execute-api.us-east-1.amazonaws.com/v1/donations`
   2. `REACT_APP_USE_FAKE_DATA=false`
4. run `npm install` to install the dependencies
5. to run the unit tests, use ` npm test a` command
6. for testing, run `npm start` and visit the site at http://localhost:3000
7. to deploy, run `npm run build`
8. then run `npx serve build`, and visit the site at http://localhost:3000

## Tools Used
 - The starting foundation was built from a React.js template with TypeScript and Redux 
   - command: `npx create-react-app my-app --template redux-typescript`
   - source: https://react-redux.js.org/introduction/getting-started
 - State management:
   - Most components have 2 types of state variables:
     - For state variables that are only used locally to refresh and render 1 component, I did not connect them to the redux store.
     - For state variables that are needed accross multiple components, I connected these to the Redux Store (`donations: IDonation[]`)
   - Once the parent component App.tsx retrieves the API data, it is converted into the type `IDonation[]`, and saved in the redux store, which all child components have access to.
     - For me, this seemed easier/cleaner than passing state variables around as props to the children.
 - I chose to use TypeScript rather than JavaScript because I like the IntelliSense features that it offers. It also safeguards me from silly typo mistakes. 
 - Most styled components came from the following libraries:
   - Bar/Line Charts:
     - source: https://recharts.org/en-US/
   - Map: 
     - source: https://www.react-simple-maps.io
   - Table / List: 
     - source: https://react-bootstrap.github.io
   - DatePicker:
     - source: https://www.npmjs.com/package/react-date-picker
 - HTTP requests are made with Axios: 
   - source: https://axios-http.com/docs/intro
 - Hosing is on Google Cloud Platform:
   - created an instance of an Ubuntu VM with public IP address
 - Deployed using the following:
   - npx to serve the app:
     - source: https://www.npmjs.com/package/npx
   - tmux to keep the terminal shell alive while serving the app in background
     - source: https://github.com/tmux/tmux/wiki

## Notes
- ad blockers may cause a network error, and the GET request will be unable to get the data from the API. Please disable ad blockers, otherwise an alert will pop up, rather than charts rendering.
- This app does not clean / validate data being returned from the fake data API. It assumes they are all valid entries.
- Chart plots data by hour. Fake data appears to be coming in relatively short time frames. However, if the data were to span a longer time frame, then the chart bars could look very thin on an hourly basis. This app does not re-bucket the data into larger date windows.
- Updates to the DB will not automatically refresh the charts, the user must refresh the browser to trigger a new GET request and update the data.
