import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { authProvider } from "./authProvider";
import { VolunteerList } from "./volunteers";
import { VolunteerInfoList } from "./volunteer_information";

function App() {
  return (
    <Admin dataProvider={dataProvider} authProvider={authProvider}>
      <Resource
        name="volunteer"
        list={VolunteerList}
        options={{ label: "Volunteer Directory" }}
      />
      <Resource
        name="volunteer_info"
        list={VolunteerInfoList}
        options={{ label: "Volunteer Information" }}
      />
    </Admin>
  );
}

export default App;
