'use client';
import { useEffect, useRef } from 'react';
import { RedocStandalone } from 'redoc';

export default function ApiDocsPage() {
  return (
    <RedocStandalone
      specUrl="/api/openapi"
      options={{
        theme: { colors: { primary: { main: '#5B21B6' } } }
      }}
    />
  );
}
