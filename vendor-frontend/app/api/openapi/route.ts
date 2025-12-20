import swaggerJSDoc from 'swagger-jsdoc';
import { NextResponse } from 'next/server';

const spec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tu API',
      version: '1.0.0'
    }
  },
  apis: ['./app/api/**/route.ts']
});

export function GET() {
  return NextResponse.json(spec);
}
