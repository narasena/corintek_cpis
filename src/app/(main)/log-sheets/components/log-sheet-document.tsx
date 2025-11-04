import React from 'react';
import * as PDFRenderer from '@react-pdf/renderer';
import LogSheetValueTable from './log-sheet-table';
import { ILogSheet } from '@/types/log-sheet.type';
import useLogSheetDetails from '../hooks/useLogSheetDetails';

// You MUST use StyleSheet.create - Tailwind won't work in PDF context
const styles = PDFRenderer.StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 30, // Similar to Tailwind's p-8
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Similar to mb-5
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // Similar to border-gray-200
  },
  headerText: {
    fontSize: 10, // Similar to text-2xl
    fontWeight: 'semibold',
    color: '#111827', // Similar to text-gray-900
  },
  pageTitle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10, // Similar to gap-2
    alignItems: 'center',
    marginBottom: 20, // Similar to mb-5
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    alignItems: 'center',
    color: '#0058A8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  infoGrid: {
    flexDirection: 'column',
    marginBottom: 20,
    fontSize: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  labelLeft: {
    fontWeight: 'bold',
    color: '#374151',
    width: '15%',
  },
  colonLeft: {
    color: '#374151',
    width: '2%',
  },
  valueLeft: {
    color: '#6b7280',
    width: '51%',
    paddingRight: 10,
  },
  labelRight: {
    fontWeight: 'bold',
    color: '#374151',
    width: '15%',
  },
  colonRight: {
    color: '#374151',
    width: '2%',
  },
  valueRight: {
    color: '#6b7280',
    width: '15%',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#374151', // Similar to text-gray-700
  },
  cardValue: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export interface ILogSheetDocumentProps {
  date: string;
  projectName: string;
  clientName: string;
  approverName: string;
  data: ILogSheet['details'];
}

const LogSheetDocumentCreation = (props: ILogSheetDocumentProps) => (
  <PDFRenderer.Document>
    <PDFRenderer.Page size="A4" style={styles.page}>
      {/* Header */}
      <PDFRenderer.View style={styles.header}>
        <PDFRenderer.Text style={styles.headerText}>Log Sheet</PDFRenderer.Text>
      </PDFRenderer.View>
      {/* Title */}
      <PDFRenderer.View style={styles.pageTitle}>
        <PDFRenderer.Image
          src={'/icon.png'}
          style={{
            width: '50px',
            height: '50px',
          }}
        />
        <PDFRenderer.View style={styles.title}>
          <PDFRenderer.Text>PT. CORINTEK INTI SEJAHTERA</PDFRenderer.Text>
          <PDFRenderer.Text style={styles.subtitle}>
            Water Treatment and Chemical Specialist
          </PDFRenderer.Text>
        </PDFRenderer.View>
      </PDFRenderer.View>
      {/* Document Info */}
      <PDFRenderer.View style={styles.infoGrid}>
        <PDFRenderer.View style={styles.infoRow}>
          <PDFRenderer.Text style={styles.labelLeft}>
            Client Name
          </PDFRenderer.Text>
          <PDFRenderer.Text style={styles.colonLeft}>:</PDFRenderer.Text>
          <PDFRenderer.Text style={styles.valueLeft}>
            {props.clientName || '-'}
          </PDFRenderer.Text>
          <PDFRenderer.Text style={styles.labelRight}>Date</PDFRenderer.Text>
          <PDFRenderer.Text style={styles.colonRight}>:</PDFRenderer.Text>
          <PDFRenderer.Text style={styles.valueRight}>
            {new Date().toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </PDFRenderer.Text>
        </PDFRenderer.View>

        <PDFRenderer.View style={styles.infoRow}>
          <PDFRenderer.Text style={styles.labelLeft}>
            Project Name
          </PDFRenderer.Text>
          <PDFRenderer.Text style={styles.colonLeft}>:</PDFRenderer.Text>
          <PDFRenderer.Text style={styles.valueLeft}>
            {props.projectName || '-'}
          </PDFRenderer.Text>
          <PDFRenderer.Text style={styles.labelRight}>
            Approved By
          </PDFRenderer.Text>
          <PDFRenderer.Text style={styles.colonRight}>:</PDFRenderer.Text>
          <PDFRenderer.Text style={styles.valueRight}>
            {props.approverName || '-'}
          </PDFRenderer.Text>
        </PDFRenderer.View>
      </PDFRenderer.View>
      {/* Table */}
      <LogSheetValueTable data={props.data || []} />
    </PDFRenderer.Page>
  </PDFRenderer.Document>
);

export default function LogSheetDocument(props: ILogSheetDocumentProps) {
  const { logSheetDetails, isLoading, refetchLogSheetDetails } =
    useLogSheetDetails('3a9efcd1-c86a-4b26-b2a6-fadcbd5d0c89');
  return (
    <PDFRenderer.PDFViewer width="100%" height="900px">
      <LogSheetDocumentCreation
        date={logSheetDetails?.date || ''}
        projectName={logSheetDetails?.project.name || ''}
        clientName={'TEST'}
        approverName={'TEST'}
        data={logSheetDetails?.details || []}
      />
    </PDFRenderer.PDFViewer>
  );
}
