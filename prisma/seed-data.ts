/**
 * Seed Data
 *
 * Generated: 2026-02-03T06:23:23.391Z
 *
 * This file contains exported data from the database.
 * To restore this data, run: npx tsx prisma/seed-data.ts
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

export const seedData = {
  "users": [
    {
      "id": "36c8af4e-0895-429a-81b8-183ff0698bf4",
      "firstName": "Corintek",
      "lastName": "Satu",
      "idNumber": "COR-01",
      "email": "corintek01@mail.com",
      "phoneNumber": "0811000001",
      "password": "$2b$10$luMQ90N3BoUq.2WkSBbpn.AWlV0QbCLUof9SLKn/kzilR/h8JISMC",
      "avatarUrl": null,
      "role": "ADMIN",
      "employmentStatus": "PERMANENT",
      "isActive": true,
      "isBlocked": false,
      "createdAt": "2026-02-03T05:11:15.348Z",
      "updatedAt": "2026-02-03T05:11:15.348Z",
      "deletedAt": null
    },
    {
      "id": "ae3a9c6e-1f03-4424-ad73-495ce9fb23a2",
      "firstName": "Corintek",
      "lastName": "Dua",
      "idNumber": "COR-02",
      "email": "corintek02@mail.com",
      "phoneNumber": "0811000002",
      "password": "$2b$10$GbL9J8Op7etFTs9prf/Bqupxdx3E3VsBBLrw9wutN3jFtxJW.MT12",
      "avatarUrl": null,
      "role": "DIRECTOR",
      "employmentStatus": "PERMANENT",
      "isActive": true,
      "isBlocked": false,
      "createdAt": "2026-02-03T05:12:34.410Z",
      "updatedAt": "2026-02-03T05:12:34.410Z",
      "deletedAt": null
    },
    {
      "id": "8cd5b39e-caa7-4a37-817c-531a3644586d",
      "firstName": "Corintek",
      "lastName": "Tiga",
      "idNumber": "COR-03",
      "email": "corintek03@mail.com",
      "phoneNumber": "0811000003",
      "password": "$2b$10$RGCzDRrb2wz050q6tE5HB.Tu.oKDfagHcA7Sw03Eb9.GJXNSkSOy.",
      "avatarUrl": null,
      "role": "SUPERVISOR",
      "employmentStatus": "PERMANENT",
      "isActive": true,
      "isBlocked": false,
      "createdAt": "2026-02-03T05:13:29.307Z",
      "updatedAt": "2026-02-03T05:13:29.307Z",
      "deletedAt": null
    },
    {
      "id": "bb8c28a2-48b1-4acf-8723-ff0703aa96aa",
      "firstName": "Corintek",
      "lastName": "Empat",
      "idNumber": "COR-04",
      "email": "corintek04@mail.com",
      "phoneNumber": "0811000004",
      "password": "$2b$10$O1.eIsEPSzYMQXzoKo2B/OffNJtw8HUSNZ7F5MkaouWCLzwiqdCcq",
      "avatarUrl": null,
      "role": "TECHNICIAN",
      "employmentStatus": "CONTRACT",
      "isActive": true,
      "isBlocked": false,
      "createdAt": "2026-02-03T05:14:24.123Z",
      "updatedAt": "2026-02-03T05:14:24.123Z",
      "deletedAt": null
    }
  ],
  "clients": [
    {
      "id": "7b3c6d5e-4f1a-4c9b-8d2e-1a2b3c4d5e6f",
      "name": "Test Client",
      "email": "client@test.com",
      "phoneNumber": "123456789",
      "address": "Test Address",
      "createdAt": "2026-02-03T05:06:44.491Z",
      "updatedAt": "2026-02-03T05:06:44.491Z",
      "deletedAt": null
    },
    {
      "id": "e90d04e7-e1ac-4bdc-8878-b67e081d5c47",
      "name": "PT. Morat Marit",
      "email": "",
      "phoneNumber": "",
      "address": "",
      "createdAt": "2026-02-03T05:14:54.864Z",
      "updatedAt": "2026-02-03T05:14:54.864Z",
      "deletedAt": null
    }
  ],
  "projects": [
    {
      "id": "1a46c3a4-5380-405e-b73b-a7881c042aad",
      "clientId": "7b3c6d5e-4f1a-4c9b-8d2e-1a2b3c4d5e6f",
      "name": "Test Project",
      "description": "Test Description",
      "quoteNumber": "Q-001",
      "poNumber": "PO-001",
      "startDate": "2026-02-03T05:06:44.491Z",
      "endDate": null,
      "status": "ONGOING",
      "createdAt": "2026-02-03T05:06:44.491Z",
      "updatedAt": "2026-02-03T05:06:44.491Z",
      "deletedAt": null
    },
    {
      "id": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "clientId": "e90d04e7-e1ac-4bdc-8878-b67e081d5c47",
      "name": "City Tower",
      "description": "",
      "quoteNumber": "",
      "poNumber": "",
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": "2026-04-30T00:00:00.000Z",
      "status": "ONGOING",
      "createdAt": "2026-02-03T05:40:22.342Z",
      "updatedAt": "2026-02-03T05:40:22.342Z",
      "deletedAt": null
    }
  ],
  "machines": [
    {
      "id": "d6e6a030-d91a-3600-ba1a-2a15a68d41b2",
      "projectId": "1a46c3a4-5380-405e-b73b-a7881c042aad",
      "unitNumber": 1,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:06:44.491Z",
      "updatedAt": "2026-02-03T05:06:44.491Z",
      "deletedAt": null
    },
    {
      "id": "1eaa4230-bbc0-c0d0-a019-d623f7a20258",
      "projectId": "1a46c3a4-5380-405e-b73b-a7881c042aad",
      "unitNumber": 2,
      "type": "COOLING_TOWER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:06:44.491Z",
      "updatedAt": "2026-02-03T05:06:44.491Z",
      "deletedAt": null
    },
    {
      "id": "e3ffca1b-3f20-476b-a953-ca9356616226",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 1,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": 250,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "0d4fe5d1-2590-498a-a142-47707f5be8c8",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 2,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": 250,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "2f475a64-b6fa-47cf-a4aa-448fd4528ba1",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 3,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": 450,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "4e764a6f-1197-4932-9857-03580a251126",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 4,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": 450,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "50869eac-1397-439e-bdc1-8fa8e474213c",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 5,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": 450,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "e55203fc-e3a1-40e4-a4b6-c295e524ec9b",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 6,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": 450,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "aca1b77f-7c23-4988-8d04-0c11af5c0cc3",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 7,
      "type": "CHILLER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": 450,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "603fc79b-090b-4621-ad86-73d4477e8c48",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 1,
      "type": "COOLING_TOWER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "d6865f25-602a-41ad-bcf1-f4fe2a7702d4",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 2,
      "type": "COOLING_TOWER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "9ca7bf36-914c-4e9f-868e-693704d8af31",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 3,
      "type": "COOLING_TOWER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "1a39c7c1-add7-471f-b5be-b06ce2a6656a",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 4,
      "type": "COOLING_TOWER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "76e85fa0-536c-49ef-9f6f-3c6dd8774c76",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 5,
      "type": "COOLING_TOWER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    },
    {
      "id": "12285529-c53b-4e18-b4ff-56191570e39f",
      "projectId": "ee5de585-174c-44ed-bb56-81a74622eb55",
      "unitNumber": 6,
      "type": "COOLING_TOWER",
      "ownership": "CLIENT",
      "status": "RUNNING",
      "capacity": null,
      "brand": null,
      "model": null,
      "serialNumber": null,
      "createdAt": "2026-02-03T05:40:22.517Z",
      "updatedAt": "2026-02-03T05:40:22.517Z",
      "deletedAt": null
    }
  ],
  "parameters": [
    {
      "id": "c2ffee0b-5a72-2574-9e26-3bf9fea66947",
      "name": "Temp In",
      "variableName": "temp_in_cond",
      "category": "UNIT_CONDENSOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:05:40.046Z",
      "updatedAt": "2026-02-03T05:44:07.097Z",
      "deletedAt": null
    },
    {
      "id": "1776bbfb-2e01-4d9c-a884-365d36b7286a",
      "name": "Temp Out",
      "variableName": "temp_out_cond",
      "category": "UNIT_CONDENSOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:54:24.580Z",
      "updatedAt": "2026-02-03T05:54:24.580Z",
      "deletedAt": null
    },
    {
      "id": "b612830c-781d-467e-b548-d60feec07446",
      "name": "Saturated Temp",
      "variableName": "saturated_temp_cond",
      "category": "UNIT_CONDENSOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:55:10.776Z",
      "updatedAt": "2026-02-03T05:55:10.776Z",
      "deletedAt": null
    },
    {
      "id": "e936228d-224f-41bb-88ff-ec3e8954270b",
      "name": "Approach",
      "variableName": "approach_cond",
      "category": "UNIT_CONDENSOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:55:26.517Z",
      "updatedAt": "2026-02-03T05:55:26.517Z",
      "deletedAt": null
    },
    {
      "id": "574fb313-d704-405d-8566-66591e9753bc",
      "name": "Load Demand / RLA",
      "variableName": "load_demand_rla_cond",
      "category": "UNIT_CONDENSOR",
      "valueType": "NUMBER",
      "unit": "%",
      "minValue": 0,
      "maxValue": 100,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:55:51.137Z",
      "updatedAt": "2026-02-03T05:55:51.137Z",
      "deletedAt": null
    },
    {
      "id": "1835e337-c3ab-435e-ba5d-131337c2752f",
      "name": "Ampere",
      "variableName": "ampere_cond",
      "category": "UNIT_CONDENSOR",
      "valueType": "NUMBER",
      "unit": "A",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:56:08.878Z",
      "updatedAt": "2026-02-03T05:56:08.878Z",
      "deletedAt": null
    },
    {
      "id": "12e25fc4-162f-477c-bbed-edc473517ac1",
      "name": "Temp In",
      "variableName": "temp_in_evap",
      "category": "UNIT_EVAPORATOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:56:33.175Z",
      "updatedAt": "2026-02-03T05:56:33.175Z",
      "deletedAt": null
    },
    {
      "id": "8f78737e-91ac-4dae-a0ec-cee2e1780b8f",
      "name": "Temp Out",
      "variableName": "temp_out_evap",
      "category": "UNIT_EVAPORATOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:57:08.332Z",
      "updatedAt": "2026-02-03T05:57:08.332Z",
      "deletedAt": null
    },
    {
      "id": "9cfdffc4-9791-4080-9468-dec374d3e94e",
      "name": "Saturated Temp",
      "variableName": "saturated_temp_evap",
      "category": "UNIT_EVAPORATOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:57:22.992Z",
      "updatedAt": "2026-02-03T05:57:22.992Z",
      "deletedAt": null
    },
    {
      "id": "7a0e48f9-4681-4f1c-ba32-08fe7bef15cf",
      "name": "Approach",
      "variableName": "approach_evap",
      "category": "UNIT_EVAPORATOR",
      "valueType": "NUMBER",
      "unit": "°C",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:57:39.617Z",
      "updatedAt": "2026-02-03T05:57:39.617Z",
      "deletedAt": null
    },
    {
      "id": "c8a2d441-1156-4c16-b669-60a4206f6a3d",
      "name": "pH",
      "variableName": "ph_ct",
      "category": "COOLING_WATER_QUALITY",
      "valueType": "NUMBER",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:57:56.224Z",
      "updatedAt": "2026-02-03T05:57:56.224Z",
      "deletedAt": null
    },
    {
      "id": "be74d46c-6774-4185-a4d8-fe29d45b6a3d",
      "name": "TDS",
      "variableName": "tds_ct",
      "category": "COOLING_WATER_QUALITY",
      "valueType": "NUMBER",
      "unit": "ppm",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:58:18.185Z",
      "updatedAt": "2026-02-03T05:58:18.185Z",
      "deletedAt": null
    },
    {
      "id": "ace50b83-7a86-4a32-af62-52a0f2e8b47f",
      "name": "Conductivity",
      "variableName": "conductivity_ct",
      "category": "COOLING_WATER_QUALITY",
      "valueType": "NUMBER",
      "unit": "μS",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:58:43.282Z",
      "updatedAt": "2026-02-03T05:58:43.282Z",
      "deletedAt": null
    },
    {
      "id": "9dfa9f43-d0b5-44a2-8e26-130df9be57f8",
      "name": "Cycle",
      "variableName": "cycle_ct",
      "category": "COOLING_WATER_QUALITY",
      "valueType": "NUMBER",
      "unit": "Cycle",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:59:09.484Z",
      "updatedAt": "2026-02-03T05:59:09.484Z",
      "deletedAt": null
    },
    {
      "id": "a4eeba4d-0dc1-4e59-a098-f8313b6e6880",
      "name": "Running Status",
      "variableName": "running_status_ct",
      "category": "GENERAL_CONDITION",
      "valueType": "BOOLEAN",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:59:34.909Z",
      "updatedAt": "2026-02-03T05:59:34.909Z",
      "deletedAt": null
    },
    {
      "id": "f2442eea-e03e-493a-9c41-56a22ea53dd4",
      "name": "Algae/Lumut",
      "variableName": "algae_ct",
      "category": "GENERAL_CONDITION",
      "valueType": "BOOLEAN",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T05:59:51.762Z",
      "updatedAt": "2026-02-03T05:59:51.762Z",
      "deletedAt": null
    },
    {
      "id": "b723cf11-3d81-41b8-b749-37609e483cd7",
      "name": "Deposit",
      "variableName": "deposit_ct",
      "category": "COOLING_WATER_QUALITY",
      "valueType": "BOOLEAN",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:00:09.264Z",
      "updatedAt": "2026-02-03T06:00:09.264Z",
      "deletedAt": null
    },
    {
      "id": "b501af54-99a1-44f1-8fae-277277ecf74e",
      "name": "Cleaning Hot Basin",
      "variableName": "cleaning_hot_basin_ct",
      "category": "JOB_DESCRIPTION",
      "valueType": "BOOLEAN",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:00:39.850Z",
      "updatedAt": "2026-02-03T06:00:39.850Z",
      "deletedAt": null
    },
    {
      "id": "ed05f84c-f829-42b4-b707-69e89edb4d04",
      "name": "Cleaning Cool Basin",
      "variableName": "cleaning_cool_basin_ct",
      "category": "JOB_DESCRIPTION",
      "valueType": "BOOLEAN",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:00:56.111Z",
      "updatedAt": "2026-02-03T06:00:56.111Z",
      "deletedAt": null
    },
    {
      "id": "9898ecb8-e683-4c9c-9ea5-c1ce20a5cb25",
      "name": "Cleaning Filler",
      "variableName": "cleaning_filler_ct",
      "category": "JOB_DESCRIPTION",
      "valueType": "BOOLEAN",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:01:16.517Z",
      "updatedAt": "2026-02-03T06:01:16.517Z",
      "deletedAt": null
    },
    {
      "id": "c7309307-3517-415f-a788-9bf1440bfb87",
      "name": "Cleaning Area",
      "variableName": "cleaning_area_ct",
      "category": "JOB_DESCRIPTION",
      "valueType": "BOOLEAN",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:01:36.232Z",
      "updatedAt": "2026-02-03T06:01:36.232Z",
      "deletedAt": null
    },
    {
      "id": "38c3512e-ec42-4735-a034-d289de1a5ebf",
      "name": "Before ",
      "variableName": "before_consumption_ct",
      "category": "CONSUMPTION",
      "valueType": "NUMBER",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:01:58.213Z",
      "updatedAt": "2026-02-03T06:01:58.213Z",
      "deletedAt": null
    },
    {
      "id": "af516dc6-75f2-4a1a-b2da-7261617e2fcd",
      "name": "After",
      "variableName": "after_consumption_ct",
      "category": "CONSUMPTION",
      "valueType": "NUMBER",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:02:11.983Z",
      "updatedAt": "2026-02-03T06:02:11.983Z",
      "deletedAt": null
    },
    {
      "id": "09917028-2ef5-4b50-80a2-6291722807a6",
      "name": "Total Consumption",
      "variableName": "total_consumption_ct",
      "category": "CONSUMPTION",
      "valueType": "NUMBER",
      "unit": "",
      "minValue": null,
      "maxValue": null,
      "displayOrder": 0,
      "isActive": true,
      "createdAt": "2026-02-03T06:02:35.446Z",
      "updatedAt": "2026-02-03T06:02:35.446Z",
      "deletedAt": null
    }
  ],
  "logSheets": [
    {
      "id": "7feb0bd2-5b6b-403c-a457-586dc11b1999",
      "projectId": "1a46c3a4-5380-405e-b73b-a7881c042aad",
      "date": "2026-02-03T05:07:59.141Z",
      "notes": null,
      "status": "DRAFT",
      "createdAt": "2026-02-03T05:08:01.287Z",
      "updatedAt": "2026-02-03T05:08:01.287Z",
      "deletedAt": null
    }
  ],
  "logSheetEntries": []
};

export async function main() {
  console.log('🔄 Seeding database...');

  try {
    // Seed Users
    if (seedData.users.length > 0) {
      console.log('  📦 Seeding users...');
      for (const user of seedData.users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        });
      }
    }

    // Seed Clients
    if (seedData.clients.length > 0) {
      console.log('  📦 Seeding clients...');
      for (const client of seedData.clients) {
        await prisma.client.upsert({
          where: { id: client.id },
          update: client,
          create: client,
        });
      }
    }

    // Seed Projects
    if (seedData.projects.length > 0) {
      console.log('  📦 Seeding projects...');
      for (const project of seedData.projects) {
        await prisma.project.upsert({
          where: { id: project.id },
          update: project,
          create: project,
        });
      }
    }

    // Seed Machines
    if (seedData.machines.length > 0) {
      console.log('  📦 Seeding machines...');
      for (const machine of seedData.machines) {
        await prisma.machine.upsert({
          where: { id: machine.id },
          update: machine,
          create: machine,
        });
      }
    }

    // Seed Parameters
    if (seedData.parameters.length > 0) {
      console.log('  📦 Seeding parameters...');
      for (const parameter of seedData.parameters) {
        await prisma.parameter.upsert({
          where: { id: parameter.id },
          update: parameter,
          create: parameter,
        });
      }
    }

    // Seed Log Sheets
    if (seedData.logSheets.length > 0) {
      console.log('  📦 Seeding log sheets...');
      for (const logSheet of seedData.logSheets) {
        await prisma.logSheet.upsert({
          where: { id: logSheet.id },
          update: logSheet,
          create: logSheet,
        });
      }
    }

    // Seed Log Sheet Entries
    if (seedData.logSheetEntries.length > 0) {
      console.log('  📦 Seeding log sheet entries...');
      for (const entry of seedData.logSheetEntries) {
        await prisma.logSheetEntry.upsert({
          where: { id: entry.id },
          update: entry,
          create: entry,
        });
      }
    }

    console.log('\n✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
