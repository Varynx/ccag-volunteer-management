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
  TopToolbar
} from "react-admin";

const ListActions = () => (
  <TopToolbar>
    <img
      src="/CCAG_Logo.png"
      alt="CCAG Logo"
      style={{ height: "100px", width: "200px", objectFit: "contain"}}
    />
  </TopToolbar>
);

export const VolunteerList = () => (
  <List actions={<ListActions />} perPage={100}>
    <Datagrid
      sx={{
        // Horizontal scrolling on columns
        "& .RaList-content": { 
          overflowX: "auto" 
        },

        // Compact row height
        "& .RaDatagrid-row": {
          height: "24px",
        },
        // Prevent text wrapping and truncate with ellipsis
        "& .RaDatagrid-rowCell": {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "230px",
          padding: "4px 8px",
        },
        // Compact header
        "& .RaDatagrid-headerCell": {
          whiteSpace: "nowrap",
          padding: "4px 8px",
          fontWeight: "bold",
          backgroundColor: "#f5f5f5",
        },
        // Hide id column visually but keep it in the DOM
        "& .column-id": {
          display: "none",
        },
        // Hide created_at column visually but keep it in the DOM
        "& .column-created_at": {
          display: "none",
        },
      }}
      >

      <TextField source="id" />
      <DateField source="created_at" />

      <TextField source="name" />
      <TextField source="email" />
      <TextField source="phone_number" label="Phone Number" />
      <TextField source="city" />
      <TextField source="zip_code" label="Zip Code"/>

      <DateField source="birthdate" />

      <TextField source="reliable_transportation" label="Transportation" />
      <TextField source="background_check_completed" label="Background Check"/>
      <TextField source="excel_familiarity" />

      <NumberField source="weekly_hours_available" label="Weekly Hours Available" />

      <TextField source="one_time_or_ongoing" />
      <TextField source="physical_activity" />

      <NumberField source="hours_needed" />

      <TextField source="student_classification" label="Classification" />

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