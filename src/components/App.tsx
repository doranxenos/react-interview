import { ChakraProvider } from '@chakra-ui/react';
import SpreadSheet from './SpreadSheet';
import React from 'react';

export default function App() {
  return (
    <ChakraProvider resetCSS>
      <SpreadSheet rowCount={10} columnCount={10} width={800}/>
    </ChakraProvider>
  );
}
