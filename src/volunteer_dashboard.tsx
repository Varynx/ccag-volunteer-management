import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  SimpleForm,
  TextInput,
  Edit
} from "react-admin";


export const VolunteerDashboard = () => (

    <List>
        <Datagrid rowClick="edit">
            <TextField source="name"/>
            <TextField source="hours_needed"/>
            <EditButton/>
        </Datagrid>
    </List>
);

export const VolunteerEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="hours_needed"/>
        </SimpleForm>
    </Edit>
);