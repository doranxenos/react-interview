import styles from './SpreadSheet.module.sass';
import { Box, Flex } from '@chakra-ui/react';
import React, {useState, useEffect} from 'react';
import SpreadSheetCell from './SpreadSheetCell';
import _ from 'lodash'; // just pull in all of lodash since I don't care about bundle size for this exercise

const LOCAL_STORAGE_KEY = 'SpreadSheetData';
const COL_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

type FocusCoordinate = {
    rowIndex: number,
    columnIndex: number
}

type CellFocusRange = {
    start: FocusCoordinate,
    end?: FocusCoordinate // optional since we will omit it when this is a single cell focus range
}

// Data Model that supports multiple cell selection as well as multiple ranges of cells which is what a traditional spreadsheet supports 
// (although not sure I will implement all of it in this exercise)
type SpreadSheetFocus = {
    focus?: Array<CellFocusRange>,
    rowCount: number,
    columnCount: number
}

export default function SpreadSheet({ rowCount, columnCount, width}) {
    const [data, setData] = useState(getInitialSpreadSheetData(rowCount, columnCount));
    const [focus, setFocus] = useState({rowCount, columnCount} as SpreadSheetFocus);
    const [cellBeingEdited, setCellBeingEdited] = useState({} as FocusCoordinate);

    // perform a final persist on unmount
    useEffect(() => {
        return () => persistSpreadSheetData(data);
    }, [])
        
    return (
        <Box 
            className={styles.SpreadSheet} 
            width={width} 
            tabIndex={0}
            onKeyDown={(e) => {
                if (_.isNil(cellBeingEdited.rowIndex)) {
                    if (e.key.startsWith("Arrow")) {
                        setFocus(updateFocusFromKeyNavigation(focus, e.shiftKey, e.key));
                    } else if (e.key === 'Enter') {
                        setCellBeingEdited(getPrimaryFocusCell(focus));
                    }
                }
            }}
        >
            <Flex>
                {_.map(_.times(columnCount + 1), (colIndex) => {
                    return (
                        <Box className={styles.ColumnLabel} key={colIndex} bg='#f6f7f8' width={width / (columnCount + 1)}>
                            {colIndex === 0 ? '' : COL_LABELS.charAt(colIndex - 1)}
                        </Box>
                    )

                })}
            </Flex>
            {_.map(_.times(rowCount, (rowIndex) => {
                return (
                    <Flex key={rowIndex}>
                        {_.map(_.times(columnCount + 1), (columnIndex) => {
                            const value = _.get(data, `[${rowIndex}].[${columnIndex}]`);

                            // if first column then render a label cell
                            if (columnIndex === 0) {
                                return (
                                    <Box className={styles.ColumnLabel} bg='#f6f7f8' width={width / (columnCount + 1)}>
                                        <Box className={styles.InnerLabel} width={width / (columnCount + 1)}>{rowIndex}</Box>
                                    </Box>
                                )

                            }
                            const cellCoordinate: FocusCoordinate = {rowIndex, columnIndex: columnIndex-1};
                            return (
                                <SpreadSheetCell 
                                    key={columnIndex} 
                                    defaultValue={value}
                                    focused={isCellFocused(focus, cellCoordinate)}
                                    inputFocused={_.isEqual(cellBeingEdited, cellCoordinate)}
                                    onChange={(newValue: number) => {
                                        data[rowIndex][columnIndex-1] = newValue
                                        persistSpreadSheetData(data);
                                        setData(data);
                                    }}
                                    onCellFocus={(isMultiFocus: boolean) => {
                                        setFocus(getNewSpreadSheetFocus(focus, cellCoordinate, isMultiFocus));
                                    }}
                                    onInputFocus={() => {
                                        setCellBeingEdited(cellCoordinate);
                                    }}
                                    onInputUnfocus={() => {
                                        setCellBeingEdited({} as FocusCoordinate);
                                    }}
                                    onNavigationChange={(key, isMultiFocus) => {
                                        setFocus(updateFocusFromKeyNavigation(focus, isMultiFocus, key));
                                    }}
                                />
                            );
                        })}
                    </Flex>
                );
            }))}
        </Box>
    );
}

// get data from localStorage or create empty data if not found
function getInitialSpreadSheetData(rowCount: number, columnCount: number) {
    const storedData = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : undefined;

    if (_.isNil(storedData)) {
        return _.map(_.times(rowCount, () => {
            const a = [];
            a.length = columnCount;
            return a;
        }))
    }

    return JSON.parse(storedData);
}

// write data to localStorage
function persistSpreadSheetData(data): void {
    if (_.isArray(data)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
}

// returns true if the spreadsheet has any focus
function hasFocus(currentFocus: SpreadSheetFocus): boolean {
    return !_.isNil(currentFocus) && !_.isNil(currentFocus.focus);
}

// returns true if more than a single cell is focused
function hasMultiFocus(currentFocus: SpreadSheetFocus): boolean {
    return hasFocus(currentFocus) && (currentFocus.focus.length > 1 || !_.isNil(currentFocus.focus[0].end));
}

// returns the first cell of the first range
function getPrimaryFocusCell(currentFocus: SpreadSheetFocus): FocusCoordinate {
    if (hasFocus(currentFocus)) {
        return { ...currentFocus.focus[0].start };
    }
}

// called when a cell is clicked to compute the new spreadsheet focus
function getNewSpreadSheetFocus(currentFocus: SpreadSheetFocus, cellCoordinate: FocusCoordinate, isMultiFocus: boolean): SpreadSheetFocus {
    // if no current focus or not multiFocus, then focus the clicked cell 
    if (!hasFocus(currentFocus) || !isMultiFocus) {
        return { 
            ...currentFocus, 
            focus: [{start: {...cellCoordinate} }] 
        };
    } 
}

// returns true if the passed cellCoordinate is contained within the passed currentFocus
function isCellFocused(currentFocus: SpreadSheetFocus, cellCoordinate: FocusCoordinate): boolean {
    if (hasFocus(currentFocus)) {
        if (!hasMultiFocus(currentFocus)) {
            const focusedCoordinate: FocusCoordinate = currentFocus.focus[0].start;
            return _.isEqual(focusedCoordinate, cellCoordinate);
        }
    }

    return false;
}

function updateFocusFromKeyNavigation(currentFocus: SpreadSheetFocus, isMultiFocus: boolean, key: string): SpreadSheetFocus {
    const newPrimaryCell = getPrimaryFocusCell(currentFocus);

    switch (key) {
        case 'ArrowUp':
            newPrimaryCell.rowIndex = Math.max(0, newPrimaryCell.rowIndex - 1);
            break;
        case 'ArrowDown':
            newPrimaryCell.rowIndex = Math.min(currentFocus.rowCount - 1, newPrimaryCell.rowIndex + 1);
            break;
        case 'ArrowLeft':
            newPrimaryCell.columnIndex = Math.max(0, newPrimaryCell.columnIndex - 1);
            break;
        case 'ArrowRight':
            newPrimaryCell.columnIndex = Math.min(currentFocus.columnCount - 1, newPrimaryCell.columnIndex + 1);
            break;
    }

    return getNewSpreadSheetFocus(currentFocus, newPrimaryCell, isMultiFocus);
}