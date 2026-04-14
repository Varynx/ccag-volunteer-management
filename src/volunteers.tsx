import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  Create,
  SimpleForm,
  TextInput,
  DateInput,
  NumberInput,
} from "react-admin";

export const VolunteerList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <DateField source="created_at" />

      <TextField source="name" />
      <TextField source="email" />
      <TextField source="phone_number" />
      <TextField source="zip_code" />

      <DateField source="birthdate" />

      <TextField source="reliable_transportation" />
      <TextField source="background_check_completed" />
      <TextField source="excel_familiarity" />

      <NumberField source="weekly_hours_available" />

      <TextField source="one_time_or_ongoing" />
      <TextField source="physical_activity" />

      <NumberField source="hours_needed" />

      <TextField source="student_classification" />
      <TextField source="city" />

      <TextField source="notes" />
    </Datagrid>
  </List>
);

export const VolunteerCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="phone_number" />
      <TextInput source="zip_code" />

      <DateInput source="birthdate" />

      <TextInput source="reliable_transportation" />
      <TextInput source="background_check_completed" />
      <TextInput source="excel_familiarity" />

      <NumberInput source="weekly_hours_available" />

      <TextInput source="one_time_or_ongoing" />
      <TextInput source="physical_activity" />

      <NumberInput source="hours_needed" />

      <TextInput source="student_classification" />
      <TextInput source="city" />

      <TextInput source="notes" />
    </SimpleForm>
  </Create>
);