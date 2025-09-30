import { IFormFields } from "../../users/data/userFormFields";

export const createClientFormFields: IFormFields[] = [
  {
    name: "name",
    type: "text",
    label: "Client Name",
    placeHolder: "Client Name",
    description: "The name of the client",
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    placeHolder: "Email",
    description: "The email of the client",
  },
  {
    name: "phoneNumber",
    type: "text",
    label: "Phone Number",
    placeHolder: "Phone Number",
    description: "The phone number of the client",
  },
  {
    name: "websiteUrl",
    type: "text",
    label: "Website URL",
    placeHolder: "Website URL",
    description: "The website URL of the client",
  },
  {
    name: "description",
    type: "text",
    className: "col-span-2",
    label: "Description",
    placeHolder: "Description",
    description: "The description of the client",
  },
  {
    name: "address",
    type: "text",
    className: "col-span-2",
    label: "Address",
    placeHolder: "Address",
    description: "The address of the client",
  },
];
