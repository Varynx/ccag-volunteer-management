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
  SelectInput,
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

      <SelectInput source = "reliable_transportation" choices={[
        { id: 'transport_yes', name: "Yes"},
        { id: 'transport_no', name: "No" }
      ]} />
      <SelectInput source="background_check_completed" choices={[
        { id: 'background_yes', name: 'Yes'},
        { id: 'background_no', name: 'No'}
      ]}/>
      <SelectInput source="excel_familiarity" choices={[
        { id: 'excel_lot', name: 'I know a lot'},
        { id: 'excel_some', name: 'I know some'},
        { id: 'excel_nothing', name: 'I know nothing'}
      ]}/>

      <NumberInput source="weekly_hours_available" />

      <SelectInput source="one_time_or_ongoing" choices={[
        { id: 'available_onetime', name: 'One-time events'},
        { id: 'available_ongoing', name: 'Ongoing roles'}
      ]}/>
      <SelectInput source="physical_activity" choices={[
        { id: 'physical_yes', name: 'Yes'},
        { id: 'physical_no', name: 'No'},
        { id: 'physical_depends', name:'Depends on the work'}
      ]}/>

      <NumberInput source="hours_needed" />

      <SelectInput source="student_classification" choices={[
        { id: 'classification_freshman', name: 'Freshman'},
        { id: 'classification_sophomore', name: 'Sophomore'},
        { id: 'classification_junior', name: 'Junior'},
        { id: 'classification_senior', name: 'Senior'}
      ]}/>
      <TextInput source="city" />

      <TextInput source="notes" />
    </SimpleForm>
  </Create>
);


