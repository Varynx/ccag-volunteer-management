import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { VolunteerList, VolunteerCreate } from "./volunteers";

import { VolunteerDashboard, VolunteerEdit } from "./volunteer_dashboard";

const Dashboard = () => <h1>App is working 🚀</h1>;


// Remap all 'name' to the 'volunteer' table for API calls
const remappedDataProvider = new Proxy(dataProvider, {
  get(target, prop) {
    const fn = target[prop as keyof typeof target];
    if (typeof fn !== "function") return fn;

    return (resource: string, ...args: unknown[]) => {
      const resolvedResource =
        resource === "volunteer_dashboard" ? "volunteer" : resource;
      return (fn as Function).call(target, resolvedResource, ...args);
    };
  },
});
function App() {
  return (
    <Admin dataProvider={remappedDataProvider} dashboard={Dashboard}>
      <Resource
        name="volunteer"
        options={{ label: 'Volunteer Info'}}
        list={VolunteerList}
        create={VolunteerCreate}
      />

      <Resource
        name="volunteer_dashboard"
        options={{ label: 'Volunteer Dashboard'}}
        list={VolunteerDashboard}
        edit={VolunteerEdit}
      />
    </Admin>
  );
}

export default App;