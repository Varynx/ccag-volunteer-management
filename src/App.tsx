import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { VolunteerList } from "./volunteers";
import { VolunteerInfoList } from "./volunteer_information";

const Dashboard = () => <h1>App is working 🚀</h1>;

function App() {
  return (
    <Admin dataProvider={dataProvider} dashboard={Dashboard}>
      {/*
       * Each <Resource> creates one sidebar tab.
       *   name    – must exactly match the Supabase table / view name
       *   list    – the component rendered at /<name>
       *   options – UI overrides (label shown in the sidebar)
       *
       * To add a new tab: import its list component and add another <Resource>.
       */}
      <Resource
        name="volunteer"
        list={VolunteerList}
        options={{ label: "Volunteers" }}
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
