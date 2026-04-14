import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { VolunteerList, VolunteerCreate } from "./volunteers";

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