import { Admin, defaultTheme, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { VolunteerList, VolunteerCreate } from "./volunteers";
import { createTheme } from "@mui/material";


const Dashboard = () => <h1>App is working 🚀</h1>;

function App() {
  return (
    <Admin dataProvider={dataProvider} dashboard={Dashboard}>
      <Resource
        name="volunteer"
        list={VolunteerList}
        create={VolunteerCreate}
      />
    </Admin>
  );
}

export default App;