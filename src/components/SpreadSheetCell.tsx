import React, {useState, useRef, useEffect} from 'react';
import styles from './SpreadSheetCell.module.sass';
import { Box, InputGroup, InputLeftAddon, NumberInput, NumberInputField } from "@chakra-ui/react"
import _ from 'lodash';

export default function SpreadSheetCell({ defaultValue, onChange, onCellFocus, onInputFocus, onInputUnfocus, onNavigationChange, focused, inputFocused }) {
    const [value, setValue] = useState(defaultValue);
    const inputRef = useRef();
    const format = (val) =>  _.isNil(val) ? '' : val;
    const parse = (val) => _.isNil(val) || _.trim(val) === '' ? null : parseFloat(val);

    useEffect(() => {
        if (inputFocused) {
            if (inputRef.current) {
                inputRef.current.children[0].focus();
            }
        }
    }, [inputFocused])
    
    return (
        <Box
            className='spreadSheetCell'
            background={focused ? '#d9edf8' : 'white'}
            onClick={(e) => {
                e.stopPropagation();
                onCellFocus();
            }}
        >
            <InputGroup 
                className={styles.InputGroup}
                // only allow clicking the input if we have focused the cell first to emulate spreadsheet behavior
                pointerEvents={focused ? null : 'none'} 
            >
                <InputLeftAddon size='sm' p='2' w='7' bg='transparent' color='#888' border='0'> 
                    {_.isFinite(value) ? '$' : ''}
                </InputLeftAddon>
                <NumberInput
                    ref={inputRef}
                    step={0}
                    variant='unstyled'
                    borderRadius="0"
                    borderLeft='0'
                    className={styles.SpreadSheetCell}
                    precision={2}            
                    defaultValue={format(value)}
                    onChange={(valueString: string) => {
                        const value = parse(valueString);
                        setValue(value);
                        onChange(value);
                    }}
                    onFocus={() => onInputFocus()}
                    onBlur={() => onInputUnfocus()}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            onNavigationChange(e.key);
                            e.preventDefault();
                            e.stopPropagation();
                            // blur the element since we are changing focus to another cell
                            if (!_.isNil(inputRef.current)) {
                                inputRef.current.children[0].blur();
                            }
                        }

                    }}
                >
                    <NumberInputField />
                </NumberInput>
            </InputGroup>
        </Box>
    )
}