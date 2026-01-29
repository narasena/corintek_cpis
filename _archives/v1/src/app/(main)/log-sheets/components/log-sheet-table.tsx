import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ILogSheet } from '@/types/log-sheet.type';

const styles = StyleSheet.create({
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f3f4f6',
    padding: 2,
  },
  tableCol: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableCellHeader: {
    margin: 'auto',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableCell: {
    margin: 'auto',
    fontSize: 9,
    textAlign: 'center',
  },
});

interface ILogSheetValueTableProps {
  data: ILogSheet['details'];
}

export default function LogSheetValueTable(props: ILogSheetValueTableProps) {
  // Group data by type for different table layouts
  const unitGroups = props.data.filter(
    group => group.units.length > 0 && group.units[0].unitInfo !== null
  );

  // Find specific groups
  const coolingTowerGroup = props.data.find(
    group => group.groupInfo.name === 'Cooling Tower Water Quality'
  );
  const rawWaterGroup = props.data.find(
    group => group.groupInfo.name === 'Raw Water Quality'
  );
  const waterMeterGroup = props.data.find(
    group => group.groupInfo.name === 'Water Meter Consumption'
  );

  // Get all unit numbers from cooling tower groups
  const getCoolingTowerUnits = (): number[] => {
    const ctRelatedGroups = props.data.filter(
      group =>
        group.groupInfo.name.includes('Cooling Tower') ||
        group.groupInfo.name.includes('General Condition') ||
        group.groupInfo.name.includes('Job Description')
    );

    const allUnits = ctRelatedGroups.flatMap(group =>
      group.units
        .filter(unit => unit.unitInfo !== null)
        .map(unit => unit.unitInfo!.unitNumber)
    );

    return Array.from(new Set(allUnits)).sort((a, b) => a - b);
  };

  const coolingTowerUnits = getCoolingTowerUnits();

  const renderUnitGroupTable = (group: any) => {
    const units = group.units.filter((unit: any) => unit.unitInfo !== null);
    const unitNumbers = units
      .map((unit: any) => unit.unitInfo.unitNumber)
      .sort((a: number, b: number) => a - b);

    // Dynamic column widths based on number of units
    const groupColWidth = unitNumbers.length <= 3 ? '15%' : '10%';
    const paramColWidth = unitNumbers.length <= 3 ? '20%' : '12%';
    const unitColWidth = unitNumbers.length <= 3 ? '20%' : '12%';

    return (
      <View key={group.groupInfo.id} style={{ marginBottom: 10 }}>
        {/* Header for this group */}
        <View style={[styles.tableRow, { width: '100%' }]}>
          <View style={[styles.tableColHeader, { width: groupColWidth }]}>
            <Text style={styles.tableCellHeader}>{group.groupInfo.name}</Text>
          </View>
          <View style={[styles.tableColHeader, { width: paramColWidth }]}>
            <Text style={styles.tableCellHeader}>Parameter</Text>
          </View>
          {unitNumbers.map((unitNum: number) => (
            <View
              key={unitNum}
              style={[styles.tableColHeader, { width: unitColWidth }]}
            >
              <Text style={styles.tableCellHeader}>Unit {unitNum}</Text>
            </View>
          ))}
        </View>

        {/* Parameter rows - get all unique parameters */}
        {(() => {
          const allParams = units[0].parameters;
          return allParams.map((param: any) => (
            <View key={param.id} style={[styles.tableRow, { width: '100%' }]}>
              <View style={[styles.tableCol, { width: groupColWidth }]}>
                <Text style={styles.tableCell}> </Text>
              </View>
              <View style={[styles.tableCol, { width: paramColWidth }]}>
                <Text style={styles.tableCell}>
                  {param.name}
                  {param.unit && ` (${param.unit})`}
                </Text>
              </View>
              {unitNumbers.map((unitNum: number) => {
                const unit = units.find(
                  (u: any) => u.unitInfo.unitNumber === unitNum
                );
                const parameter = unit?.parameters.find(
                  (p: any) => p.id === param.id
                );
                return (
                  <View
                    key={unitNum}
                    style={[styles.tableCol, { width: unitColWidth }]}
                  >
                    <Text style={styles.tableCell}>
                      {parameter?.value?.toString() || 'N/A'}
                    </Text>
                  </View>
                );
              })}
            </View>
          ));
        })()}
      </View>
    );
  };

  const renderMixedWaterQualityTable = () => {
    if (!coolingTowerGroup || !rawWaterGroup) return null;

    const paramColWidth = '15%';
    const unitColWidth = '10%';
    const rawColWidth = '10%';
    const limitColWidth = '8%';

    return (
      <View style={{ marginBottom: 10 }}>
        {/* Header */}
        <View style={[styles.tableRow, { width: '100%' }]}>
          <View style={[styles.tableColHeader, { width: paramColWidth }]}>
            <Text style={styles.tableCellHeader}>Parameter</Text>
          </View>
          {coolingTowerUnits.map((unitNum: number) => (
            <View
              key={unitNum}
              style={[styles.tableColHeader, { width: unitColWidth }]}
            >
              <Text style={styles.tableCellHeader}>CT Unit {unitNum}</Text>
            </View>
          ))}
          <View style={[styles.tableColHeader, { width: rawColWidth }]}>
            <Text style={styles.tableCellHeader}>Raw Water</Text>
          </View>
          <View style={[styles.tableColHeader, { width: limitColWidth }]}>
            <Text style={styles.tableCellHeader}>Raw Limit</Text>
          </View>
        </View>

        {/* Parameter rows */}
        {coolingTowerGroup.units[0].parameters.map((param: any) => (
          <View key={param.id} style={[styles.tableRow, { width: '100%' }]}>
            <View style={[styles.tableCol, { width: paramColWidth }]}>
              <Text style={styles.tableCell}>
                {param.name}
                {param.unit && param.unit !== 'null' && ` (${param.unit})`}
              </Text>
            </View>
            {coolingTowerUnits.map((unitNum: number) => {
              const unit = coolingTowerGroup.units.find(
                (u: any) => u.unitInfo?.unitNumber === unitNum
              );
              const parameter = unit?.parameters.find(
                (p: any) => p.id === param.id
              );
              return (
                <View
                  key={unitNum}
                  style={[styles.tableCol, { width: unitColWidth }]}
                >
                  <Text style={styles.tableCell}>
                    {parameter?.value?.toString() || 'N/A'}
                  </Text>
                </View>
              );
            })}
            {/* Raw Water value */}
            <View style={[styles.tableCol, { width: rawColWidth }]}>
              <Text style={styles.tableCell}>
                {rawWaterGroup.units[0]?.parameters
                  .find((p: any) => p.id === param.id)
                  ?.value?.toString() || 'N/A'}
              </Text>
            </View>
            {/* Raw Limit (placeholder - would need limit data) */}
            <View style={[styles.tableCol, { width: limitColWidth }]}>
              <Text style={styles.tableCell}>-</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderWaterMeterTable = () => {
    if (!waterMeterGroup) return null;

    return (
      <View style={{ marginBottom: 10 }}>
        {/* Header */}
        <View style={[styles.tableRow, { width: '100%' }]}>
          <View style={[styles.tableColHeader, { width: '30%' }]}>
            <Text style={styles.tableCellHeader}>Water Meter Consumption</Text>
          </View>
          <View style={[styles.tableColHeader, { width: '30%' }]}>
            <Text style={styles.tableCellHeader}>Chemicals Name</Text>
          </View>
        </View>

        {/* Parameter rows */}
        {waterMeterGroup.units[0].parameters.map((param: any) => (
          <View key={param.id} style={[styles.tableRow, { width: '100%' }]}>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={styles.tableCell}>{param.name}</Text>
            </View>
            <View style={[styles.tableCol, { width: '30%' }]}>
              <Text style={styles.tableCell}>
                {param.value?.toString() || 'N/A'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.table}>
      {/* Unit Condensor Table */}
      {unitGroups
        .filter(group => group.groupInfo.name.includes('Unit Condensor'))
        .map(renderUnitGroupTable)}

      {/* Unit Evaporator Table */}
      {unitGroups
        .filter(group => group.groupInfo.name.includes('Unit Evaporator'))
        .map(renderUnitGroupTable)}

      {/* Mixed Water Quality Table */}
      {renderMixedWaterQualityTable()}

      {/* General Condition and Job Description Tables */}
      {unitGroups
        .filter(
          group =>
            group.groupInfo.name.includes('General Condition') ||
            group.groupInfo.name.includes('Job Description')
        )
        .map(renderUnitGroupTable)}

      {/* Water Meter Consumption Table */}
      {renderWaterMeterTable()}
    </View>
  );
}
